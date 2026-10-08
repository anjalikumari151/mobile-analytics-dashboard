from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from auth import verify_password, create_access_token, ADMIN_USERNAME, ADMIN_PASSWORD_HASH
from schemas import LoginRequest, TokenResponse
from routers import ingest, metrics

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mobile Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth route ────────────────────────────────────────────────────────────────
@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginRequest):
    if body.username != ADMIN_USERNAME or not verify_password(body.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": body.username})
    return TokenResponse(access_token=token)


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(ingest.router)
app.include_router(metrics.router)


@app.get("/")
def root():
    return {"message": "Mobile Analytics API — visit /docs for Swagger UI"}
