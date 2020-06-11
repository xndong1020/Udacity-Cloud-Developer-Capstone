import * as uuid from "uuid";

import InventoryItem from "../models/InventoryItem";
import InventoryRepository from "../dataLayer/InventoryRepository";

import { CreateInventoryRequest } from "../requests/CreateInventoryRequest";
import { UpdateInventoryRequest } from "../requests/UpdateInventoryRequest";

import { parseUserId } from "../auth/utils";

// import { createLogger } from "../utils/logger";
// const logger = createLogger("Inventory businessLogic");

const inventoryRepo = new InventoryRepository();

const bucketName = process.env.ATTACHMENTS_S3_BUCKET;

export const getAllInventoriesByUserId = async (
  jwtToken: string
): Promise<InventoryItem[]> => {
  const userId = parseUserId(jwtToken);
  return inventoryRepo.getInventoryItems(userId) || [];
};

export const createInventory = async (
  createInventoryRequest: CreateInventoryRequest,
  jwtToken: string
): Promise<InventoryItem> => {
  const inventoryId = uuid.v4();
  const userId = parseUserId(jwtToken);

  return await inventoryRepo.createInventoryItem({
    inventoryId,
    userId,
    name: createInventoryRequest.name,
    price: createInventoryRequest.price,
    unit: createInventoryRequest.unit,
    createdAt: new Date().toISOString(),
    attachmentUrl: "",
  });
};

export const updateInventory = async (
  updateInventoryRequest: UpdateInventoryRequest,
  inventoryId: string,
  jwtToken: string
): Promise<void> => {
  const userId = parseUserId(jwtToken);
  await inventoryRepo.updateInventoryItem(
    {
      name: updateInventoryRequest.name,
      price: updateInventoryRequest.price,
      unit: updateInventoryRequest.unit,
    },
    inventoryId,
    userId
  );
};

export const updateInventoryAttachmentUrl = async (
  inventoryId: string,
  imageId: string,
  jwtToken: string
): Promise<void> => {
  const userId = parseUserId(jwtToken);
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`;
  await inventoryRepo.updateInventoryAttachmentUrl(
    attachmentUrl,
    inventoryId,
    userId
  );
};

export const deleteInventory = async (
  inventoryId: string,
  jwtToken: string
): Promise<void> => {
  const userId = parseUserId(jwtToken);
  await inventoryRepo.deleteInventoryItem(inventoryId, userId);
};
