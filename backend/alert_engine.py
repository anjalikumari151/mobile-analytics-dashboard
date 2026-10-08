from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import models
import schemas


def evaluate_alerts(db: Session) -> list[schemas.AlertTriggered]:
    configs = db.query(models.AlertConfig).all()
    cutoff_30 = datetime.utcnow() - timedelta(days=30)
    cutoff_today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Compute current metric values
    total_sessions = db.query(func.count(models.Session.id)).filter(
        models.Session.start_time >= cutoff_30
    ).scalar() or 1

    total_crashes = db.query(func.count(models.Crash.id)).filter(
        models.Crash.timestamp >= cutoff_30
    ).scalar() or 0

    crash_rate = round(total_crashes / total_sessions * 100, 2)

    dau = db.query(func.count(func.distinct(models.Session.user_id))).filter(
        models.Session.start_time >= cutoff_today
    ).scalar() or 0

    total_notifs = db.query(func.count(models.Notification.id)).filter(
        models.Notification.timestamp >= cutoff_30
    ).scalar() or 1
    opened = db.query(func.count(models.Notification.id)).filter(
        models.Notification.timestamp >= cutoff_30,
        models.Notification.opened == True  # noqa: E712
    ).scalar() or 0
    notif_open_rate = round(opened / total_notifs * 100, 1)

    metric_values = {
        "crash_rate": crash_rate,
        "dau": float(dau),
        "notification_open_rate": notif_open_rate,
    }

    triggered = []
    for cfg in configs:
        current = metric_values.get(cfg.metric_name)
        if current is None:
            continue
        fired = (cfg.operator == "gt" and current > cfg.threshold) or \
                (cfg.operator == "lt" and current < cfg.threshold)
        if fired:
            op_label = "above" if cfg.operator == "gt" else "below"
            triggered.append(schemas.AlertTriggered(
                id=cfg.id,
                metric_name=cfg.metric_name,
                operator=cfg.operator,
                threshold=cfg.threshold,
                current_value=current,
                severity=cfg.severity,
                message=f"{cfg.metric_name} is {op_label} threshold ({cfg.threshold}): current={current}",
            ))
    return triggered
