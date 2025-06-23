import httpx
import json
from typing import Dict, Any, Optional
import asyncio
from datetime import datetime

class ApiTester:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def test_api(self, api: Dict[str, Any]) -> Dict[str, Any]:
        """Test an API endpoint"""
        start_time = datetime.now()
        
        try:
            # Prepare request
            method = api.get("method", "GET").upper()
            url = api.get("url", "")
            headers = api.get("headers", {})
            body = api.get("body")
            query_params = api.get("query_params", {})
            
            # Convert body to JSON if it's a string
            if isinstance(body, str):
                try:
                    body = json.loads(body)
                except json.JSONDecodeError:
                    pass  # Keep as string if not valid JSON
            
            # Make request
            response = await self.client.request(
                method=method,
                url=url,
                headers=headers,
                json=body if isinstance(body, (dict, list)) else None,
                data=body if isinstance(body, str) else None,
                params=query_params
            )
            
            # Calculate response time
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds()
            
            # Get response body
            try:
                response_body = response.json()
            except json.JSONDecodeError:
                response_body = response.text
            
            return {
                "success": 200 <= response.status_code < 300,
                "status_code": response.status_code,
                "response_time": response_time,
                "response_body": response_body,
                "headers": dict(response.headers)
            }
            
        except httpx.TimeoutException as e:
            return {
                "success": False,
                "error": f"Request timed out after {self.client.timeout} seconds",
                "response_time": (datetime.now() - start_time).total_seconds(),
                "status_code": None,
                "response_body": None
            }
            
        except httpx.RequestError as e:
            return {
                "success": False,
                "error": f"Request failed: {str(e)}",
                "response_time": (datetime.now() - start_time).total_seconds(),
                "status_code": None,
                "response_body": None
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}",
                "response_time": (datetime.now() - start_time).total_seconds(),
                "status_code": None,
                "response_body": None
            }
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose() 