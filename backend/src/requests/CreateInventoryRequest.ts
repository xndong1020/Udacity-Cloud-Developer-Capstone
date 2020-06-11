/**
 * Fields in a request to create a single Inventory item.
 */
export interface CreateInventoryRequest {
  name: string;
  price: number;
  unit: number;
}
