# ZenPost

An automated content generation suite tailored for seamless creation, scheduling, and rendering of text and visual media using AI. The application features a minimalist, Notion-style interface.

## Architecture

This project is split into two main parts:
- **Backend**: FastAPI, SQLAlchemy (SQLite), and Pillow for image rendering. Handles AI generation (via OpenAI, Gemini, or Claude) and background scheduled jobs.
- **Frontend**: React, Vite, TailwindCSS, and TanStack Query. Provides a clean, modern user interface.

## Requirements

- Node.js (v18+)
- Python (v3.11+)
- API Keys for AI Providers (e.g., OpenAI, Gemini, Claude)

## Quick Start

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
# From the project root
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate # On Windows
# source venv/bin/activate # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn backend.main:app --reload
```

The backend server will run at `http://localhost:8000`.

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
# From the project root
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`.

## Core Features

- **Planner**: Manage your content calendar, ideas, and target dates.
- **Schedulers**: Automate recurring content generation workflows via cron expressions (e.g. daily motivation quotes).
- **Manual Generator**: A sandbox to immediately generate and visualize text and media output.
- **Templates**: Custom layout designer for image generation, including editable font sizes, alignments, and custom footers.
- **History**: Track previously generated contents and jobs.
- **Settings**: Manage global configurations and AI provider API keys.
