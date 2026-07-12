from typing import List, Literal, Optional, Union
from pydantic import BaseModel, Field

# ======================= Generate Text =======================

class ImageUrl(BaseModel):
    """Image URL configuration."""
    url: str = Field(..., max_length=2_000_000, description="Image URL or base64 data URI.")

class ContentPartText(BaseModel):
    """Text content part."""
    type: str = Field(default="text", description="Content type.")
    text: str = Field(..., max_length=20_000, description="Text content.")

class ContentPartImage(BaseModel):
    """Image content part."""
    type: str = Field(default="image_url", description="Content type.")
    image_url: ImageUrl = Field(..., description="Image URL configuration.")

class ChatMessage(BaseModel):
    """Chat message format."""
    role: str = Field(..., description="Message role: system/user/assistant.")
    content: Union[str, List[Union[ContentPartText, ContentPartImage]]] = Field(
        ..., description="Message content: a string or a list of content parts (multimodal)."
    )

class GenTxtRequest(BaseModel):
    """Generate text request parameters."""
    messages: List[ChatMessage] = Field(..., min_length=1, max_length=100, description="Conversation messages list.")
    model: str = Field(
        default="gpt-5-chat / gemini-2.5-pro / claude-4-5-sonnet",
        description="Model name."
    )
    stream: bool = Field(default=False, description="Whether to enable streaming output.")
    temperature: float = Field(default=0.7, ge=0, le=2, description="Sampling temperature (0-2).")
    max_tokens: Optional[int] = Field(default=4096, ge=1, le=16_384, description="Maximum number of generated tokens.")

class GenTxtResponse(BaseModel):
    """Generate text response (non-streaming)."""
    text: str = Field(..., description="Generated text content.")
    model: str = Field(..., description="Name of the model used.")
    usage: Optional[dict] = Field(default=None, description="Token usage statistics.")


# ======================= Generate Image =======================

class GenImgRequest(BaseModel):
    """Generate image request parameters."""
    prompt: str = Field(..., min_length=1, max_length=20_000, description="Prompt for image generation.")
    image: Optional[Union[str, List[str]]] = Field(default=None, description="Optional input image(s) for editing")
    model: str = Field(default="gemini-2.5-flash-image", description="Model name.")
    size: str = Field(default="1024x1024", description="Image size.")
    n: int = Field(default=1, ge=1, le=4, description="Number of images to generate (1-4).")

class GenImgResponse(BaseModel):
    """Generate image response."""
    images: List[str] = Field(..., description="Generated image data URI list (base64).")
    model: str = Field(..., description="Name of the model used.")
    revised_prompt: Optional[str] = Field(default=None, description="Refined prompt used for generation.")
