import asyncio
from backend.database import async_session, engine, Base
from backend.models.models import Template, Setting
from backend.models.enums import TemplateLayout, TextAlign, VerticalAlign, SettingCategory

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session() as session:
        # Default templates
        templates = [
            Template(
                name="Centered",
                layout=TemplateLayout.CENTERED.value,
                font_family="Inter",
                font_size=48,
                font_weight=700,
                text_color="#000000",
                bg_color="#FFFFFF",
                padding_x=120,
                padding_y=160,
                line_height=1.4,
                text_align=TextAlign.CENTER.value,
                vertical_align=VerticalAlign.CENTER.value,
                footer_font_size=18,
                footer_color="#999999",
                is_default=True,
            ),
            Template(
                name="Top Aligned",
                layout=TemplateLayout.TOP_ALIGNED.value,
                font_family="Inter",
                font_size=44,
                font_weight=700,
                text_color="#000000",
                bg_color="#FFFFFF",
                padding_x=120,
                padding_y=200,
                line_height=1.5,
                text_align=TextAlign.LEFT.value,
                vertical_align=VerticalAlign.TOP.value,
                footer_font_size=18,
                footer_color="#999999",
                is_default=False,
            ),
            Template(
                name="Split Text",
                layout=TemplateLayout.SPLIT.value,
                font_family="Playfair Display",
                font_size=42,
                font_weight=600,
                text_color="#000000",
                bg_color="#FFFFFF",
                padding_x=100,
                padding_y=140,
                line_height=1.6,
                text_align=TextAlign.CENTER.value,
                vertical_align=VerticalAlign.CENTER.value,
                footer_font_size=16,
                footer_color="#AAAAAA",
                is_default=False,
            ),
            Template(
                name="Large Quote",
                layout=TemplateLayout.LARGE_QUOTE.value,
                font_family="Inter",
                font_size=56,
                font_weight=800,
                text_color="#000000",
                bg_color="#FFFFFF",
                padding_x=140,
                padding_y=180,
                line_height=1.3,
                text_align=TextAlign.CENTER.value,
                vertical_align=VerticalAlign.CENTER.value,
                footer_font_size=20,
                footer_color="#999999",
                is_default=False,
            ),
        ]
        
        for t in templates:
            session.add(t)
        
        # Default settings
        default_settings = [
            Setting(key="timezone", value="Asia/Jakarta", category=SettingCategory.GENERAL.value),
            Setting(key="language", value="en", category=SettingCategory.GENERAL.value),
            Setting(key="default_footer", value="@mindsetdaily", category=SettingCategory.BRAND.value),
            Setting(key="default_template", value="1", category=SettingCategory.BRAND.value),
            Setting(key="image_width", value="1080", category=SettingCategory.BRAND.value),
            Setting(key="image_height", value="1350", category=SettingCategory.BRAND.value),
            Setting(key="video_width", value="1080", category=SettingCategory.BRAND.value),
            Setting(key="video_height", value="1920", category=SettingCategory.BRAND.value),
            Setting(key="max_concurrent_jobs", value="3", category=SettingCategory.QUEUE.value),
            Setting(key="max_retries", value="3", category=SettingCategory.QUEUE.value),
        ]
        
        for s in default_settings:
            session.add(s)
        
        await session.commit()
        print("Seed data created successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
