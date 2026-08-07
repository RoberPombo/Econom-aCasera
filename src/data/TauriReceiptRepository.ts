import { invoke } from "@tauri-apps/api/core";
import type { ReceiptRepository } from "../domain/repositories/ReceiptRepository";

export class TauriReceiptRepository implements ReceiptRepository {
  async save(
    transactionId: number,
    bytes: Uint8Array,
    extension: string,
  ): Promise<string> {
    return invoke<string>("save_receipt", {
      transactionId,
      bytes: Array.from(bytes),
      extension,
    });
  }

  async readAsDataUrl(relativePath: string): Promise<string> {
    return invoke<string>("read_receipt", { relativePath });
  }

  async delete(relativePath: string): Promise<void> {
    await invoke("delete_receipt", { relativePath });
  }
}
