import asyncio
import json
import logging
import os
import traceback
from typing import Any, Dict
from urllib.parse import unquote

from mangum import Mangum
from main import app
from core.config import settings

# Configure logging
logger = logging.getLogger()
if logger.handlers:
    for handler in logger.handlers:
        logger.removeHandler(handler)

fmt = logging.Formatter('%(asctime)s - %(module)s.%(funcName)s - %(levelname)s - %(pathname)s:%(lineno)d - %(message)s')
handler = logging.StreamHandler()
handler.setFormatter(fmt)
logger.setLevel(getattr(logging, os.environ.get("LOG_LEVEL", "DEBUG").upper(), logging.DEBUG))
logger.addHandler(handler)

# Global variables for app instances
backend_app = None
mangum_handler = None
dynamic_routes_initialized = False


def cors_headers(request_headers: Dict[str, Any]) -> Dict[str, str]:
    response_headers = {'Content-Type': 'application/json'}
    origin = (request_headers.get('origin') or request_headers.get('Origin') or '').rstrip('/')
    if origin in settings.allowed_cors_origins:
        response_headers['Access-Control-Allow-Origin'] = origin
        response_headers['Vary'] = 'Origin'
    return response_headers

async def initialize_services_once():
    """Initialize all services once for the Lambda function"""
    global dynamic_routes_initialized
    
    if not dynamic_routes_initialized:
        from core.database import initialize_database, close_database
        from services.mock_data import initialize_mock_data
        from services.auth import initialize_admin_user
        
        await initialize_database()
        await initialize_mock_data()
        await initialize_admin_user()
        dynamic_routes_initialized = True

def get_mangum_handler():
    """Get or create the Mangum handler"""
    global backend_app, mangum_handler
    
    if mangum_handler is None:
        try:
            backend_app = app
            # Configure Mangum for API Gateway v2
            # lifespan="off" prevents issues with DB connections in serverless
            mangum_handler = Mangum(backend_app, lifespan="off")
        except Exception as e:
            logger.error(f"Failed to create Mangum handler: {e}\n{traceback.format_exc()}")
            raise
            
    return mangum_handler

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """AWS Lambda handler function that simulates Nginx routing"""
    headers: Dict[str, Any] = {}
    try:
        # Extract request information from the event
        # Support both API Gateway v1 and v2 event formats
        headers = event.get("headers", {})
        query_params = event.get("queryStringParameters", {})
        
        # API Gateway v2 format
        if "rawPath" in event:
            path = event.get("rawPath", "/")
            method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
        # API Gateway v1 format
        else:
            path = event.get("path", "/")
            method = event.get("httpMethod", "GET")
            
        try:
            path = unquote(path, encoding="utf-8")
        except Exception as e:
            logger.warning(f"Failed to decode path: {e}")
            
        # Normalize path
        if not path.startswith("/"):
            path = "/" + path
            
        # Route API requests to backend
        if path.startswith("/api/"):
            return handle_backend_request(event, context)
            
        # Handle health check
        if path == "/health":
            return {
                "statusCode": 200,
                "headers": cors_headers(headers),
                "body": json.dumps({"status": "healthy"})
            }
            
        # Route to frontend (SPA) - All other paths go to frontend
        return serve_frontend(path)
        
    except Exception as e:
        logger.error('Lambda handler error: %s', type(e).__name__, exc_info=True)
        return {
            "statusCode": 500,
            "headers": cors_headers(headers),
            "body": json.dumps({"error": "Internal server error"})
        }

def handle_backend_request(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Handle backend requests using Mangum"""
    # Initialize services if not already done
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If loop is running, we can't use run_until_complete
            # In a lambda context, this usually means we're in a thread
            pass
        else:
             loop.run_until_complete(initialize_services_once())
    except RuntimeError:
        # Event loop exists, create a new one
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(initialize_services_once())
        
    # Get or create Mangum handler
    handler = get_mangum_handler()
    
    # Call Mangum handler
    result = handler(event, context)
    return result

def serve_frontend(path: str) -> Dict[str, Any]:
    """Serve the frontend SPA"""
    try:
        # Map file extensions to content types
        content_types = {
            ".js": "application/javascript",
            ".css": "text/css",
            ".html": "text/html",
            ".json": "application/json",
            ".jpg": "image/jpeg",
            ".png": "image/png",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon"
        }
        
        # In a real deployed Lambda, you would serve the static files from S3 
        # or load the dist/index.html bundled with the deployment package.
        # For this template, we return a fallback HTML
        
        html_content = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PAUDC 2026 App</title>
        </head>
        <body>
            <div id="root">
                <h1>Service successfully deployed!</h1>
                <p>Backend API is available at /api/v1/</p>
            </div>
        </body>
        </html>
        """
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "text/html"
            },
            "body": html_content
        }
    except Exception as e:
        logger.error(f"Error serving frontend: {e}")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "text/plain"},
            "body": "Internal Server Error"
        }
