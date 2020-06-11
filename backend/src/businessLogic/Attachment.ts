import AttachmentRepository from '../dataLayer/AttachmentRepository'
import InventoryRepository from "../dataLayer/InventoryRepository";

const attachmentRepo = new AttachmentRepository()
const inventoryRepository = new InventoryRepository()

export const generateUploadUrl = async (
  inventoryId: string,
  imageId: string
): Promise<string> => {
  const isInventoryItemExists = await inventoryRepository.checkInventoryItemExists(inventoryId)
  if (!isInventoryItemExists) throw new Error('Invalid inventoryId')

  return attachmentRepo.generateUploadUrl(imageId)
}
