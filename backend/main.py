import multiprocessing

from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, Response, StreamingResponse
import json
from typing import List, Dict, Any
import uuid
from services.api_tester import ApiTester
import asyncio
import httpx
import matplotlib.pyplot as plt
import io
from datetime import datetime
import jinja2
import os
import base64
import xml.etree.ElementTree as ET
import subprocess
import threading
import time
import shlex
from app import folders, testcases

app = FastAPI(title="API Testing Automation Platform")
app.include_router(folders.router, prefix="/api")
app.include_router(testcases.router, prefix="/api")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for APIs (replace with database in production)
apis: List[Dict[str, Any]] = []
api_tester = ApiTester()

# Store process and stats globally (for demo; use a better store in prod)
loadtest_process = None
loadtest_stats = {}
loadtest_running = False

def parse_burp_xml(xml_content: str) -> List[Dict[str, Any]]:
    """Parse Burp Suite XML export format"""
    try:
        print("Starting XML parsing...")
        root = ET.fromstring(xml_content)
        print(f"XML root tag: {root.tag}")
        items = []
        
        for item in root.findall('.//item'):
            print(f"Processing item: {item}")
            request = item.find('request')
            response = item.find('response')
            
            if request is None or response is None:
                print(f"Skipping item - missing request or response: {item}")
                continue
            
            # Parse request
            request_text = request.text
            if request.get('base64') == 'true':
                try:
                    request_text = base64.b64decode(request_text).decode('utf-8')
                except Exception as e:
                    print(f"Error decoding base64 request: {e}")
                    continue
            
            # Parse response
            response_text = response.text
            if response.get('base64') == 'true':
                try:
                    response_text = base64.b64decode(response_text).decode('utf-8')
                except Exception as e:
                    print(f"Error decoding base64 response: {e}")
                    continue
            
            # Parse request headers and body
            try:
                request_lines = request_text.split('\n')
                if not request_lines:
                    print("Empty request lines")
                    continue
                    
                first_line = request_lines[0]
                if not first_line:
                    print("Empty first line")
                    continue
                    
                parts = first_line.split(' ')
                if len(parts) < 3:
                    print(f"Invalid first line format: {first_line}")
                    continue
                    
                method, path, _ = parts
                headers = {}
                body = None
                body_started = False
                
                for line in request_lines[1:]:
                    if not line.strip():
                        body_started = True
                        continue
                        
                    if not body_started:
                        if ':' in line:
                            key, value = line.split(':', 1)
                            headers[key.strip()] = value.strip()
                    else:
                        if body is None:
                            body = line
                        else:
                            body += '\n' + line
                
                items.append({
                    'request': {
                        'method': method,
                        'url': item.find('url').text,
                        'headers': headers,
                        'body': body
                    },
                    'response': {
                        'status_code': int(item.find('status').text),
                        'headers': {},  # You can parse response headers if needed
                        'body': response_text
                    }
                })
            except Exception as e:
                print(f"Error processing request/response: {e}")
                continue
        
        print(f"Successfully parsed {len(items)} items")
        return items
    except Exception as e:
        print(f"Error parsing XML: {e}")
        raise

def convert_burp_to_api(burp_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert Burp Suite HTTP history format to our API format"""
    request = burp_data.get('request', {})
    response = burp_data.get('response', {})
    
    return {
        "id": str(uuid.uuid4()),
        "name": request.get('url', '').split('/')[-1] or 'Unnamed API',
        "url": request.get('url', ''),
        "method": request.get('method', 'GET'),
        "headers": request.get('headers', {}),
        "body": request.get('body'),
        "query_params": {},  # You can parse query params from URL if needed
        "status": "pending",
        "test_results": None,
        "original_request": request,
        "original_response": response
    }

@app.post("/apis/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")
            
        file_content = content.decode('utf-8')
        print(f"File content type: {type(file_content)}")
        print(f"File content length: {len(file_content)}")
        print(f"First 100 characters: {file_content[:100]}")
        
        uploaded_apis = []
        
        # parse as XML first
        if file.filename.endswith('.xml'):
            print("Attempting to parse as XML...")
            try:
                data = parse_burp_xml(file_content)
                print(f"Successfully parsed XML with {len(data)} items")
                for item in data:
                    api = convert_burp_to_api(item)
                    apis.append(api)
                    uploaded_apis.append(api)
                # Do NOT run tests here, just return pending APIs
                return {
                    "message": "XML file uploaded and APIs parsed (pending)",
                    "apis": apis,
                    "uploaded_apis": uploaded_apis,
                    "status_summary": {
                        "pending": len([api for api in apis if api["status"] == "pending"]),
                        "running": len([api for api in apis if api["status"] == "running"]),
                        "completed": len([api for api in apis if api["status"] == "completed"]),
                        "failed": len([api for api in apis if api["status"] == "failed"])
                    }
                }
            except ET.ParseError as e:
                print(f"XML parse error: {e}")
                raise HTTPException(status_code=400, detail=f"Invalid File format: {str(e)}")
            except Exception as e:
                print(f"Error processing XML: {e}")
                raise HTTPException(status_code=400, detail=f"Error processing XML file: {str(e)}")
        
        # Try to parse as JSON
        try:
            data = json.loads(file_content)
            if isinstance(data, list):
                for item in data:
                    if 'request' in item:  # Burp Suite format
                        api = convert_burp_to_api(item)
                    else:  # Our format
                        api = {
                            "id": str(uuid.uuid4()),
                            "name": item.get("name", ""),
                            "url": item.get("url", ""),
                            "method": item.get("method", "GET"),
                            "headers": item.get("headers", {}),
                            "body": item.get("body"),
                            "query_params": item.get("query_params", {}),
                            "status": "pending",
                            "test_results": None
                        }
                    apis.append(api)
                    uploaded_apis.append(api)
            else:
                if 'request' in data:  # Burp Suite format
                    api = convert_burp_to_api(data)
                else:  # Our format
                    api = {
                        "id": str(uuid.uuid4()),
                        "name": data.get("name", ""),
                        "url": data.get("url", ""),
                        "method": data.get("method", "GET"),
                        "headers": data.get("headers", {}),
                        "body": data.get("body"),
                        "query_params": data.get("query_params", {}),
                        "status": "pending",
                        "test_results": None
                    }
                apis.append(api)
                uploaded_apis.append(api)
            # Do NOT run tests here, just return pending APIs
            return {
                "message": "JSON file uploaded and APIs parsed (pending)",
                "apis": apis,
                "uploaded_apis": uploaded_apis,
                "status_summary": {
                    "pending": len([api for api in apis if api["status"] == "pending"]),
                    "running": len([api for api in apis if api["status"] == "running"]),
                    "completed": len([api for api in apis if api["status"] == "completed"]),
                    "failed": len([api for api in apis if api["status"] == "failed"])
                }
            }
            
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid file format. Please upload a valid XML or JSON file")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/apis/run-all")
async def run_all_apis():
    """Run all APIs in parallel"""
    results = []
    
    # Create tasks for all APIs that are not running
    tasks = []
    for api in apis:
        if api["status"] != "running":
            # Update status to running
            api["status"] = "running"
            
            # Create task for running the test
            task = asyncio.create_task(api_tester.test_api(api))
            tasks.append((api, task))
    
    # Wait for all tasks to complete
    for api, task in tasks:
        try:
            test_result = await task
            
            # Update API with test results
            if test_result.get("error"):
                api["status"] = "failed"
            else:
                api["status"] = "completed" if test_result.get("success", False) else "failed"
            
            api["test_results"] = test_result
            
            results.append({
                "api_id": api["id"],
                "name": api["name"],
                "status": api["status"],
                "result": test_result
            })
        except Exception as e:
            api["status"] = "failed"
            api["test_results"] = {
                "error": str(e),
                "success": False,
                "response_time": 0,
                "status_code": None,
                "response_body": None
            }
            results.append({
                "api_id": api["id"],
                "name": api["name"],
                "status": "failed",
                "error": str(e)
            })
    
    return {
        "message": "All tests completed",
        "results": results,
        "apis": apis,
        "status_summary": {
            "pending": len([api for api in apis if api["status"] == "pending"]),
            "running": len([api for api in apis if api["status"] == "running"]),
            "completed": len([api for api in apis if api["status"] == "completed"]),
            "failed": len([api for api in apis if api["status"] == "failed"])
        }
    }

@app.post("/apis/{api_id}/performance")
async def run_performance_test(api_id: str, num_requests: int = 10):
    """Run performance test for a specific API"""
    api = next((a for a in apis if a["id"] == api_id), None)
    if not api:
        raise HTTPException(status_code=404, detail="API not found")
    
    results = []
    for _ in range(num_requests):
        result = await api_tester.test_api(api)
        results.append(result)
    
    # Calculate performance metrics
    response_times = [r["response_time"] for r in results]
    success_count = sum(1 for r in results if r["success"])
    
    metrics = {
        "avg_response_time": sum(response_times) / len(response_times),
        "min_response_time": min(response_times),
        "max_response_time": max(response_times),
        "success_rate": (success_count / num_requests) * 100,
        "total_requests": num_requests,
        "successful_requests": success_count
    }
    
    return {
        "message": "Performance test completed",
        "metrics": metrics,
        "results": results
    }

@app.get("/apis/report")
async def view_test_report():
    try:
        # Generate HTML content with fixed CSS
        html_content = f"""
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>API Test Report</title>
            <link href='https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' rel='stylesheet'>
            <style>
                :root {{
                    --bg-main: #181a20;
                    --bg-card: #23262f;
                    --bg-header: linear-gradient(90deg, #6366f1 0%, #60a5fa 100%);
                    --text-main: #f3f4f6;
                    --text-secondary: #a1a1aa;
                    --accent: #6366f1;
                    --accent2: #60a5fa;
                    --success: #22d3ee;
                    --fail: #f87171;
                    --pending: #fbbf24;
                    --running: #38bdf8;
                }}
                body {{
                    font-family: 'Roboto', Arial, sans-serif;
                    margin: 0;
                    background: var(--bg-main);
                    color: var(--text-main);
                }}
                .container {{
                    max-width: 900px;
                    margin: 40px auto;
                    background: var(--bg-card);
                    border-radius: 18px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
                    padding: 40px 32px 32px 32px;
                }}
                .header {{
                    background: var(--bg-header);
                    color: #fff;
                    border-radius: 12px;
                    padding: 32px 24px 24px 24px;
                    box-shadow: 0 4px 16px 0 rgba(99, 102, 241, 0.12);
                    margin-bottom: 32px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0 0 8px 0;
                    font-size: 2.5rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                }}
                .header p {{
                    margin: 0;
                    font-size: 1.1rem;
                    opacity: 0.95;
                }}
                .summary-table {{
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 8px;
                    margin-bottom: 32px;
                }}
                .summary-table th, .summary-table td {{
                    padding: 12px 18px;
                    background: #23262f;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    color: var(--text-main);
                }}
                .summary-table th {{
                    background: var(--accent);
                    color: #fff;
                    font-weight: 700;
                }}
                .badge {{
                    display: inline-block;
                    padding: 4px 14px;
                    border-radius: 999px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }}
                .badge-success {{ background: #134e4a; color: var(--success); border: 1px solid var(--success); }}
                .badge-failed {{ background: #7f1d1d; color: var(--fail); border: 1px solid var(--fail); }}
                .badge-running {{ background: #0e7490; color: var(--running); border: 1px solid var(--running); }}
                .badge-pending {{ background: #78350f; color: var(--pending); border: 1px solid var(--pending); }}
                .api-card {{
                    background: #23262f;
                    border-radius: 14px;
                    box-shadow: 0 2px 8px 0 rgba(99, 102, 241, 0.07);
                    margin-bottom: 28px;
                    padding: 28px 24px 20px 24px;
                    transition: box-shadow 0.2s;
                    border: 1px solid #262a35;
                }}
                .api-card:hover {{
                    box-shadow: 0 6px 24px 0 rgba(99, 102, 241, 0.13);
                }}
                .api-title {{
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: var(--accent2);
                    margin-bottom: 6px;
                }}
                .api-meta {{
                    font-size: 1rem;
                    color: var(--text-secondary);
                    margin-bottom: 10px;
                }}
                .api-status {{
                    margin-bottom: 12px;
                }}
                .test-results-table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }}
                .test-results-table th, .test-results-table td {{
                    padding: 10px 12px;
                    border-bottom: 1px solid #353945;
                    font-size: 1rem;
                }}
                .test-results-table th {{
                    background: #232262;
                    color: var(--accent2);
                    font-weight: 700;
                }}
                .test-results-table td {{
                    background: #181a20;
                    color: var(--text-main);
                }}
                h2 {{
                    color: var(--accent2);
                    margin-bottom: 18px;
                    font-size: 1.5rem;
                    font-weight: 700;
                }}
                @media (max-width: 600px) {{
                    .container {{ padding: 10px; }}
                    .header {{ padding: 18px 8px; }}
                    .api-card {{ padding: 14px 8px; }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>API Test Report</h1>
                    <p>Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
                <table class="summary-table">
                    <tr>
                        <th>Total APIs</th>
                        <th>Completed</th>
                        <th>Failed</th>
                        <th>Running</th>
                        <th>Pending</th>
                    </tr>
                    <tr>
                        <td>{len(apis)}</td>
                        <td><span class="badge badge-success">{len([api for api in apis if api['status'] == 'completed'])}</span></td>
                        <td><span class="badge badge-failed">{len([api for api in apis if api['status'] == 'failed'])}</span></td>
                        <td><span class="badge badge-running">{len([api for api in apis if api['status'] == 'running'])}</span></td>
                        <td><span class="badge badge-pending">{len([api for api in apis if api['status'] == 'pending'])}</span></td>
                    </tr>
                </table>
                <div class="details">
                    <h2>API Details</h2>
                    {''.join(f"""
                    <div class='api-card'>
                        <div class='api-title'>{api['name']}</div>
                        <div class='api-meta'><b>URL:</b> {api['url']} &nbsp; | &nbsp; <b>Method:</b> {api['method']}</div>
                        <div class='api-status'>
                            <span class='badge badge-{api['status']}'>{api['status'].capitalize()}</span>
                        </div>
                        {f'''
                        <div class="test-results">
                            <h4 style="color:var(--accent2); margin-bottom:8px;">Test Results</h4>
                            <table class="test-results-table">
                                <tr>
                                    <th>Status Code</th>
                                    <th>Response Time</th>
                                    <th>Success</th>
                                </tr>
                                <tr>
                                    <td>{api['test_results'].get('status_code', 'N/A')}</td>
                                    <td>{api['test_results'].get('response_time', 'N/A')} ms</td>
                                    <td><span class="badge {('badge-success' if api['test_results'].get('success') else 'badge-failed')}">{'Yes' if api['test_results'].get('success') else 'No'}</span></td>
                                </tr>
                            </table>
                        </div>
                        ''' if api.get('test_results') else ''}
                    </div>
                    """ for api in apis)}
                </div>
            </div>
        </body>
        </html>
        """
        # Return HTML for direct viewing
        return Response(
            content=html_content,
            media_type="text/html"
        )
    except Exception as e:
        print(f"Error generating report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )

@app.post("/apis/{api_id}/run")
async def run_api_test(api_id: str):
    """Run a test for a specific API"""
    # Find the API
    api = next((a for a in apis if a["id"] == api_id), None)
    if not api:
        raise HTTPException(status_code=404, detail="API not found")
    
    try:
        # Update status to running
        api["status"] = "running"
        
        # Run the test
        test_result = await api_tester.test_api(api)
        
        # Update API with test results
        if test_result.get("error"):
            api["status"] = "failed"
            api["test_results"] = test_result
            return {
                "message": "Test failed",
                "api": api,
                "result": test_result
            }
        
        # Update status based on test result
        api["status"] = "completed" if test_result.get("success", False) else "failed"
        api["test_results"] = test_result
        
        return {
            "message": "Test completed",
            "api": api,
            "result": test_result
        }
    except Exception as e:
        # Update status to failed if there's an error
        api["status"] = "failed"
        api["test_results"] = {
            "error": str(e),
            "success": False,
            "response_time": 0,
            "status_code": None,
            "response_body": None
        }
        return {
            "message": f"Test failed: {str(e)}",
            "api": api,
            "result": api["test_results"]
        }

@app.get("/apis")
async def get_apis():
    """Get all APIs with their current status and test results"""
    try:
        # Return a structured response with metadata
        return {
            "total": len(apis),
            "apis": apis,
            "status_summary": {
                "pending": len([api for api in apis if api["status"] == "pending"]),
                "running": len([api for api in apis if api["status"] == "running"]),
                "completed": len([api for api in apis if api["status"] == "completed"]),
                "failed": len([api for api in apis if api["status"] == "failed"])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving APIs: {str(e)}")

@app.get("/apis/{api_id}")
async def get_api(api_id: str):
    api = next((a for a in apis if a["id"] == api_id), None)
    if not api:
        raise HTTPException(status_code=404, detail="API not found")
    return api

@app.get("/test-results")
async def get_test_results():
    return apis

@app.on_event("shutdown")
async def shutdown_event():
    await api_tester.close()

@app.get("/")
async def root():
    return {"message": "Welcome to API Testing Automation Platform"}

import json
from urllib.parse import urlparse

def write_locustfile(api_url, method, headers, body):
    parsed_url = urlparse(api_url)
    relative_path = parsed_url.path or "/"
    if parsed_url.query:
        relative_path += "?" + parsed_url.query

    with open("locustfile.py", "w") as f:
        f.write(f"""
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(0.5, 1.5)

    @task
    def my_task(self):
        self.client.request(
            "{method.upper()}",
            "{relative_path}",
            headers={json.dumps(headers)},
            data={json.dumps(body) if body else 'None'}
        )
""")

from urllib.parse import urlparse
import subprocess

def run_locust(api_url, method, users, total_requests, headers, body):
    write_locustfile(api_url, method, headers, body)

    # ✅ Extract the host for Locust
    parsed_url = urlparse(api_url)
    host = f"{parsed_url.scheme}://{parsed_url.netloc}"
    cmd = [
        "locust",
        "-f", "locustfile.py",
        "--headless",
        "-u", str(users),
        "-r", str(users),
        "--run-time", "10m",        # ⬅️ You can change based on total_requests
        "--host", host,             # ✅ ADD THIS -- critical fix
        "--csv", "loadtest_stats",
        "--csv-full-history"
    ]

    subprocess.Popen(cmd)

    global loadtest_process, loadtest_running
    loadtest_running = True
    loadtest_process = subprocess.Popen(cmd)
    loadtest_process.wait()
    loadtest_running = False

@app.post("/loadtest/start")
async def start_loadtest(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    api_url = data["url"]
    method = data.get("method", "GET")
    users = int(data.get("concurrent_users", 1))
    total_requests = int(data.get("total_requests", 10))
    headers = data.get("headers", {})
    body = data.get("body", None)
    background_tasks.add_task(run_locust, api_url, method, users, total_requests, headers, body)
    return {"status": "started"}

@app.post("/loadtest/stop")
async def stop_loadtest():
    global loadtest_process, loadtest_running
    if loadtest_process and loadtest_running:
        loadtest_process.terminate()
        loadtest_running = False
        return {"status": "stopped"}
    return {"status": "no test running"}

@app.get("/loadtest/status")
async def loadtest_status():
    # Read stats from CSV (or use Locust's REST API if running in distributed mode)
    try:
        with open("loadtest_stats_stats_history.csv") as f:
            lines = f.readlines()
            if len(lines) > 1:
                last = lines[-1].strip().split(",")
                return {
                    "requests_per_second": last[2],
                    "avg_response_time": last[5],
                    "min_response_time": last[6],
                    "max_response_time": last[7],
                    "failures": last[4],
                    "total_requests": last[1],
                }
    except Exception:
        pass
    return {}

@app.get("/loadtest/report")
async def loadtest_report(format: str = "json"):
    # Return the final CSV or JSON report
    if format == "csv":
        with open("loadtest_stats_stats_history.csv", "rb") as f:
            return StreamingResponse(f, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=loadtest_report.csv"})
    else:
        # Parse CSV to JSON
        import csv
        with open("loadtest_stats_stats_history.csv") as f:
            reader = csv.DictReader(f)
            data = list(reader)
        return JSONResponse(data)

def parse_curl_command(curl_command: str) -> Dict[str, Any]:
    """Parse a cURL command string into an API dict."""
    tokens = shlex.split(curl_command)
    if not tokens or tokens[0].lower() != 'curl':
        raise ValueError('Not a valid cURL command')
    
    method = 'GET'
    url = ''
    headers = {}
    body = None
    i = 1
    while i < len(tokens):
        token = tokens[i]
        if token in ['-X', '--request']:
            i += 1
            method = tokens[i].upper()
        elif token in ['-H', '--header']:
            i += 1
            header = tokens[i]
            if ':' in header:
                k, v = header.split(':', 1)
                headers[k.strip()] = v.strip()
        elif token in ['-d', '--data', '--data-raw', '--data-binary', '--data-ascii']:
            i += 1
            body = tokens[i]
            if method == 'GET':
                method = 'POST'
        elif not token.startswith('-') and not url:
            url = token
        i += 1
    if not url:
        raise ValueError('No URL found in cURL command')
    return {
        "id": str(uuid.uuid4()),
        "name": url.split('/')[-1] or 'Unnamed API',
        "url": url,
        "method": method,
        "headers": headers,
        "body": body,
        "query_params": {},
        "status": "pending",
        "test_results": None
    }

@app.post("/apis/upload-curl")
async def upload_curl(request: Request):
    data = await request.json()
    curl_command = data.get('curl')
    if not curl_command:
        raise HTTPException(status_code=400, detail="Missing 'curl' in request body")
    try:
        api = parse_curl_command(curl_command)
        apis.append(api)
        # Do NOT run test here, just return pending API
        return {
            "message": "cURL command parsed, API added (pending)",
            "api": api,
            "apis": apis
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse cURL: {str(e)}")

@app.delete("/apis/delete-all")
async def delete_all_apis():
    global apis
    apis = []
    return {"message": "All APIs deleted successfully"}

@app.delete("/apis/{api_id}")
async def delete_api(api_id: str):
    global apis
    initial_count = len(apis)
    apis = [api for api in apis if api["id"] != api_id]
    if len(apis) == initial_count:
        raise HTTPException(status_code=404, detail="API not found")
    return {"message": "API deleted successfully", "api_id": api_id}

app.include_router(folders.router, prefix="/api")
app.include_router(testcases.router, prefix="/api")

@app.get("/debug/routes")
def list_routes():
    from fastapi.routing import APIRoute
    return [
        {"path": route.path, "methods": list(route.methods)}
        for route in app.routes if hasattr(route, 'methods')
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)