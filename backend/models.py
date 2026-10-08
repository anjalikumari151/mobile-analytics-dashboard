from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime
from database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True)
    user_id = Column(String, index=True)
    session_id = Column(String, index=True)
    screen = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    os = Column(String, nullable=True)
    os_version = Column(String, nullable=True)
    device_model = Column(String, nullable=True)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    network_type = Column(String, nullable=True)
    app_version = Column(String, nullable=True)
    properties = Column(Text, nullable=True)  # JSON string


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    user_id = Column(String, index=True)
    start_time = Column(DateTime, index=True)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    screen_count = Column(Integer, default=0)
    os = Column(String, nullable=True)
    os_version = Column(String, nullable=True)
    device_model = Column(String, nullable=True)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    network_type = Column(String, nullable=True)
    app_version = Column(String, nullable=True)


class Crash(Base):
    __tablename__ = "crashes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    os = Column(String, nullable=True)
    os_version = Column(String, nullable=True)
    device_model = Column(String, nullable=True)
    app_version = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    notification_type = Column(String, nullable=True)
    delivered = Column(Boolean, default=True)
    opened = Column(Boolean, default=False)


class AlertConfig(Base):
    __tablename__ = "alerts_config"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String)
    operator = Column(String)   # "gt" | "lt"
    threshold = Column(Float)
    channel = Column(String, default="dashboard")
    severity = Column(String, default="warning")  # "warning" | "critical"
