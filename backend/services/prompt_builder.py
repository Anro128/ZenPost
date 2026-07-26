import json
from typing import Optional

def build_prompt(
    topic: str,
    language: str,
    tone: str,
    audience: str,
    prompt_override: Optional[str] = None,
    negative_prompt: Optional[str] = None
) -> str:
    """Builds a structured prompt for the AI."""
    
    if prompt_override:
        base = prompt_override.replace("{topic}", topic)
    else:
        base = (
            f"You are a content creator specializing in '{topic}'.\n"
            f"Create a short, impactful quote/text specifically about '{topic}'.\n"
        )
        
    rules = [
        f"Main Topic / Focus: {topic}.",
        f"Writing Style: {tone} tone.",
        f"Audience: {audience}.",
        "Length: short/medium.",
        f"Language: {language}.",
        "The text should be typography-friendly, visually impactful.",
        "Do not use markdown formatting in the text field."
    ]
    
    if negative_prompt:
        rules.append(f"AVOID: {negative_prompt}")
        
    rules_text = "\n".join(f"- {r}" for r in rules)
    
    full_prompt = (
        f"{base}\n\n"
        f"Rules:\n{rules_text}\n\n"
        "IMPORTANT: You MUST return a JSON object with the following fields:\n"
        "- text: The main quote or text content (MUST be specifically about the topic)\n"
        "- caption: Leave this field empty string ''\n"
        "- hashtags: An array of 3-5 relevant hashtags (without #)\n"
        "- keywords: An array of 3-5 SEO keywords\n"
        "- title: A short title for internal use\n"
    )
    
    return full_prompt

def ensure_short_caption(caption: str, text: str) -> str:
    """Caption is intentionally kept empty as requested."""
    return ""
