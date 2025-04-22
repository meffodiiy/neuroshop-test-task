from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.functions.channels import GetFullChannelRequest
from telethon.tl.functions.messages import GetDialogsRequest, GetFullChatRequest
from telethon.tl.functions.users import GetFullUserRequest
from telethon.tl.types import InputPeerEmpty, User, InputPeerChat, InputPeerUser
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import base64

from . import models, schemas

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

active_clients: Dict[int, TelegramClient] = {}


async def create_telegram_client(account: models.TelegramAccount) -> TelegramClient:
    try:
        client = TelegramClient(
            StringSession(account.session_string if account.session_string else ""),
            account.api_id,
            account.api_hash
        )

        await client.connect()
        active_clients[account.id] = client

        return client
    except Exception as e:
        logger.error(f"Error creating Telegram client: {str(e)}")
        raise


async def start_phone_verification(client: TelegramClient, account_id: int, phone_number: str) -> schemas.TelegramAuthResponse:
    try:
        await client.send_code_request(phone_number)

        return schemas.TelegramAuthResponse(
            account_id=account_id,
            auth_step="code_needed",
            message="Verification code sent to your phone. Please enter it."
        )
    except Exception as e:
        logger.error(f"Error starting phone verification: {str(e)}")
        raise


async def verify_code(client: TelegramClient, account_id: int, verification_code: str) -> schemas.TelegramAuthResponse:
    try:
        try:
            await client.sign_in(code=verification_code)

            return schemas.TelegramAuthResponse(
                account_id=account_id,
                auth_step="success",
                message="Successfully authenticated with Telegram."
            )
        except Exception as e:
            if "2FA" in str(e) or "password" in str(e).lower():
                return schemas.TelegramAuthResponse(
                    account_id=account_id,
                    auth_step="password_needed",
                    message="Two-factor authentication is enabled. Please enter your password."
                )
            else:
                raise
    except Exception as e:
        logger.error(f"Error verifying code: {str(e)}")
        raise


async def verify_password(client: TelegramClient, account_id: int, password: str) -> schemas.TelegramAuthResponse:
    try:
        await client.sign_in(password=password)

        return schemas.TelegramAuthResponse(
            account_id=account_id,
            auth_step="success",
            message="Successfully authenticated with Telegram."
        )
    except Exception as e:
        logger.error(f"Error verifying password: {str(e)}")
        raise


async def get_telegram_client(account_id: int) -> TelegramClient:
    if account_id in active_clients:
        return active_clients[account_id]

    raise ValueError(f"No active client for account {account_id}")


async def logout_telegram_client(account_id: int) -> bool:
    if account_id in active_clients:
        client = active_clients[account_id]
        await client.log_out()
        await client.disconnect()
        del active_clients[account_id]
        return True
    return False


async def get_chats(client: TelegramClient) -> List[schemas.TelegramChat]:
    try:
        result = await client(GetDialogsRequest(
            offset_date=None,
            offset_id=0,
            offset_peer=InputPeerEmpty(),
            limit=100,
            hash=0
        ))

        unread_counts = {
            getattr(dialog.peer, 'user_id', None) or
            getattr(dialog.peer, 'chat_id', None) or
            getattr(dialog.peer, 'channel_id', None): dialog.unread_count
            for dialog in result.dialogs
        }

        chats = []
        for chat in [*result.users, *result.chats]:
            thumb = None
            try:
                profile_photo = await client.download_profile_photo(chat, bytes)
                if profile_photo:
                    thumb = base64.b64encode(profile_photo).decode('utf-8')
            except Exception as e:
                logger.error(f"Error downloading profile photo: {str(e)}")
            if isinstance(chat, User):
                chats.append(schemas.TelegramChat(
                    id=chat.id,
                    title=f'{chat.first_name}{(" " + chat.last_name) if chat.last_name else ""}',
                    unread_count=unread_counts.get(chat.id, 0),
                    thumb=thumb
                ))
            else:
                chats.append(schemas.TelegramChat(
                    id=chat.id,
                    title=chat.title,
                    unread_count=unread_counts.get(chat.id, 0),
                    thumb=thumb
                ))

        return chats
    except Exception as e:
        logger.error(f"Error getting chats: {str(e)}")
        raise


async def get_messages(client: TelegramClient, chat_id: int, limit: int = 100) -> List[schemas.TelegramMessage]:
    try:
        entity = await client.get_entity(chat_id)
        messages = []

        async for message in client.iter_messages(entity, limit=limit):
            if message.sender_id:
                sender = await client.get_entity(message.sender_id)
                sender_name = (getattr(sender, 'first_name', '') + ' ' + (getattr(sender, 'last_name', '') or '')).strip()
            else:
                sender_name = "Unknown"

            messages.append(schemas.TelegramMessage(
                id=message.id,
                sender=sender_name.strip(),
                text=message.text if message.text else "",
                date=message.date
            ))

        return messages
    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        raise


async def get_user_info(client: TelegramClient) -> dict:
    try:
        me = await client.get_me()

        photo_data = None
        try:
            profile_photo = await client.download_profile_photo(me, bytes)
            if profile_photo:
                photo_data = base64.b64encode(profile_photo).decode('utf-8')
        except Exception as e:
            logger.error(f"Error downloading profile photo: {str(e)}")

        return {
            "first_name": me.first_name,
            "last_name": me.last_name,
            "username": me.username,
            "photo": photo_data
        }
    except Exception as e:
        logger.error(f"Error getting user information: {str(e)}")
        raise
