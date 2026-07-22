import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { DriveConfig, DriveStatus, DeviceCodeResponse, TokenInfo } from "./types";
import { getAppDataDir } from "./utils";

const dataDir = getAppDataDir();
const tokenPath = path.join(dataDir, "token.json");
const configPath = path.join(dataDir, "drive_config.json");

const SCOPE = "https://www.googleapis.com/auth/drive.file";
const DEVICE_CODE_URL = "https://oauth2.googleapis.com/device/code";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";

let pendingDeviceCode: DeviceCodeResponse | null = null;
let pendingResolve: ((value: TokenInfo) => void) | null = null;

export function getDriveConfig(): DriveConfig | null {
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, "utf-8")) as DriveConfig;
  } catch {
    return null;
  }
}

export function setDriveConfig(config: DriveConfig): void {
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function getToken(): TokenInfo | null {
  if (!existsSync(tokenPath)) return null;
  try {
    return JSON.parse(readFileSync(tokenPath, "utf-8")) as TokenInfo;
  } catch {
    return null;
  }
}

function saveToken(token: TokenInfo): void {
  token.obtained_at = new Date().toISOString();
  writeFileSync(tokenPath, JSON.stringify(token, null, 2));
}

export async function getDriveStatus(): Promise<DriveStatus> {
  const token = getToken();
  if (!token?.access_token) return { authenticated: false };
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!res.ok) return { authenticated: false };
    const json = (await res.json()) as { email?: string };
    return { authenticated: true, email: json.email };
  } catch {
    return { authenticated: false };
  }
}

export async function startGoogleAuth(): Promise<string> {
  const config = getDriveConfig();
  if (!config?.client_id) {
    throw new Error("No está configurado el Client ID de Google");
  }

  const res = await fetch(DEVICE_CODE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: config.client_id, scope: SCOPE }),
  });

  if (!res.ok) throw new Error(`Error de Google: ${res.status}`);
  const device = (await res.json()) as DeviceCodeResponse;
  pendingDeviceCode = device;

  // Polling en segundo plano
  pollForToken(config.client_id, device);

  return `${device.verification_url}?user_code=${device.user_code}`;
}

async function pollForToken(clientId: string, device: DeviceCodeResponse): Promise<void> {
  const expiresAt = Date.now() + device.expires_in * 1000;
  const interval = Math.max(device.interval, 5) * 1000;

  while (Date.now() < expiresAt) {
    await new Promise((r) => setTimeout(r, interval));

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        device_code: device.device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    });

    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
    };

    if (data.error) {
      if (data.error === "authorization_pending") continue;
      if (data.error === "slow_down") {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      break;
    }

    if (data.access_token) {
      const token: TokenInfo = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      };
      saveToken(token);
      if (pendingResolve) pendingResolve(token);
      break;
    }
  }

  pendingDeviceCode = null;
}

export async function backupToDrive(dbPath: string): Promise<{ success: boolean; message: string }> {
  const token = getToken();
  if (!token?.access_token) throw new Error("No autenticado con Google Drive");

  const file = Bun.file(dbPath);
  const fileContent = await file.bytes();
  const filename = `gastos_backup_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.db`;

  const metadata = JSON.stringify({ name: filename, mimeType: "application/x-sqlite3" });
  const boundary = "----gastosBoundary";

  const parts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
    `--${boundary}\r\nContent-Type: application/x-sqlite3\r\n\r\n`,
  ];

  // Construir body manualmente
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  for (const part of parts) chunks.push(encoder.encode(part));
  chunks.push(new Uint8Array(fileContent));
  chunks.push(encoder.encode(`\r\n--${boundary}--`));

  const body = new Blob(chunks);

  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al subir: ${res.status} - ${text}`);
  }

  const json = (await res.json()) as { name?: string };
  return { success: true, message: `Copia guardada en Drive: ${json.name || filename}` };
}

export async function restoreFromDrive(dbPath: string): Promise<{ success: boolean; message: string }> {
  const token = getToken();
  if (!token?.access_token) throw new Error("No autenticado con Google Drive");

  const searchUrl = `${DRIVE_FILES_URL}?q=${encodeURIComponent(
    "name contains 'gastos_backup_' and mimeType='application/x-sqlite3'"
  )}&orderBy=modifiedTime desc&pageSize=1`;

  const res = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!res.ok) throw new Error(`Error al buscar copias: ${res.status}`);

  const json = (await res.json()) as { files?: { id: string; name: string }[] };
  const file = json.files?.[0];
  if (!file) throw new Error("No se encontró ninguna copia en Drive");

  const downloadUrl = `${DRIVE_FILES_URL}/${file.id}?alt=media`;
  const downloadRes = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!downloadRes.ok) throw new Error(`Error al descargar: ${downloadRes.status}`);

  const buffer = await downloadRes.arrayBuffer();
  await Bun.write(dbPath, new Uint8Array(buffer));

  return { success: true, message: `Restaurado desde Drive: ${file.name}` };
}

export function waitForAuth(): Promise<TokenInfo> {
  return new Promise((resolve) => {
    pendingResolve = resolve;
  });
}
