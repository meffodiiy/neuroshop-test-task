# Telegram Web Client

A web client for Telegram that allows users to manage multiple Telegram accounts, view chats, and read messages.

## Features

- Register and login into web client using email and password
- Login into several Telegram accounts
- List of all chats of selected Telegram account
- View of all messages of selected chat of selected Telegram account
- Logout from Telegram account
- Logout from web client

## Technology Stack

- **Backend**: FastAPI, SQLAlchemy, Telethon
- **Frontend**: React.js, Tailwind CSS, Axios

## Project Structure

```
telegram-web-client/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── telegram.py
│   │   └── main.py
│   ├── requirements.txt
│   └── run.py
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── components/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   └── ChatView.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## Setup and Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```
   python run.py
   ```

   The backend server will start at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

   The frontend development server will start at http://localhost:3000

## Usage

1. Register a new account or login with an existing account
2. Add a Telegram account with your phone number, API ID, and API hash
   - You can get your API ID and API hash from https://my.telegram.org
3. Select a Telegram account to view its chats
4. Click on a chat to view its messages
5. Use the logout buttons to log out from a Telegram account or the web client

## Production Deployment

### Backend

1. Set up environment variables:
   - Copy `.env.production` to `.env` or set the environment variables directly on your server
   - Make sure to update the `SECRET_KEY` with a new secure value (run `openssl rand -hex 32` to generate one)
   - Update `CORS_ORIGINS` with your frontend domain

2. Install production dependencies:
   ```
   pip install -r requirements.txt gunicorn
   ```

3. Run with a production ASGI server:
   ```
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

4. Set up HTTPS using a reverse proxy like Nginx or use a service like Heroku that handles HTTPS for you.

### Frontend

1. Set up environment variables:
   - Copy `.env.production` to `.env` or set the environment variables directly on your build system
   - Update `REACT_APP_API_URL` with your backend API URL (must be HTTPS for production)

2. Build the production bundle:
   ```
   npm run build
   ```

3. Serve the static files using a web server like Nginx or deploy to a service like Netlify, Vercel, or AWS S3 + CloudFront.

## Security Considerations

- Always use HTTPS in production
- Keep your SECRET_KEY secure and don't commit it to version control
- Regularly update dependencies to patch security vulnerabilities
- Consider implementing additional security measures like rate limiting and IP blocking for production

## Notes

- This is a simple implementation and may not include all features of the official Telegram clients
- For a production environment, you should use a more secure method for storing API credentials and session data
