import type { Transaction } from "../../domain/entities";
import { btn, btnSecondary, modal, modalActions, modalOverlay, table, tableWrap, td, th } from "../styles";

interface Props {
  matches: Transaction[];
  onUpdate: (tx: Transaction) => void;
  onAddNew: () => void;
  onCancel: () => void;
}

export function SimilarTransactionDialog({ matches, onUpdate, onAddNew, onCancel }: Props) {
  function formatMoney(n: number) {
    return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  }

  return (
    <div className={modalOverlay}>
      <div className={modal}>
        <h2>Movimiento similar encontrado</h2>
        <p>Ya existe al menos un movimiento con la misma fecha e importe. ¿Quieres actualizar uno de ellos o añadir uno nuevo?</p>

        <div className={tableWrap}>
          <table className={table}>
            <thead>
              <tr>
                <th className={th}>Fecha</th>
                <th className={th}>Concepto</th>
                <th className={th}>Importe</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {matches.map((tx) => (
                <tr key={tx.id}>
                  <td className={td}>{tx.date}</td>
                  <td className={td}>{tx.concept}</td>
                  <td className={td}>{formatMoney(tx.amount)}</td>
                  <td className={td}>
                    <button className={`${btn} px-2 py-1 text-[0.85rem]`} onClick={() => onUpdate(tx)}>
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={modalActions}>
          <button className={btn} onClick={onAddNew}>Añadir como nuevo</button>
          <button className={btnSecondary} onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
