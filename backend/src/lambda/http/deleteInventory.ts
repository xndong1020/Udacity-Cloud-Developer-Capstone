import "source-map-support/register";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { createLogger } from "../../utils/logger";
const logger = createLogger("Get Inventory Handler");

import { deleteInventory } from "../../businessLogic/Inventory";
import { parseToken } from "../../auth/utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const inventoryId = event.pathParameters.inventoryId;

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
      await deleteInventory(inventoryId, token);

      return {
        statusCode: 204,
        body: undefined,
      };
    } catch (err) {
      logger.error("Fail to delete inventory item", err);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: err.message }),
      };
    }
  }
);

handler.use(cors());
