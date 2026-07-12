import ast
import json
import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from services.aihub import generate_image, generate_text
from schemas.aihub import GenImgRequest, GenTxtRequest
from dependencies.auth import get_current_user

logger = logging.getLogger(__name__)

def _try_extract_message_from_dict(data: dict) -> str | None:
    """Try to extract message field from a dictionary."""
    if "error" in data and isinstance(data["error"], dict):
        if "message" in data["error"]:
            return data["error"]["message"]
        return str(data["error"])
        
    if "message" in data:
        return data["message"]
        
    return None

def _try_parse_dict(error_str: str) -> dict | None:
    """
    Try to parse a string as a dictionary.
    First attempts JSON parsing, then falls back to Python literal_eval (for single quotes).
    """
    # Try JSON parsing (double quotes format)
    try:
        data = json.loads(error_str)
        if isinstance(data, dict):
            return data
    except (json.JSONDecodeError, TypeError):
        pass

    # Try Python literal_eval (single quotes format)
    try:
        data = ast.literal_eval(error_str)
        if isinstance(data, dict):
            return data
    except (ValueError, SyntaxError, TypeError):
        pass

    return None

def extract_error_message(error: Any) -> str:
    """
    Extract a readable error message from an error object.
    Attempts to parse JSON/Python dict format and extract the message field.
    Falls back to the full error string if parsing fails.
    
    Supported formats:
    - Pure JSON: {"error": {"message": "..."}}
    - Python dict: {'error': {'message': '...'}}
    - With prefix: Error code: 400 - {'error': {'message': '...'}}
    """
    if error is None:
        return "Unknown error"
        
    # Extracted error message string
    error_str = str(error)
    
    # Try to parse the entire string directly
    error_data = _try_parse_dict(error_str)
    if error_data:
        msg = _try_extract_message_from_dict(error_data)
        if msg:
            return msg
            
    # Try to extract dict portion from string (handles "Error code: 400 - {...}" format)
    start_idx = error_str.find("{")
    end_idx = error_str.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        dict_str = error_str[start_idx:end_idx + 1]
        error_data = _try_parse_dict(dict_str)
        if error_data:
            msg = _try_extract_message_from_dict(error_data)
            if msg:
                return msg
                
    return error_str

router = APIRouter(
    prefix="/api/v1/aihub",
    tags=["aihub"],
    dependencies=[Depends(get_current_user)],
)

@router.post("/genTxt")
async def generate_text_endpoint(request: GenTxtRequest):
    """
    Generate Text endpoint (supports text and image input).
    
    Uses the `stream` parameter to control streaming behavior:
    - `stream=False`: Return a full JSON response
    - `stream=True`: Return an SSE streaming response
    
    Available models:
    - `gemini-1.5-flash`: High-speed multimodal capability, suitable for JSON output and customer service scenarios
    - `gemini-1.5-pro`: Production-grade multimodal model for daily multimodal tasks
    """
    try:
        if request.stream:
            async def event_generator():
                try:
                    async for chunk in generate_text(request):
                        yield json.dumps({"text": chunk})
                except Exception as e:
                    logger.error('AI stream failed: %s', type(e).__name__)
                    yield json.dumps({'error': 'Generation failed'})
            return EventSourceResponse(event_generator(), media_type="text/event-stream")
        else:
            # Non-streaming response
            response = await generate_text(request)
            return response
            
    except ValueError as e:
        logger.error('AI service configuration error: %s', type(e).__name__)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='AI service unavailable')
    except Exception as e:
        logger.error('Text generation failed: %s', type(e).__name__)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Generation failed')

@router.post("/genImg", response_model=Dict[str, Any])
async def generate_image_endpoint(request: GenImgRequest):
    """
    Text-to-Image / Image-to-Image endpoint.
    
    Generates images based on the given prompt.
    If `image` is provided, the endpoint uses the OpenAI-compatible `images/edits` API to edit the input image.
    
    Available models:
    - `gemini-3-flash-image`: Visual creativity and editing, marketing asset generation, partial image editing
    - `gemini-3-pro-image`: Highest quality image generation/editing
    
    Parameters:
    - prompt: Text description
    - image: Optional input image(s). Supports a base64 data URI string or a list of base64 data URIs. If provided, runs image editing.
    - size: Image size (1024x1024 / 1024x1792 / 1792x1024)
    - model: Name of the model (currently only effective for text-to-image; ignored when `image` is provided).
    - n: Number of images to generate (1-4)
    """
    try:
        return await generate_image(request)
    except ValueError as e:
        logger.error('AI service configuration error: %s', type(e).__name__)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='AI service unavailable')
    except Exception as e:
        logger.error('Image generation failed: %s', type(e).__name__)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Generation failed')
