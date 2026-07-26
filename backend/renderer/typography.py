from PIL import Image, ImageDraw, ImageFont
import os
from typing import List, Tuple, Any

def get_font_path(font_family: str, weight: Any) -> str:
    try:
        w_int = int(weight)
    except (ValueError, TypeError):
        w_int = 400

    fonts_dir = os.path.join(os.path.dirname(__file__), "fonts")
    base = "Inter-Regular.ttf"
    if w_int >= 700:
        base = "Inter-Bold.ttf"
        
    path = os.path.join(fonts_dir, base)
    if not os.path.exists(path):
        # Fallback to Windows arial if Inter is not downloaded
        arial_path = r"C:\Windows\Fonts\arial.ttf"
        if w_int >= 700:
            arial_path = r"C:\Windows\Fonts\arialbd.ttf"
        
        if os.path.exists(arial_path):
            return arial_path
            
        return ""
    return path

def load_font(font_family: str, weight: Any, size: int) -> ImageFont.FreeTypeFont:
    path = get_font_path(font_family, weight)
    try:
        if path:
            return ImageFont.truetype(path, size)
        return ImageFont.load_default()
    except Exception:
        return ImageFont.load_default()

def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int, draw: ImageDraw.Draw) -> List[str]:
    lines = []
    words = text.split()
    if not words:
        return lines
        
    current_line = words[0]
    for word in words[1:]:
        test_line = current_line + " " + word
        length = draw.textlength(test_line, font=font)
        if length <= max_width:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = word
    lines.append(current_line)
    return lines

def calculate_best_font_size(
    text: str, 
    font_family: str, 
    weight: Any, 
    max_width: int, 
    max_height: int, 
    start_size: int = 120, 
    min_size: int = 10,
    line_height_mult: float = 1.4
) -> Tuple[ImageFont.FreeTypeFont, List[str], int]:
    
    size = start_size
    draw = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    
    while size >= min_size:
        font = load_font(font_family, weight, size)
        lines = wrap_text(text, font, max_width, draw)
        
        if not lines:
            break
        
        bbox = font.getbbox("A")
        line_height = (bbox[3] - bbox[1]) * line_height_mult
        total_height = line_height * len(lines)
        
        if total_height <= max_height:
            return font, lines, int(total_height)
            
        size -= 4
        
    font = load_font(font_family, weight, min_size)
    lines = wrap_text(text, font, max_width, draw)
    bbox = font.getbbox("A")
    line_height = (bbox[3] - bbox[1]) * line_height_mult
    return font, lines, int(line_height * len(lines))
