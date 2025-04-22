# Telegram Web Client

A web client for Telegram that allows users to manage multiple Telegram accounts, view chats, and read messages.

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Create and activate a virtual environment
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and fill in the required values:
   ```
   TELEGRAM_API_ID=           # Your Telegram API ID from https://my.telegram.org
   TELEGRAM_API_HASH=         # Your Telegram API Hash from https://my.telegram.org
   SECRET_KEY=                # Generate with: openssl rand -hex 32
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   CORS_ORIGINS=http://localhost:3000
   ```
5. Run the backend: `python run.py`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install` or `yarn install`
3. Copy `.env.example` to `.env`:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```
4. Start the frontend: `npm start` or `yarn start`

## Features
- Multi-account Telegram management
- Chat and message viewing
- User authentication

## Tech Stack
- Backend: FastAPI, SQLAlchemy, Telethon
- Frontend: React.js, Tailwind CSS
