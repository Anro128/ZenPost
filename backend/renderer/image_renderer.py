import io
from PIL import Image, ImageDraw
from pydantic import BaseModel
from backend.models.enums import TemplateLayout, TextAlign, VerticalAlign
from backend.renderer.typography import load_font, calculate_best_font_size

class RenderConfig(BaseModel):
    width: int = 1080
    height: int = 1350
    layout: TemplateLayout = TemplateLayout.CENTERED
    font_family: str = "Inter"
    font_size: int = 48
    font_weight: int = 700
    text_color: str = "#000000"
    bg_color: str = "#FFFFFF"
    padding_x: int = 120
    padding_y: int = 160
    line_height: float = 1.4
    text_align: TextAlign = TextAlign.CENTER
    vertical_align: VerticalAlign = VerticalAlign.CENTER
    footer_font_size: int = 20
    footer_color: str = "#999999"

def render_image(text: str, footer: str, config: RenderConfig) -> bytes:
    width, height = config.width, config.height
    img = Image.new("RGB", (width, height), color=config.bg_color)
    draw = ImageDraw.Draw(img)
    
    max_w = width - (config.padding_x * 2)
    max_h = height - (config.padding_y * 2) - 100 # reserve 100px for footer
    
    # Respect exact template font_size (default 48px) for balanced aesthetic typography
    target_start_size = config.font_size if (config.font_size and config.font_size > 0) else 48
    
    font, lines, total_text_height = calculate_best_font_size(
        text, config.font_family, config.font_weight, max_w, max_h, 
        start_size=target_start_size, min_size=18, line_height_mult=config.line_height
    )
    
    # Calculate starting Y based on vertical alignment
    if config.layout == TemplateLayout.TOP_ALIGNED or config.vertical_align == VerticalAlign.TOP:
        start_y = config.padding_y
    elif config.vertical_align == VerticalAlign.BOTTOM:
        start_y = height - config.padding_y - 100 - total_text_height
    else: # CENTER
        start_y = (height - total_text_height - 100) // 2
        
    bbox = font.getbbox("A")
    line_h = (bbox[3] - bbox[1]) * config.line_height
    
    current_y = start_y
    for line in lines:
        line_w = draw.textlength(line, font=font)
        
        if config.text_align == TextAlign.LEFT:
            x = config.padding_x
        elif config.text_align == TextAlign.RIGHT:
            x = width - config.padding_x - line_w
        else: # CENTER
            x = (width - line_w) // 2
            
        draw.text((x, current_y), line, fill=config.text_color, font=font)
        current_y += line_h
        
    # Draw footer
    if footer:
        footer_font = load_font(config.font_family, 400, config.footer_font_size)
        footer_w = draw.textlength(footer, font=footer_font)
        footer_x = (width - footer_w) // 2
        footer_y = height - max(60, config.padding_y // 2)
        draw.text((footer_x, footer_y), footer, fill=config.footer_color, font=footer_font)
        
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()
