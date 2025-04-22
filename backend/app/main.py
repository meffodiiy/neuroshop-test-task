from fastapi import Depends, FastAPI, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import os
import logging
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from . import models, schemas, auth, telegram
from .database import engine, get_db

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
models.Base.metadata.create_all(bind=engine)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log"),
    ]
)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Telegram Web Client")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.post("/register", response_model=schemas.User)
@limiter.limit("5/minute")
def register_user(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = auth.get_user(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@app.post("/token", response_model=schemas.Token)
@limiter.limit("5/minute")
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user


@app.post("/telegram-accounts", response_model=schemas.TelegramAccount)
async def create_telegram_account(
        account: schemas.TelegramAccountCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    api_id = int(os.environ.get("TELEGRAM_API_ID"))
    api_hash = os.environ.get("TELEGRAM_API_HASH")

    db_account = models.TelegramAccount(
        phone_number=account.phone_number,
        api_id=api_id,
        api_hash=api_hash,
        owner_id=current_user.id
    )

    db.add(db_account)
    db.commit()
    db.refresh(db_account)

    is_authorized = False
    try:
        client = await telegram.create_telegram_client(db_account)

        if client.is_connected() and client.is_user_authorized():
            db_account.session_string = client.session.save()
            db.commit()
            is_authorized = True

    except Exception as e:
        logger.error(f"Error connecting to Telegram: {str(e)}")

    db_account.is_authorized = is_authorized

    return db_account


@app.post("/telegram-accounts/{account_id}/auth", response_model=schemas.TelegramAuthResponse)
async def authenticate_telegram_account(
        auth_request: schemas.TelegramAuthRequest,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    account = db.query(models.TelegramAccount).filter(
        models.TelegramAccount.id == auth_request.account_id,
        models.TelegramAccount.owner_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Telegram account not found")

    try:
        client = await telegram.get_telegram_client(auth_request.account_id)
    except ValueError:
        client = await telegram.create_telegram_client(account)

    if auth_request.phone_number:
        response = await telegram.start_phone_verification(client, auth_request.account_id, auth_request.phone_number)

        if account.phone_number != auth_request.phone_number:
            account.phone_number = auth_request.phone_number
            db.commit()

        return response

    elif auth_request.verification_code:
        response = await telegram.verify_code(client, auth_request.account_id, auth_request.verification_code)

        if response.auth_step == "success":
            account.session_string = client.session.save()

            try:
                user_info = await telegram.get_user_info(client)
                account.first_name = user_info["first_name"]
                account.last_name = user_info["last_name"]
                account.username = user_info["username"]
                account.photo = user_info["photo"]
            except Exception as e:
                logger.error(f"Error getting user information: {str(e)}")

            db.commit()

        return response

    elif auth_request.password:
        response = await telegram.verify_password(client, auth_request.account_id, auth_request.password)

        if response.auth_step == "success":
            account.session_string = client.session.save()

            try:
                user_info = await telegram.get_user_info(client)
                account.first_name = user_info["first_name"]
                account.last_name = user_info["last_name"]
                account.username = user_info["username"]
                account.photo = user_info["photo"]
            except Exception as e:
                logger.error(f"Error getting user information: {str(e)}")

            db.commit()

        return response

    else:
        return schemas.TelegramAuthResponse(
            account_id=auth_request.account_id,
            auth_step="code_needed",
            message="Please provide your phone number to start authentication."
        )


@app.get("/telegram-accounts", response_model=List[schemas.TelegramAccount])
async def get_telegram_accounts(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    accounts = db.query(models.TelegramAccount).filter(
        models.TelegramAccount.owner_id == current_user.id
    ).all()

    for account in accounts:
        account.is_authorized = account.id in telegram.active_clients

    return accounts


@app.delete("/telegram-accounts/{account_id}", response_model=bool)
async def delete_telegram_account(
        account_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    account = db.query(models.TelegramAccount).filter(
        models.TelegramAccount.id == account_id,
        models.TelegramAccount.owner_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Telegram account not found")

    try:
        await telegram.logout_telegram_client(account_id)
    except:
        pass

    db.delete(account)
    db.commit()

    return True


@app.get("/telegram-accounts/{account_id}/chats", response_model=List[schemas.TelegramChat])
async def get_telegram_chats(
        account_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    account = db.query(models.TelegramAccount).filter(
        models.TelegramAccount.id == account_id,
        models.TelegramAccount.owner_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Telegram account not found")

    try:
        client = await telegram.get_telegram_client(account_id)
    except ValueError:
        client = await telegram.create_telegram_client(account)

    chats = await telegram.get_chats(client)

    return chats


@app.get("/telegram-accounts/{account_id}/chats/{chat_id}/messages", response_model=List[schemas.TelegramMessage])
async def get_telegram_messages(
        account_id: int,
        chat_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    account = db.query(models.TelegramAccount).filter(
        models.TelegramAccount.id == account_id,
        models.TelegramAccount.owner_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Telegram account not found")

    try:
        client = await telegram.get_telegram_client(account_id)
    except ValueError:
        client = await telegram.create_telegram_client(account)

    messages = await telegram.get_messages(client, chat_id)

    return messages


@app.post("/telegram-accounts/{account_id}/logout", response_model=bool)
async def logout_telegram_account(
        account_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    account = db.query(models.TelegramAccount).filter(
        models.TelegramAccount.id == account_id,
        models.TelegramAccount.owner_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Telegram account not found")

    success = await telegram.logout_telegram_client(account_id)

    return success
