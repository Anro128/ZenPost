import os
import httpx
import asyncio

async def download_font(url: str, dest: str):
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        return
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, follow_redirects=True, timeout=15.0)
            if response.status_code == 200 and len(response.content) > 1000:
                with open(dest, "wb") as f:
                    f.write(response.content)
    except Exception as e:
        print(f"Failed to download font from {url}: {e}")

async def download_fonts():
    fonts_dir = os.path.join(os.path.dirname(__file__), "fonts")
    os.makedirs(fonts_dir, exist_ok=True)
    
    # Working jsDelivr Fontsource TTF URLs for Inter font
    regular_url = "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf"
    bold_url = "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf"
    
    await asyncio.gather(
        download_font(regular_url, os.path.join(fonts_dir, "Inter-Regular.ttf")),
        download_font(bold_url, os.path.join(fonts_dir, "Inter-Bold.ttf"))
    )

if __name__ == "__main__":
    asyncio.run(download_fonts())
