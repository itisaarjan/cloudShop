import {
    APIGatewayProxyHandlerV2,
    APIGatewayProxyResultV2,
  } from "aws-lambda";
  import crypto from "crypto";
  import * as jwt from "jsonwebtoken";
  import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
  import { URLSearchParams } from "url";
  import fetch from "node-fetch";
  
  const {
    USER_POOL_DOMAIN,
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    TABLE_NAME,
    COOKIE_DOMAIN,
    COOKIE_SECURE,
    SESSION_TTL_DAYS,
  } = process.env;
  
  const ddb = new DynamoDBClient({});
  
  const okText = (status: number, text: string): APIGatewayProxyResultV2 => ({
    statusCode: status,
    headers: { "Content-Type": "text/plain" },
    body: text,
  });
  
  const redirect = (
    location: string,
    cookieList?: string[]
  ): APIGatewayProxyResultV2 => {
    const res: APIGatewayProxyResultV2 = {
      statusCode: 302,
      headers: {
        Location: location,
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
      body: "",
    };
    if (cookieList && cookieList.length) {
      // v2 supports top-level cookies array
      res.cookies = cookieList;
    }
    return res;
  };
  
  function base64Basic(id: string, secret: string) {
    return Buffer.from(`${id}:${secret}`).toString("base64");
  }
  
  function daysFromNow(days: number) {
    const t = new Date();
    t.setDate(t.getDate() + days);
    return Math.floor(t.getTime() / 1000);
  }
  
  function setCookieHeaderValue(name: string, value: string, maxAgeSeconds: number) {
    const parts: string[] = [`${name}=${value}`, "Path=/", `Max-Age=${maxAgeSeconds}`, "HttpOnly", "SameSite=None"];
    if (COOKIE_DOMAIN) parts.push(`Domain=${COOKIE_DOMAIN}`);
    if (COOKIE_SECURE === "true") parts.push("Secure");
    return parts.join("; ");
  }
  
  export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
      const code = event.queryStringParameters?.code;
      if (!code) {
        return okText(400, "Missing code");
      }
  
      // Exchange code for tokens
      const tokenEndpoint = `${USER_POOL_DOMAIN!.replace(/\/$/, "")}/oauth2/token`;
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID!,
        code,
        redirect_uri: REDIRECT_URI!,
      });
  
      const headers: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
      };
      if (CLIENT_SECRET) {
        headers.Authorization = `Basic ${base64Basic(CLIENT_ID!, CLIENT_SECRET)}`;
      }
  
      const tokenRes = await fetch(tokenEndpoint, { method: "POST", headers, body });
      if (!tokenRes.ok) {
        const txt = await tokenRes.text();
        console.error("Token exchange failed:", tokenRes.status, txt);
        return redirect("/login?error=token_exchange_failed");
      }
  
      const tokenJson = await tokenRes.json();
      const { id_token, access_token, refresh_token, expires_in } = tokenJson as {
        id_token: string;
        access_token: string;
        refresh_token?: string;
        expires_in: number;
      };
  
      const decoded: any = jwt.decode(id_token) || {};
      const sub = decoded.sub || "unknown";
      const email = decoded.email || decoded["cognito:username"] || "";
  
      // Create session
      const sid = crypto.randomUUID();
      const ttlDays = Number(SESSION_TTL_DAYS || "30");
      const ttl = daysFromNow(ttlDays);
  
      const refreshHash = refresh_token
        ? crypto.createHash("sha256").update(refresh_token).digest("hex")
        : "";
  
      await ddb.send(
        new PutItemCommand({
          TableName: TABLE_NAME!,
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
          },
        })
      );
  
      const cookie = setCookieHeaderValue("sid", sid, ttlDays * 24 * 60 * 60);
  
      return redirect("https://www.cloudshop.click/", [cookie]);
    } catch (err) {
      console.error("Callback error:", err);
      return redirect("/login?error=unexpected");
    }
  };
  