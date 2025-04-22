from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class TelegramAccountBase(BaseModel):
    phone_number: str
    api_id: Optional[int] = None
    api_hash: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo: Optional[str] = None


class TelegramAccountCreate(TelegramAccountBase):
    pass


class TelegramAccount(TelegramAccountBase):
    id: int
    is_active: bool
    created_at: datetime
    owner_id: int
    is_authorized: bool = False

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    telegram_accounts: List[TelegramAccount] = []

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class TelegramChat(BaseModel):
    id: int
    title: str
    unread_count: int
    thumb: Optional[str] = None


class TelegramMessage(BaseModel):
    id: int
    sender: str
    text: str
    date: datetime


class TelegramAuthRequest(BaseModel):
    account_id: int
    phone_number: Optional[str] = None
    verification_code: Optional[str] = None
    password: Optional[str] = None


class TelegramAuthResponse(BaseModel):
    account_id: int
    auth_step: str
    message: str
