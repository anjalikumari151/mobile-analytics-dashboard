from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import analytics
import alert_engine

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get("/engagement")
def engagement(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return analytics.compute_engagement(db, days)


@router.get("/retention")
def retention(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return analytics.compute_retention(db)


@router.get("/devices")
def devices(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return analytics.compute_devices(db, days)


@router.get("/geo")
def geo(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return analytics.compute_geo(db, days)


@router.get("/performance")
def performance(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return analytics.compute_performance(db, days)


@router.get("/events")
def events(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return analytics.compute_events(db, days)


@router.get("/notifications")
def notifications(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return analytics.compute_notifications(db, days)


@router.get("/alerts")
def alerts(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return alert_engine.evaluate_alerts(db)
