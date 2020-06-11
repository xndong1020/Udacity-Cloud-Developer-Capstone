import "source-map-support/register";

import * as middy from "middy";
import { cors } from "middy/middlewares";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { CreateInventoryRequest } from "../../requests/CreateInventoryRequest";
import { createInventory } from "../../businessLogic/Inventory";

import { createLogger } from "../../utils/logger";
const logger = createLogger("Inventory businessLogic");

import { parseToken } from "../../auth/utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newInventory: CreateInventoryRequest = JSON.parse(event.body);

    const { name, price, unit } = newInventory;

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
          statusCode: 403,
          body: JSON.stringify({ message: "Unauthorized user" }),
        };
      }

      const item = await createInventory(newInventory, token);

      return {
        statusCode: 201,
        body: JSON.stringify({ item }),
      };
    } catch (err) {
      logger.error("Fail to create inventory", err);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: err.message }),
      };
    }
  }
);

handler.use(cors());
