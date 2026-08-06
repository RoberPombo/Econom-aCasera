export interface ReceiptRepository {
  save(transactionId: number, bytes: Uint8Array, extension: string): Promise<string>;
  readAsDataUrl(relativePath: string): Promise<string>;
  delete(relativePath: string): Promise<void>;
}
