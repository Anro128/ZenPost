import os
from typing import Dict

ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

def read_env_file() -> Dict[str, str]:
    """Reads the .env file and returns a dictionary of key-value pairs."""
    env_vars = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env_vars[key.strip()] = val.strip().strip('"').strip("'")
    return env_vars

def write_env_key(key: str, value: str):
    """
    Updates or inserts a key-value pair in the .env file 
    and updates os.environ immediately.
    """
    os.environ[key] = value
    
    lines = []
    found = False
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
    new_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("#") and "=" in stripped:
            k, _ = stripped.split("=", 1)
            if k.strip() == key:
                new_lines.append(f"{key}={value}\n")
                found = True
                continue
        new_lines.append(line)
        
    if not found:
        if new_lines and not new_lines[-1].endswith("\n"):
            new_lines.append("\n")
        new_lines.append(f"{key}={value}\n")
        
    with open(ENV_PATH, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

def get_env_key(key: str, default: str = "") -> str:
    """Gets key from os.environ or .env file."""
    if key in os.environ:
        return os.environ[key]
    env_vars = read_env_file()
    return env_vars.get(key, default)
