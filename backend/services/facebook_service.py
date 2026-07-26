import httpx
import os
from typing import Dict, Any, Optional

GRAPH_API_BASE = "https://graph.facebook.com/v21.0"

class FacebookService:
    async def validate_page_token(self, token: str) -> Dict[str, Any]:
        """
        Validates a Facebook Page Access Token by querying /me on Graph API v21.0.
        Returns dict with: valid, page_id, page_name, avatar_url, error.
        """
        url = f"{GRAPH_API_BASE}/me?fields=id,name,picture.type(large)&access_token={token}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=15.0)
                data = response.json()
                
            if "error" in data:
                return {"valid": False, "error": data["error"].get("message", "Invalid token")}
                
            avatar_url = None
            if "picture" in data and "data" in data["picture"]:
                avatar_url = data["picture"]["data"].get("url")
                
            return {
                "valid": True,
                "page_id": data.get("id"),
                "page_name": data.get("name"),
                "avatar_url": avatar_url
            }
        except Exception as e:
            return {"valid": False, "error": f"Network error while validating token: {str(e)}"}

    async def publish_post(
        self,
        page_id: str,
        token: str,
        message: str,
        image_path: Optional[str] = None,
        video_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Publishes a post (photo, video, or text) to a Facebook Page via Graph API v21.0.
        """
        try:
            # 1. Single Photo upload via file upload or photo URL
            if image_path and os.path.exists(image_path):
                endpoint = f"{GRAPH_API_BASE}/{page_id}/photos"
                async with httpx.AsyncClient() as client:
                    with open(image_path, "rb") as img_file:
                        files = {"source": ("image.png", img_file, "image/png")}
                        data = {
                            "caption": "",
                            "access_token": token
                        }
                        res = await client.post(endpoint, data=data, files=files, timeout=60.0)
                        res_data = res.json()
                        
                if "error" in res_data:
                    return {"success": False, "error": res_data["error"].get("message")}
                return {"success": True, "post_id": res_data.get("id"), "id": res_data.get("id")}
                
            # 2. Video upload
            elif video_path and os.path.exists(video_path):
                endpoint = f"{GRAPH_API_BASE}/{page_id}/videos"
                async with httpx.AsyncClient() as client:
                    with open(video_path, "rb") as vid_file:
                        files = {"source": ("video.mp4", vid_file, "video/mp4")}
                        data = {
                            "description": message,
                            "access_token": token
                        }
                        res = await client.post(endpoint, data=data, files=files, timeout=120.0)
                        res_data = res.json()
                        
                if "error" in res_data:
                    return {"success": False, "error": res_data["error"].get("message")}
                return {"success": True, "post_id": res_data.get("id"), "id": res_data.get("id")}
                
            # 3. Pure Text Feed post
            else:
                endpoint = f"{GRAPH_API_BASE}/{page_id}/feed"
                payload = {
                    "message": message,
                    "access_token": token
                }
                async with httpx.AsyncClient() as client:
                    res = await client.post(endpoint, json=payload, timeout=30.0)
                    res_data = res.json()
                    
                if "error" in res_data:
                    return {"success": False, "error": res_data["error"].get("message")}
                return {"success": True, "post_id": res_data.get("id"), "id": res_data.get("id")}
                
        except Exception as e:
            return {"success": False, "error": f"Failed to publish to Facebook: {str(e)}"}

facebook_service = FacebookService()
