import "source-map-support/register";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { createLogger } from "../../utils/logger";
const logger = createLogger("Update Inventory Handler");

import { UpdateInventoryRequest } from "../../requests/UpdateInventoryRequest";

import { updateInventory } from "../../businessLogic/Inventory";

import { parseToken } from "../../auth/utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const inventoryId = event.pathParameters.inventoryId;
    const updatedInventory: UpdateInventoryRequest = JSON.parse(event.body);

    const { name, price, unit } = updatedInventory;

    if (!name || !name.trim() || !price || !unit)
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request format" }),
      };

    try {
      let token: string;
      try {
        token = parseToken(event.headers.Authorization);
      } catch (err) {
        logger.error("Invalid auth", err);
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Unauthorized user" }),
        };
      }
      await updateInventory(updatedInventory, inventoryId, token);

      return {
        statusCode: 204,
        body: undefined,
      };
    } catch (err) {
      logger.error("Fail to update inventory", err);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: err.message }),
      };
    }
  }
);

handler.use(cors());
