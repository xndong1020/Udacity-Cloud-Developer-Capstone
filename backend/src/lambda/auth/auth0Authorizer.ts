import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import "source-map-support/register";
import Axios from "axios";

import { verify, decode } from "jsonwebtoken";
import { createLogger } from "../../utils/logger";
import { Jwt } from "../../auth/Jwt";
import { JwtPayload } from "../../auth/JwtPayload";

const logger = createLogger("auth");

// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = "https://bbxit.au.auth0.com/.well-known/jwks.json";

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info("Authorizing a user", event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info("User was authorized", jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    logger.error("User not authorized", { error: e.message });

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

const verifyToken = async (authHeader: string): Promise<JwtPayload> => {
  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;

  if (!jwt) throw new Error("invalid token");

  const cert = await getCertificate(jwksUrl);
  const verifiedToken = verify(token, cert, { algorithms: ["RS256"] });

  return verifiedToken as JwtPayload;
};

const getToken = (authHeader: string): string => {
  if (!authHeader) throw new Error("No authentication header");

  if (!authHeader.toLowerCase().startsWith("bearer "))
    throw new Error("Invalid authentication header");

  const split = authHeader.split(" ");
  const token = split[1];

  return token;
};

/**
 * Parse a JWT token and return a user id
 * @param jwksUrl wellknown jwksUrl
 * @returns a rs256 certificate
 */
const getCertificate = async (jwksUrl: string): Promise<string> => {
  const jwks = await Axios.get(jwksUrl);

  if (!jwks || !jwks.data) throw new Error("Invalid JSON Web Key Set");

  const { keys } = jwks.data;

  if (!Array.isArray(keys) || !keys.length)
    throw new Error("Invalid JSON Web Key Set");

  return `-----BEGIN CERTIFICATE-----\n${keys[0].x5c[0]}\n-----END CERTIFICATE-----`;
};
