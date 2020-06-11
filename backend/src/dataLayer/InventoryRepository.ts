import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

import InventoryItem from "../models/InventoryItem";
import InventoryUpdate from "../models/InventoryUpdate";
import { createLogger } from "../utils/logger";

export default class InventoryRepository {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly logger = createLogger("Inventory Repository"),
    private readonly inventoryTable = process.env.INVENTORY_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX
  ) {}

  getInventoryItems = async (userId: string): Promise<InventoryItem[]> => {
    this.logger.info(`Getting inventory items for user: ${userId}`);

    const result = await this.docClient
      .query({
        TableName: this.inventoryTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();

    const items = result.Items;
    return items as InventoryItem[];
  };

  createInventoryItem = async (
    inventoryItem: InventoryItem
  ): Promise<InventoryItem> => {
    await this.docClient
      .put({
        TableName: this.inventoryTable,
        Item: inventoryItem,
      })
      .promise();

    return inventoryItem;
  };

  updateInventoryItem = async (
    inventoryItem: InventoryUpdate,
    inventoryId: string,
    userId: string
  ): Promise<void> => {
    const expression = generateUpdateQuery(inventoryItem);

    const params = {
      // Key, Table, etc..
      TableName: this.inventoryTable,
      Key: {
        inventoryId: inventoryId,
        userId: userId,
      },
      ...expression,
    };

    await this.docClient.update(params).promise();
  };

  updateInventoryAttachmentUrl = async (
    attachmentUrl: string,
    inventoryId: string,
    userId: string
  ): Promise<void> => {
    const params = {
      TableName: this.inventoryTable,
      Key: {
        inventoryId: inventoryId,
        userId: userId,
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": attachmentUrl,
      },
    };

    await this.docClient.update(params).promise();
  };

  deleteInventoryItem = async (
    inventoryId: string,
    userId: string
  ): Promise<void> => {
    const params = {
      // Key, Table, etc..
      TableName: this.inventoryTable,
      Key: {
        inventoryId: inventoryId,
        userId: userId,
      },
      ConditionExpression: "inventoryId = :inventoryId",
      ExpressionAttributeValues: {
        ":inventoryId": inventoryId,
      },
    };

    await this.docClient.delete(params).promise();
  };

  checkInventoryItemExists = async (inventoryId: string): Promise<boolean> => {
    const result = await this.docClient
      .query({
        TableName: this.inventoryTable,
        KeyConditionExpression: "inventoryId = :inventoryId",
        ExpressionAttributeValues: {
          ":inventoryId": inventoryId,
        },
      })
      .promise();
    return !!result.Count;
  };
}

const generateUpdateQuery = (fields: any) => {
  let exp = {
    UpdateExpression: "set",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  };
  Object.entries(fields).forEach(([key, item]) => {
    exp.UpdateExpression += ` #${key} = :${key},`;
    exp.ExpressionAttributeNames[`#${key}`] = key;
    exp.ExpressionAttributeValues[`:${key}`] = item;
  });
  exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
  return exp;
};

const createDynamoDBClient = () => {
  if (process.env.IS_OFFLINE) {
    this.logger.info("Creating a local DynamoDB instance");
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
};
