from enum import Enum

class SchedulerStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DISABLED = "disabled"

class OutputType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"

class ContentStatus(str, Enum):
    PENDING = "pending"
    GENERATING = "generating"
    RENDERED = "rendered"
    UPLOADED = "uploaded"
    FAILED = "failed"

class JobType(str, Enum):
    GENERATE = "generate"
    RENDER_IMAGE = "render_image"
    RENDER_VIDEO = "render_video"
    UPLOAD = "upload"
    RETRY = "retry"
    CLEANUP = "cleanup"

class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class PlannerPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class PlannerStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    GENERATED = "generated"
    PUBLISHED = "published"

class UploadStatus(str, Enum):
    PENDING = "pending"
    UPLOADING = "uploading"
    SUCCESS = "success"
    FAILED = "failed"

class ProviderType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"

class TemplateLayout(str, Enum):
    CENTERED = "centered"
    TOP_ALIGNED = "top_aligned"
    SPLIT = "split"
    LARGE_QUOTE = "large_quote"

class TextAlign(str, Enum):
    CENTER = "center"
    LEFT = "left"
    RIGHT = "right"

class VerticalAlign(str, Enum):
    CENTER = "center"
    TOP = "top"
    BOTTOM = "bottom"

class SettingCategory(str, Enum):
    GENERAL = "general"
    AI = "ai"
    STORAGE = "storage"
    BRAND = "brand"
    QUEUE = "queue"
    NOTIFICATION = "notification"
    API_KEYS = "api_keys"
