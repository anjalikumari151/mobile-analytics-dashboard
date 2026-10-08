from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Ingestion ─────────────────────────────────────────────────────────────────
class EventPayload(BaseModel):
    event_type: str
    user_id: str
    session_id: str
    screen: Optional[str] = None
    timestamp: Optional[datetime] = None
    os: Optional[str] = None
    os_version: Optional[str] = None
    device_model: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    network_type: Optional[str] = None
    app_version: Optional[str] = None
    properties: Optional[dict] = None


class SessionPayload(BaseModel):
    session_id: str
    user_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    screen_count: Optional[int] = 0
    os: Optional[str] = None
    os_version: Optional[str] = None
    device_model: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    network_type: Optional[str] = None
    app_version: Optional[str] = None


class CrashPayload(BaseModel):
    user_id: str
    timestamp: Optional[datetime] = None
    os: Optional[str] = None
    os_version: Optional[str] = None
    device_model: Optional[str] = None
    app_version: Optional[str] = None
    error_message: Optional[str] = None


class NotificationPayload(BaseModel):
    user_id: str
    timestamp: Optional[datetime] = None
    notification_type: Optional[str] = None
    delivered: bool = True
    opened: bool = False


# ── Metrics responses ─────────────────────────────────────────────────────────
class DailyCount(BaseModel):
    date: str
    count: int


class EngagementMetrics(BaseModel):
    dau: int
    wau: int
    mau: int
    avg_session_duration: float
    total_sessions: int
    new_users: int
    returning_users: int
    dau_trend: List[DailyCount]
    new_vs_returning: List[Any]


class RetentionMetrics(BaseModel):
    day1: float
    day7: float
    day30: float


class DeviceMetrics(BaseModel):
    os_distribution: List[Any]
    top_devices: List[Any]
    app_versions: List[Any]
    network_types: List[Any]


class GeoMetrics(BaseModel):
    rows: List[Any]
    total_users: int


class PerformanceMetrics(BaseModel):
    crash_rate_trend: List[Any]
    avg_crash_rate: float
    total_crashes: int
    screen_load_times: List[Any]


class EventMetrics(BaseModel):
    top_events: List[Any]
    funnel: List[Any]


class NotificationMetrics(BaseModel):
    trend: List[Any]
    overall_delivery_rate: float
    overall_open_rate: float


class AlertTriggered(BaseModel):
    id: int
    metric_name: str
    operator: str
    threshold: float
    current_value: float
    severity: str
    message: str
