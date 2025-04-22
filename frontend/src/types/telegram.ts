// Define types for Telegram-related data

export type TelegramAccount = {
  id: number;
  phone_number: string;
  api_id?: string;
  api_hash?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo?: string;
  is_authorized: boolean;
  created_at: string;
  updated_at: string;
}

export type TelegramChat = {
  id: number;
  title: string;
  unread_count: number;
  thumb?: string;
}

export type TelegramMessage = {
  id: number;
  text: string;
  date: string;
  sender: string;
  is_outgoing: boolean;
}

export type AuthResponse = {
  auth_step: 'code_needed' | 'password_needed' | 'success';
  message: string;
}

export type NewAccountForm = {
  phone_number: string;
  api_id?: string;
  api_hash?: string;
}
