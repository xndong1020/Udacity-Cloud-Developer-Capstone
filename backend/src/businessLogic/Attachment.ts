import AttachmentRepository from '../dataLayer/AttachmentRepository'
import InventoryRepository from "../dataLayer/InventoryRepository";

const attachmentRepo = new AttachmentRepository()
const inventoryRepository = new InventoryRepository()

export const generateUploadUrl = async (
  inventoryId: string,
  imageId: string
): Promise<string> => {
  const isTodoItemExists = await inventoryRepository.checkInventoryItemExists(inventoryId)
  if (!isTodoItemExists) throw new Error('Invalid inventoryId')

  return attachmentRepo.generateUploadUrl(imageId)
}
