from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
import secrets
from backend.config import settings
from backend.services.env_service import write_env_key

router = APIRouter(prefix="/api/auth", tags=["auth"])

ACTIVE_TOKENS = set()

class LoginRequest(BaseModel):
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

def verify_token(authorization: str = Header(None)):
    current_pw = settings.APP_PASSWORD or ""
    if not current_pw:
        return True
        
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required. Please login.")
        
    token = authorization.replace("Bearer ", "").strip()
    if token not in ACTIVE_TOKENS:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please login again.")
        
    return True

@router.post("/login")
async def login(data: LoginRequest):
    expected_pw = settings.APP_PASSWORD or ""
    if data.password != expected_pw:
        raise HTTPException(status_code=401, detail="Incorrect password. Access denied.")
        
    token = secrets.token_hex(32)
    ACTIVE_TOKENS.add(token)
    
    return {
        "status": "success",
        "message": "Authenticated successfully",
        "token": token
    }

@router.get("/verify")
async def verify(authenticated: bool = Depends(verify_token)):
    return {"authenticated": True}

@router.post("/logout")
async def logout(authorization: str = Header(None)):
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        ACTIVE_TOKENS.discard(token)
    return {"status": "success", "message": "Logged out"}

@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, authenticated: bool = Depends(verify_token)):
    current_pw = settings.APP_PASSWORD or ""
    if data.current_password != current_pw:
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
        
    if not data.new_password or len(data.new_password.strip()) < 4:
        raise HTTPException(status_code=400, detail="New password must be at least 4 characters long.")

    new_pw = data.new_password.strip()
    
    # Save to .env and update in-memory settings
    write_env_key("APP_PASSWORD", new_pw)
    settings.APP_PASSWORD = new_pw
    
    return {
        "status": "success",
        "message": "Master password updated successfully in .env file."
    }
