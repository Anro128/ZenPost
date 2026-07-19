import os
import uuid
from datetime import datetime
from backend.renderer.image_renderer import render_image, RenderConfig
from backend.renderer.video_renderer import render_video
from backend.models.enums import OutputType
from backend.config import settings

class RendererService:
    async def render_content(self, text: str, footer: str, output_type: OutputType, config: RenderConfig) -> str:
        filename = f"{uuid.uuid4().hex}"
        
        if output_type == OutputType.IMAGE:
            image_bytes = render_image(text, footer, config)
            file_path = os.path.join(settings.STORAGE_PATH, "images", f"{filename}.png")
            with open(file_path, "wb") as f:
                f.write(image_bytes)
            return file_path
            
        elif output_type == OutputType.VIDEO:
            temp_path = render_video(text, footer, config, duration=15, animation="fade")
            file_path = os.path.join(settings.STORAGE_PATH, "videos", f"{filename}.mp4")
            os.rename(temp_path, file_path)
            return file_path
            
        raise ValueError("Invalid output type")

renderer_service = RendererService()
