import "source-map-support/register";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import * as uuid from "uuid";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { generateUploadUrl } from "../../businessLogic/Attachment";
import { updateInventoryAttachmentUrl } from "../../businessLogic/Inventory";

import { createLogger } from "../../utils/logger";
const logger = createLogger("Inventory businessLogic");

import { parseToken } from "../../auth/utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const inventoryId = event.pathParameters.inventoryId;
    const imageId = uuid.v4();

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

      const uploadUrl = await generateUploadUrl(inventoryId, imageId);
      await updateInventoryAttachmentUrl(inventoryId, imageId, token);

      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl,
        }),
      };
    } catch (err) {
      logger.error("Fail to get attachmentUrl", err);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: err.message }),
      };
    }
  }
);
handler.use(cors());
