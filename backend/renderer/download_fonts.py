import os
import httpx
import asyncio

async def download_font(url: str, dest: str):
    if os.path.exists(dest):
        return
    async with httpx.AsyncClient() as client:
        response = await client.get(url, follow_redirects=True)
        if response.status_code == 200:
            with open(dest, "wb") as f:
                f.write(response.content)

async def download_fonts():
    fonts_dir = os.path.join(os.path.dirname(__file__), "fonts")
    os.makedirs(fonts_dir, exist_ok=True)
    
    # Inter font URLs
    regular_url = "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf"
    bold_url = "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.ttf"
    
    await asyncio.gather(
        download_font(regular_url, os.path.join(fonts_dir, "Inter-Regular.ttf")),
        download_font(bold_url, os.path.join(fonts_dir, "Inter-Bold.ttf"))
    )

if __name__ == "__main__":
    asyncio.run(download_fonts())
