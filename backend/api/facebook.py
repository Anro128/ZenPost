from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.facebook_repo import facebook_repo
from backend.services.facebook_service import facebook_service
from typing import List

router = APIRouter(prefix="/api/facebook", tags=["facebook"])

@router.get("/pages")
async def get_facebook_pages(db: AsyncSession = Depends(get_db)):
    pages = await facebook_repo.list_all(db)
    result = []
    for p in pages:
        # Mask access token for security
        token = p.page_access_token
        masked_token = f"{token[:8]}...{token[-6:]}" if len(token) > 14 else "***"
        result.append({
            "id": p.id,
            "page_id": p.page_id,
            "page_name": p.page_name,
            "token_valid": p.token_valid,
            "avatar_url": p.avatar_url,
            "masked_token": masked_token,
            "created_at": p.created_at
        })
    return result

@router.post("/pages")
async def add_facebook_page(data: dict, db: AsyncSession = Depends(get_db)):
    token = data.get("page_access_token", "").strip()
    if not token:
        raise HTTPException(status_code=400, detail="Page Access Token is required")

    # Validate token against Facebook Graph API
    val_res = await facebook_service.validate_page_token(token)
    if not val_res.get("valid"):
        raise HTTPException(status_code=400, detail=f"Invalid Facebook Page Token: {val_res.get('error')}")

    page_id = val_res["page_id"]
    page_name = val_res["page_name"]
    avatar_url = val_res.get("avatar_url")

    # Check if page already exists in DB
    existing = await facebook_repo.get_by_page_id(db, page_id)
    if existing:
        # Update token
        updated = await facebook_repo.update(db, existing.id, {
            "page_name": page_name,
            "page_access_token": token,
            "token_valid": True,
            "avatar_url": avatar_url
        })
        return {"status": "success", "message": f"Updated Facebook Page '{page_name}'", "page": updated}
    else:
        # Create new
        created = await facebook_repo.create(db, {
            "page_id": page_id,
            "page_name": page_name,
            "page_access_token": token,
            "token_valid": True,
            "avatar_url": avatar_url
        })
        return {"status": "success", "message": f"Successfully connected Facebook Page '{page_name}'", "page": created}

@router.delete("/pages/{id}")
async def delete_facebook_page(id: int, db: AsyncSession = Depends(get_db)):
    success = await facebook_repo.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Facebook Page not found")
    return {"status": "success", "message": "Facebook Page removed"}

@router.post("/publish")
async def publish_to_facebook(data: dict, db: AsyncSession = Depends(get_db)):
    page_db_id = data.get("facebook_page_id")
    message = data.get("message") or data.get("text") or "New Content"
    image_url = data.get("image_url") or data.get("media_url")
    video_path = data.get("video_path")

    if not page_db_id:
        raise HTTPException(status_code=400, detail="facebook_page_id is required")

    fb_page = await facebook_repo.get_by_id(db, page_db_id)
    if not fb_page or not fb_page.token_valid:
        raise HTTPException(status_code=404, detail="Connected Facebook Page not found or invalid token")

    # If image URL was provided (e.g. http://localhost:8000/storage/images/xyz.png), resolve to local filepath
    image_path = None
    if image_url:
        import os
        from backend.config import settings
        filename = os.path.basename(image_url)
        local_p = os.path.join(settings.STORAGE_PATH, "images", filename)
        if os.path.exists(local_p):
            image_path = local_p

    res = await facebook_service.publish_post(
        page_id=fb_page.page_id,
        token=fb_page.page_access_token,
        message=message,
        image_path=image_path,
        video_path=video_path
    )

    if not res.get("success"):
        raise HTTPException(status_code=400, detail=f"Publish failed: {res.get('error')}")

    return {
        "status": "success",
        "message": f"Successfully published to Facebook Page '{fb_page.page_name}'",
        "post_id": res.get("post_id") or res.get("id")
    }
