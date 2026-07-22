import { useState } from "react";
import type { DriveStatus } from "./api";
import {
  setDriveConfig,
  startGoogleAuth,
  backupToDrive,
  restoreFromDrive,
  getDbPath,
} from "./api";

interface Props {
  status: DriveStatus;
  onChange: () => void;
}

export function DriveSection({ status, onChange }: Props) {
  const [clientId, setClientId] = useState("");
  const [dbPath, setDbPath] = useState("");

  useState(() => {
    getDbPath().then((p) => setDbPath(p.path));
  });

  async function saveClientId() {
    await setDriveConfig({ client_id: clientId.trim() });
    alert("Client ID guardado");
  }

  async function connect() {
    try {
      const { url } = await startGoogleAuth();
      window.open(url, "_blank");
    } catch (err) {
      alert("Error: " + String(err));
    }
  }

  async function backup() {
    const result = await backupToDrive();
    alert(result.message);
    onChange();
  }

  async function restore() {
    if (!confirm("Se sobrescribirá la base de datos local. ¿Continuar?")) return;
    const result = await restoreFromDrive();
    alert(result.message);
    onChange();
  }

  return (
    <div>
      <h2>Google Drive</h2>
      <div className="form-row">
        <label>Client ID</label>
        <input
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="Pega aquí tu Client ID de Google Cloud"
        />
      </div>
      <p className="status">
        {status.authenticated
          ? `Conectado${status.email ? ` como ${status.email}` : ""}`
          : "No conectado a Google Drive"}
      </p>
      <div className="drive-actions">
        <button onClick={saveClientId}>Guardar Client ID</button>
        <button onClick={connect}>Conectar con Google</button>
        <button onClick={backup}>Subir copia a Drive</button>
        <button onClick={restore}>Restaurar copia de Drive</button>
      </div>
      <details className="hint">
        <summary>¿Cómo obtener el Client ID?</summary>
        <ol>
          <li>
            Ve a{" "}
            <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">
              Google Cloud Console
            </a>
            .
          </li>
          <li>Crea un proyecto y habilita la API de Google Drive.</li>
          <li>Ve a "Credenciales" → "Crear credenciales" → "ID de cliente de OAuth".</li>
          <li>Selecciona "Aplicación de escritorio".</li>
          <li>Copia el Client ID y pégalo arriba.</li>
        </ol>
      </details>
      <p className="hint">Base de datos: <span>{dbPath}</span></p>
    </div>
  );
}
