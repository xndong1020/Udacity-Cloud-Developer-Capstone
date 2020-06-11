import "source-map-support/register";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createLogger } from "../../utils/logger";
const logger = createLogger("Get Inventory Handler");

import { getAllInventoriesByUserId } from "../../businessLogic/Inventory";
import { parseToken } from "../../auth/utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

      const items = await getAllInventoriesByUserId(token);

      return {
        statusCode: 200,
        body: JSON.stringify({ items }),
      };
    } catch (err) {
      logger.error("Fail to get inventory list", err);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: err.message }),
      };
    }
  }
);

handler.use(cors());
