export default interface InventoryItem {
  userId: string;
  inventoryId: string;
  createdAt: string;
  name: string;
  price: number;
  unit: number;
  attachmentUrl?: string;
}
