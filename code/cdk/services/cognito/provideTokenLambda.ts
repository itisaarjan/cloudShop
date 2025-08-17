import type { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const {
  USER_POOL_DOMAIN,
  CLIENT_ID,
  REDIRECT_URI,
  TABLE_NAME,
  COOKIE_DOMAIN,
  COOKIE_SECURE,
  SESSION_TTL_DAYS,
  CLIENT_SECRET_ARN,
} = process.env;

const ddb = new DynamoDBClient({});
const sm = new SecretsManagerClient({});

let CLIENT_SECRET_CACHE: string | undefined;

async function getClientSecret(): Promise<string | undefined> {
  if (!CLIENT_SECRET_ARN) return undefined;
  if (CLIENT_SECRET_CACHE) return CLIENT_SECRET_CACHE;

  const { SecretString } = await sm.send(
    new GetSecretValueCommand({ SecretId: CLIENT_SECRET_ARN })
  );
  if (!SecretString) throw new Error("Cognito client secret missing");
  CLIENT_SECRET_CACHE = SecretString;
  return CLIENT_SECRET_CACHE;
}

function okText(status: number, text: string): APIGatewayProxyResult {
  return {
    statusCode: status,
    headers: { "Content-Type": "text/plain" },
    body: text,
  };
}

function redirectAbsolute(location: string, setCookie?: string): APIGatewayProxyResult {
  const headers: Record<string, string> = {
    Location: location,
    "Cache-Control": "no-store",
    Pragma: "no-cache",
  };
  if (setCookie) {
    headers["Set-Cookie"] = setCookie;
  }
  return { statusCode: 302, headers, body: "" };
}

function base64Basic(id: string, secret: string) {
  return Buffer.from(`${id}:${secret}`).toString("base64");
}

function epochSecondsDaysFromNow(days: number) {
  const t = new Date();
  t.setDate(t.getDate() + days);
  return Math.floor(t.getTime() / 1000);
}

function cookieString(name: string, value: string, maxAgeSeconds: number) {
  const parts: string[] = [
    `${name}=${value}`,
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    "HttpOnly",
    "SameSite=None",
  ];
  if (COOKIE_DOMAIN) parts.push(`Domain=${COOKIE_DOMAIN}`);
  if (COOKIE_SECURE === "true") parts.push("Secure");
  return parts.join("; ");
}

const APP_HOME = "https://www.cloudshop.click/";
const APP_LOGIN_ERROR_BASE = "https://www.cloudshop.click/login";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const code = event.queryStringParameters?.code;
    const state = event.queryStringParameters?.state;

    if (!code) {
      return okText(400, "Missing authorization code");
    }
    if (!USER_POOL_DOMAIN || !CLIENT_ID || !REDIRECT_URI || !TABLE_NAME) {
      return redirectAbsolute(`${APP_LOGIN_ERROR_BASE}?error=server_config`);
    }

    const tokenEndpoint = `${USER_POOL_DOMAIN.replace(/\/$/, "")}/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code,
      redirect_uri: REDIRECT_URI,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const secret = await getClientSecret();
    if (secret) {
      headers.Authorization = `Basic ${base64Basic(CLIENT_ID, secret)}`;
    }

    const tokenRes = await fetch(tokenEndpoint, { method: "POST", headers, body });
    if (!tokenRes.ok) {
      return redirectAbsolute(`${APP_LOGIN_ERROR_BASE}?error=token_exchange_failed`);
    }

    const tokenJson = (await tokenRes.json()) as {
      id_token: string;
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    const { id_token, access_token, refresh_token, expires_in } = tokenJson;

    const decoded: any = jwt.decode(id_token) || {};
    const sub = decoded.sub || "unknown";
    const email = decoded.email || decoded["cognito:username"] || "";

    const sid = crypto.randomUUID();
    const ttlDays = Number(SESSION_TTL_DAYS || "30");
    const ttl = epochSecondsDaysFromNow(ttlDays);

    const refreshHash = refresh_token
      ? crypto.createHash("sha256").update(refresh_token).digest("hex")
      : "";

    await ddb.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          sid: { S: sid },
          sub: { S: sub },
          email: { S: email },
          idToken: { S: id_token },
          accessToken: { S: access_token },
          refreshTokenHash: { S: refreshHash },
          ttl: { N: String(ttl) },
          createdAt: { N: String(Math.floor(Date.now() / 1000)) },
          expiresIn: { N: String(expires_in) },
          ...(state ? { state: { S: state } } : {}),
        },
      })
    );

    const cookie = cookieString("sid", sid, ttlDays * 24 * 60 * 60);
    return redirectAbsolute(APP_HOME, cookie);
  } catch (err) {
    return redirectAbsolute(`${APP_LOGIN_ERROR_BASE}?error=unexpected`);
  }
};
