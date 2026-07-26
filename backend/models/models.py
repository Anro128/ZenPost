from datetime import datetime, date
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Integer, Boolean, Float, DateTime, ForeignKey, Text, JSON, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from backend.database import Base
from backend.models.enums import (
    SchedulerStatus, OutputType, ContentStatus, JobType, JobStatus,
    PlannerPriority, PlannerStatus, UploadStatus, ProviderType,
    TemplateLayout, TextAlign, VerticalAlign, SettingCategory
)

class BaseModel(Base):
    __abstract__ = True
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

class Scheduler(BaseModel):
    __tablename__ = "schedulers"
    name: Mapped[str] = mapped_column(String(255))
    status: Mapped[SchedulerStatus] = mapped_column(String(50), default=SchedulerStatus.ACTIVE)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    cron_expression: Mapped[str] = mapped_column(String(100))
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    topic: Mapped[str] = mapped_column(String(255))
    language: Mapped[str] = mapped_column(String(50), default="id")
    tone: Mapped[str] = mapped_column(String(50), default="informative")
    audience: Mapped[str] = mapped_column(String(100), default="general")
    provider_name: Mapped[str] = mapped_column(String(50))
    model_name: Mapped[str] = mapped_column(String(100))
    output_type: Mapped[OutputType] = mapped_column(String(50))
    template_id: Mapped[Optional[int]] = mapped_column(ForeignKey("templates.id"), nullable=True)
    footer_username: Mapped[str] = mapped_column(String(100), default="")
    upload_destination: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    facebook_page_id: Mapped[Optional[int]] = mapped_column(ForeignKey("facebook_pages.id"), nullable=True)
    prompt_override: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    negative_prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=3)
    max_daily_post: Mapped[int] = mapped_column(Integer, default=10)
    random_seed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    planner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("planner_items.id"), nullable=True)
    last_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

class FacebookPage(BaseModel):
    __tablename__ = "facebook_pages"
    page_id: Mapped[str] = mapped_column(String(100), unique=True)
    page_name: Mapped[str] = mapped_column(String(255))
    page_access_token: Mapped[str] = mapped_column(Text)
    token_valid: Mapped[bool] = mapped_column(Boolean, default=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

class Provider(BaseModel):
    __tablename__ = "providers"
    name: Mapped[str] = mapped_column(String(100))
    type: Mapped[ProviderType] = mapped_column(String(50))
    provider_key: Mapped[str] = mapped_column(String(50))
    api_key: Mapped[str] = mapped_column(String(255))
    base_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    default_model: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Template(BaseModel):
    __tablename__ = "templates"
    name: Mapped[str] = mapped_column(String(100))
    layout: Mapped[TemplateLayout] = mapped_column(String(50))
    font_family: Mapped[str] = mapped_column(String(100), default="Inter")
    font_size: Mapped[int] = mapped_column(Integer, default=48)
    font_weight: Mapped[int] = mapped_column(Integer, default=700)
    text_color: Mapped[str] = mapped_column(String(20), default="#000000")
    bg_color: Mapped[str] = mapped_column(String(20), default="#FFFFFF")
    padding_x: Mapped[int] = mapped_column(Integer, default=120)
    padding_y: Mapped[int] = mapped_column(Integer, default=160)
    line_height: Mapped[float] = mapped_column(Float, default=1.4)
    text_align: Mapped[TextAlign] = mapped_column(String(50), default=TextAlign.CENTER)
    vertical_align: Mapped[VerticalAlign] = mapped_column(String(50), default=VerticalAlign.CENTER)
    footer_font_size: Mapped[int] = mapped_column(Integer, default=18)
    footer_color: Mapped[str] = mapped_column(String(20), default="#999999")
    footer_text: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    border_radius: Mapped[int] = mapped_column(Integer, default=0)
    shadow: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    watermark: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

class PlannerItem(BaseModel):
    __tablename__ = "planner_items"
    topic: Mapped[str] = mapped_column(String(255))
    keyword: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100))
    target_date: Mapped[date] = mapped_column(Date)
    priority: Mapped[PlannerPriority] = mapped_column(String(50))
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[PlannerStatus] = mapped_column(String(50), default=PlannerStatus.DRAFT)
    scheduler_id: Mapped[Optional[int]] = mapped_column(ForeignKey("schedulers.id"), nullable=True)

class GeneratedContent(BaseModel):
    __tablename__ = "generated_contents"
    scheduler_id: Mapped[int] = mapped_column(ForeignKey("schedulers.id"))
    prompt_used: Mapped[str] = mapped_column(Text)
    output_text: Mapped[str] = mapped_column(Text)
    caption: Mapped[str] = mapped_column(Text)
    hashtags: Mapped[List[str]] = mapped_column(JSON)
    keywords: Mapped[List[str]] = mapped_column(JSON)
    title: Mapped[str] = mapped_column(String(255))
    image_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    video_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    provider_used: Mapped[str] = mapped_column(String(100))
    model_used: Mapped[str] = mapped_column(String(100))
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[ContentStatus] = mapped_column(String(50), default=ContentStatus.PENDING)
    template_id: Mapped[Optional[int]] = mapped_column(ForeignKey("templates.id"), nullable=True)

class Upload(BaseModel):
    __tablename__ = "uploads"
    content_id: Mapped[int] = mapped_column(ForeignKey("generated_contents.id"))
    platform: Mapped[str] = mapped_column(String(100))
    status: Mapped[UploadStatus] = mapped_column(String(50), default=UploadStatus.PENDING)
    upload_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

class UploadAccount(BaseModel):
    __tablename__ = "upload_accounts"
    platform: Mapped[str] = mapped_column(String(100))
    username: Mapped[str] = mapped_column(String(100))
    credentials_encrypted: Mapped[str] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Job(BaseModel):
    __tablename__ = "jobs"
    scheduler_id: Mapped[Optional[int]] = mapped_column(ForeignKey("schedulers.id"), nullable=True)
    type: Mapped[JobType] = mapped_column(String(50))
    status: Mapped[JobStatus] = mapped_column(String(50), default=JobStatus.PENDING)
    payload: Mapped[Dict[str, Any]] = mapped_column(JSON)
    result: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    max_retries: Mapped[int] = mapped_column(Integer, default=3)

class Setting(BaseModel):
    __tablename__ = "settings"
    key: Mapped[str] = mapped_column(String(100), unique=True)
    value: Mapped[str] = mapped_column(Text)
    category: Mapped[SettingCategory] = mapped_column(String(50))

class AnalyticsDaily(BaseModel):
    __tablename__ = "analytics_daily"
    date: Mapped[date] = mapped_column(Date, unique=True)
    total_generated: Mapped[int] = mapped_column(Integer, default=0)
    total_uploaded: Mapped[int] = mapped_column(Integer, default=0)
    total_failed: Mapped[int] = mapped_column(Integer, default=0)
    provider_usage: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    cost_total: Mapped[float] = mapped_column(Float, default=0.0)
    content_by_topic: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    content_by_platform: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
