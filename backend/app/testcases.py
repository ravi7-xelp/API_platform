from fastapi import APIRouter, Depends, HTTPException, Body, Request
from sqlalchemy.orm import Session
from .database import get_db
from .models import TestCase, TestCaseSchema, Folder, TestCaseResult, TestCaseResultSchema
from typing import List, Optional
from services.playwright_runner import start_code_gen, save_recorded_testcase, delete_testcase_file
import os

router = APIRouter()

@router.get("/testcases/results")
def list_testcase_results(db: Session = Depends(get_db)):
    results = (
        db.query(
            TestCaseResult.id,
            TestCaseResult.test_case_id,
            TestCaseResult.folder_id,
            TestCaseResult.status,
            TestCaseResult.reason,
            TestCaseResult.stdout,
            TestCaseResult.stderr,
            TestCaseResult.created_at,
            TestCase.name.label("test_case_name"),
            Folder.name.label("folder_name"),
        )
        .join(TestCase, TestCaseResult.test_case_id == TestCase.id)
        .join(Folder, TestCaseResult.folder_id == Folder.id)
        .all()
    )
    return [
        {
            "id": r.id,
            "test_case_id": r.test_case_id,
            "folder_id": r.folder_id,
            "status": r.status,
            "reason": r.reason,
            "stdout": r.stdout,
            "stderr": r.stderr,
            "created_at": r.created_at,
            "test_case_name": r.test_case_name,
            "folder_name": r.folder_name,
        }
        for r in results
    ]

@router.delete("/testcases/results")
def clear_testcase_results(db: Session = Depends(get_db)):
    db.query(TestCaseResult).delete()
    db.commit()
    return {"detail": "All test case results deleted"}

@router.post("/testcases/record")
async def record_testcase(request: Request):
    try:
        data = await request.json()
    except Exception:
        data = {}
    url = data.get('url', None)
    tmp_file = start_code_gen(url)
    if not os.path.exists(tmp_file):
        raise HTTPException(status_code=500, detail="No test case was recorded.")
    return {"detail": "Recording complete. Ready to save."}

@router.post("/testcases/save", response_model=TestCaseSchema)
def save_testcase(
    name: str = Body(...),
    folder_id: int = Body(...),
    db: Session = Depends(get_db)
):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    filename = name if name.endswith('.py') else f"{name}.py"
    try:
        file_path = save_recorded_testcase(folder.name, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    if not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail=f"Test case file was not created: {file_path}")
    # Read the code from the saved file
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()
    # Always use forward slashes in DB
    path = f"{folder.name}/{filename}"
    testcase = TestCase(name=name, folder_id=folder_id, path=path, code=code)
    db.add(testcase)
    db.commit()
    print(f"Saved testcase: {testcase} in DB at {os.path.abspath(db.bind.url.database)}")
    db.refresh(testcase)
    return testcase

@router.get("/testcases", response_model=List[TestCaseSchema])
def list_testcases(db: Session = Depends(get_db)):
    return db.query(TestCase).all()

@router.delete("/testcases/{testcase_id}")
def delete_testcase(testcase_id: int, db: Session = Depends(get_db)):
    testcase = db.query(TestCase).filter(TestCase.id == testcase_id).first()
    if not testcase:
        raise HTTPException(status_code=404, detail="Test case not found")
    delete_testcase_file(os.path.join('backend/tests', testcase.path))
    db.delete(testcase)
    db.commit()
    return {"detail": "Test case deleted"}

@router.post("/testcases/run")
def run_testcases(testcase_ids: List[int] = Body(...), db: Session = Depends(get_db)):
    # Fetch test cases from DB
    testcases = db.query(TestCase).filter(TestCase.id.in_(testcase_ids)).all()
    if not testcases:
        raise HTTPException(status_code=404, detail="No test cases found")
    import tempfile
    import subprocess
    import re
    from datetime import datetime
    temp_files = []
    results = []
    try:
        for tc in testcases:
            if not tc.code:
                raise HTTPException(status_code=400, detail=f"Test case {tc.name} has no code saved.")
            # Write code to a temp file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.py', mode='w', encoding='utf-8')
            temp_file.write(tc.code)
            temp_file.close()
            temp_files.append((temp_file.name, tc))
        for temp_file, tc in temp_files:
            # Write a minimal pytest.ini to the temp file's directory
            temp_dir = os.path.dirname(temp_file)
            pytest_ini_path = os.path.join(temp_dir, 'pytest.ini')
            with open(pytest_ini_path, 'w') as f:
                f.write('[pytest]\n')
            import shutil
            env = os.environ.copy()
            env["PYTEST_DISABLE_PLUGIN_AUTOLOAD"] = "1"
            result = subprocess.run(
                [
                    "pytest",
                    temp_file,
                    "--rootdir", temp_dir,
                    "-c", pytest_ini_path
                ],
                capture_output=True,
                text=True,
                cwd=temp_dir,
                env=env
            )
            # Debug: print output for diagnosis
            print(f"Pytest stdout for {tc.name}:\n{result.stdout}")
            print(f"Pytest stderr for {tc.name}:\n{result.stderr}")
            # Determine pass/fail from returncode or output
            status = "pass" if result.returncode == 0 else "fail"
            reason = None
            # Check for 'collected 0 items' and treat as a warning, not a fail
            if 'collected 0 items' in result.stdout:
                status = "warning"
                reason = "No tests were collected in this file. Ensure your test function/class is named with 'test_'."
            elif status == "fail":
                # Try to extract the first error message from pytest output
                match = re.search(r'FAILED.*?\n(.*?)\n', result.stdout, re.DOTALL)
                if match:
                    reason = match.group(1).strip()
                else:
                    reason = result.stderr.strip()[:500]  # fallback, limit length
            # Save result to DB
            testcase_result = TestCaseResult(
                test_case_id=tc.id,
                folder_id=tc.folder_id,
                status=status,
                reason=reason,
                stdout=result.stdout,
                stderr=result.stderr,
                created_at=datetime.utcnow()
            )
            db.add(testcase_result)
            db.commit()
            db.refresh(testcase_result)
            results.append({
                "test_case_id": tc.id,
                "folder_id": tc.folder_id,
                "status": status,
                "reason": reason,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "created_at": testcase_result.created_at
            })
        return {"results": results}
    finally:
        # Clean up temp files
        for temp_file, _ in temp_files:
            try:
                os.remove(temp_file)
            except Exception:
                pass

@router.post("/testcases/repair-paths")
def repair_testcase_paths(db: Session = Depends(get_db)):
    testcases = db.query(TestCase).all()
    updated = []
    for tc in testcases:
        # If path is just a filename or just a folder, fix it
        parts = tc.path.replace("\\", "/").split("/")
        if len(parts) == 1:
            # Only filename, need folder
            folder = tc.folder.name if tc.folder else "test"
            filename = parts[0]
            if not filename.endswith('.py'):
                filename += '.py'
            new_path = f"{folder}/{filename}"
        elif len(parts) == 2:
            folder, filename = parts
            if not filename.endswith('.py'):
                filename += '.py'
            new_path = f"{folder}/{filename}"
        else:
            # Already correct or deeply nested, skip
            continue
        if tc.path != new_path:
            tc.path = new_path
            updated.append(tc.id)
    db.commit()
    return {"updated": updated, "detail": f"Repaired {len(updated)} test case paths."} 