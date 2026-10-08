import json
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas import EventPayload, SessionPayload, CrashPayload, NotificationPayload

router = APIRouter(prefix="/ingest", tags=["Ingestion"])


@router.post("/event")
def ingest_event(payload: EventPayload, db: Session = Depends(get_db)):
    event = models.Event(
        event_type=payload.event_type,
        user_id=payload.user_id,
        session_id=payload.session_id,
        screen=payload.screen,
        timestamp=payload.timestamp or datetime.utcnow(),
        os=payload.os,
        os_version=payload.os_version,
        device_model=payload.device_model,
        country=payload.country,
        city=payload.city,
        network_type=payload.network_type,
        app_version=payload.app_version,
        properties=json.dumps(payload.properties) if payload.properties else None,
    )
    db.add(event)
    db.commit()
    return {"status": "ok"}


@router.post("/session")
def ingest_session(payload: SessionPayload, db: Session = Depends(get_db)):
    session = models.Session(
        session_id=payload.session_id,
        user_id=payload.user_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        duration_seconds=payload.duration_seconds,
        screen_count=payload.screen_count,
        os=payload.os,
        os_version=payload.os_version,
        device_model=payload.device_model,
        country=payload.country,
        city=payload.city,
        network_type=payload.network_type,
        app_version=payload.app_version,
    )
    db.add(session)
    db.commit()
    return {"status": "ok"}


@router.post("/crash")
def ingest_crash(payload: CrashPayload, db: Session = Depends(get_db)):
    crash = models.Crash(
        user_id=payload.user_id,
        timestamp=payload.timestamp or datetime.utcnow(),
        os=payload.os,
        os_version=payload.os_version,
        device_model=payload.device_model,
        app_version=payload.app_version,
        error_message=payload.error_message,
    )
    db.add(crash)
    db.commit()
    return {"status": "ok"}


@router.post("/notification")
def ingest_notification(payload: NotificationPayload, db: Session = Depends(get_db)):
    notif = models.Notification(
        user_id=payload.user_id,
        timestamp=payload.timestamp or datetime.utcnow(),
        notification_type=payload.notification_type,
        delivered=payload.delivered,
        opened=payload.opened,
    )
    db.add(notif)
    db.commit()
    return {"status": "ok"}
