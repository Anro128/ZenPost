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
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return path

    # Fallback to common Linux system fonts
    linux_fonts = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if w_int >= 700 else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if w_int >= 700 else "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf" if w_int >= 700 else "/usr/share/fonts/TTF/DejaVuSans.ttf",
    ]
    for lf in linux_fonts:
        if os.path.exists(lf):
            return lf

    # Fallback to Windows fonts if available
    win_fonts = [
        r"C:\Windows\Fonts\arialbd.ttf" if w_int >= 700 else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if w_int >= 700 else r"C:\Windows\Fonts\calibri.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if w_int >= 700 else r"C:\Windows\Fonts\segoeui.ttf",
    ]
    for wf in win_fonts:
        if os.path.exists(wf):
            return wf
            
    return ""

def load_font(font_family: str, weight: Any, size: int) -> ImageFont.FreeTypeFont:
    path = get_font_path(font_family, weight)
    try:
        if path:
            return ImageFont.truetype(path, size)
    except Exception:
        pass
        
    # If custom font failed, try loading system default truetype font or fallback
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except Exception:
        try:
            return ImageFont.truetype("arial.ttf", size)
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
    min_size: int = 24,
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
            
        size -= 2
        
    font = load_font(font_family, weight, min_size)
    lines = wrap_text(text, font, max_width, draw)
    bbox = font.getbbox("A")
    line_height = (bbox[3] - bbox[1]) * line_height_mult
    return font, lines, int(line_height * len(lines))
