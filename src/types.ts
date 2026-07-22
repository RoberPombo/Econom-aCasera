export interface Transaction {
  id?: number;
  date: string;
  type: "income" | "expense";
  category: string;
  concept: string;
  amount: number;
  year: number;
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySummary {
  category: string;
  type: "income" | "expense";
  amount: number;
}

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  active: number;
}

export interface DriveStatus {
  authenticated: boolean;
  email?: string;
}

export interface DriveConfig {
  client_id: string;
}

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_url: string;
  expires_in: number;
  interval: number;
}

export interface TokenInfo {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  obtained_at?: string;
}
