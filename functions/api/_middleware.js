//@ts-check
"use strict";
import * as jose from "jose";
//const start = Date.now();
//const appsInstalled = ['command_prompt', 'internet_explorer', 'media_player', 'hangman']
const key = await jose.importJWK({ kty: "oct", k: " ", alg: "HS256" })
/**
 * Middleware function
 * @type {import("@cloudflare/workers-types/experimental").PagesFunction} 
 * 
 */
const Middleware = async ({ request, env, next, data }) => {
    if (request.method !== "GET") return await next();
    if (!request.headers.has("token")) {
        // @ts-ignore
        return new Response("Unauthorized", { status: 401 });
    }
    const token = request.headers.get("token") || ""; // || "" is for TS

    await jose.jwtVerify(token, key, { issuer: "Socrimoft", audience: "Dowins_XP", clockTolerance: 60 })

    return await next();
}

export const onRequest = [Middleware]
