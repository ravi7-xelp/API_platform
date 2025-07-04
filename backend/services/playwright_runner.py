import os
import re
import subprocess
from pathlib import Path
from typing import Optional
import shutil

SAFE_NAME_RE = re.compile(r'^[\w\-.]+$')

TESTS_ROOT = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../tests')))
TMP_DIR = TESTS_ROOT / 'tmp'
TMP_DIR.mkdir(parents=True, exist_ok=True)

# Step 1: Start Playwright codegen with a temp file
# Returns the temp file path

def start_code_gen(url: Optional[str] = None) -> str:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    tmp_file = TMP_DIR / 'tmp_testcase.py'
    codegen_cmd = f"npx playwright codegen --target python {url or 'http://localhost:3000'} --output {str(tmp_file)}"
    subprocess.run(codegen_cmd, shell=True)
    return str(tmp_file)

# Step 2: Move/rename the temp file to the chosen folder and name

def save_recorded_testcase(folder: str, filename: str) -> str:
    if not SAFE_NAME_RE.match(folder):
        raise ValueError('Invalid folder name')
    if not SAFE_NAME_RE.match(filename):
        raise ValueError('Invalid file name')
    tmp_file = TMP_DIR / 'tmp_testcase.py'
    if not tmp_file.exists():
        raise FileNotFoundError('No recorded test case found')
    # DEBUG: Print the generated file content
    with open(tmp_file, "r", encoding="utf-8") as f:
        print(f.read())
    folder_path = TESTS_ROOT / folder
    folder_path.mkdir(parents=True, exist_ok=True)
    dest_file = folder_path / filename
    # Convert to pytest format before saving
    convert_playwright_to_pytest(str(tmp_file), str(dest_file), test_name=filename[:-3] if filename.endswith('.py') else filename)
    tmp_file.unlink()  # Remove the original tmp file
    return str(dest_file)

def delete_testcase_file(path: str):
    try:
        os.remove(path)
    except FileNotFoundError:
        pass

def delete_folder_and_files(folder: str):
    folder_path = TESTS_ROOT / folder
    if folder_path.exists() and folder_path.is_dir():
        for file in folder_path.iterdir():
            if file.is_file():
                file.unlink()
        folder_path.rmdir()

def convert_playwright_to_pytest(input_path, output_path, test_name="test_generated"):
    import ast
    def extract_run_body_ast(code):
        tree = ast.parse(code)
        for node in tree.body:
            if isinstance(node, ast.FunctionDef) and node.name == "run":
                lines = code.splitlines()
                # AST line numbers are 1-based and inclusive
                start = node.body[0].lineno - 1
                end = node.body[-1].end_lineno
                body_lines = lines[start:end]
                # Remove leading indentation
                min_indent = min((len(line) - len(line.lstrip()) for line in body_lines if line.strip()), default=0)
                return "\n".join(line[min_indent:] for line in body_lines)
        raise ValueError("Could not find run function in Playwright file.")

    with open(input_path, "r", encoding="utf-8") as f:
        code = f.read()
    run_body = extract_run_body_ast(code)
    pytest_code = (
        "from playwright.sync_api import sync_playwright, expect\n\n"
        f"def {test_name}():\n"
        "    with sync_playwright() as playwright:\n"
    )
    pytest_code += "\n".join("        " + line if line.strip() else "" for line in run_body.splitlines())
    pytest_code += "\n"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(pytest_code) 