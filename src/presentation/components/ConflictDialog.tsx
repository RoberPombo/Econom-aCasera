interface Props {
  onReload: () => Promise<void>;
  onOverwrite: () => Promise<void>;
  onCancel: () => void;
}

export function ConflictDialog({ onReload, onOverwrite, onCancel }: Props) {
  async function handleReload() {
    await onReload();
  }

  async function handleOverwrite() {
    if (!confirm("¿Seguro? Se perderán los cambios hechos en otro dispositivo.")) return;
    await onOverwrite();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Conflicto detectado</h2>
        <p>Los datos han cambiado en otro dispositivo.</p>
        <p>¿Qué quieres hacer?</p>
        <div className="modal-actions">
          <button onClick={handleReload}>Recargar datos remotos</button>
          <button onClick={handleOverwrite}>Usar mis datos locales</button>
          <button className="secondary" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
