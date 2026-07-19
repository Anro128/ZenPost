import os
import tempfile
from moviepy.editor import ColorClip, ImageClip, CompositeVideoClip
from PIL import Image
from backend.renderer.image_renderer import render_image, RenderConfig

def render_video(text: str, footer: str, config: RenderConfig, duration: int = 15, animation: str = "fade") -> str:
    """
    Renders a 1080x1920 video with text and footer.
    Uses MoviePy to compose the video.
    Returns the file path of the generated MP4.
    """
    width, height = 1080, 1920
    
    # 1. Background
    bg_color_rgb = tuple(int(config.bg_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    bg_clip = ColorClip(size=(width, height), color=bg_color_rgb, duration=duration)
    
    # 2. Text Frame as Image
    # Adjust config for video dimensions temporarily if needed, 
    # but since render_image hardcodes 1080x1350, we might need a custom render or just use it as is and center it.
    # Let's write a temporary image file for the text and footer
    video_config = config.copy()
    # we can trick render_image by modifying it, but for now we'll just render to 1080x1350 and paste it in the center.
    image_bytes = render_image(text, footer, video_config)
    
    temp_img_fd, temp_img_path = tempfile.mkstemp(suffix=".png")
    with os.fdopen(temp_img_fd, 'wb') as f:
        f.write(image_bytes)
        
    text_clip = ImageClip(temp_img_path).set_duration(duration)
    text_clip = text_clip.set_position("center")
    
    # 3. Apply Animations
    if animation == "fade":
        text_clip = text_clip.crossfadein(1.0)
    elif animation == "slide":
        text_clip = text_clip.set_position(lambda t: ('center', height - (height * min(t, 1.0))))
    
    # 4. Compose and Render
    final_clip = CompositeVideoClip([bg_clip, text_clip])
    
    output_fd, output_path = tempfile.mkstemp(suffix=".mp4")
    os.close(output_fd)
    
    final_clip.write_videofile(
        output_path, 
        fps=30, 
        codec="libx264",
        audio=False,
        preset="ultrafast",
        logger=None
    )
    
    # Clean up temp image
    os.remove(temp_img_path)
    
    return output_path
