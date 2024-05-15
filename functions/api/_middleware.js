"use strict";

import { verifyToken } from "./_shared";

/**
 * Middleware function for GET requests on /api/*
 * @type {import("@cloudflare/workers-types/experimental").PagesFunction} 
 */
const ApiGetMiddleware = async ({ request, env, next, data }) => {
    if (!request.headers.has("token")) {
        return new Response("Unauthorized", { status: 401 });
    }
    const token = request.headers.get("token") || ""; // || "" is for non-null check but it's obviously not empty
    try {
        const res = await verifyToken(token, env);
        //res.payload
        if (!res.payload.exp || res.payload.exp < Date.now() / 1000) {
            return new Response("Token expired", { status: 401 });
        }
        data.username = res.payload.sub;
    }
    catch (error) {
        console.error(error);
        return new Response("Invalid token", { status: 401 });
    }
    return await next();
}
/**
 * Middleware function for POST requests on /api/*
 * check body for username and password
 * 
 * 
 * @type {import("@cloudflare/workers-types/experimental").PagesFunction}
 * @returns 
 */
const ApiPostMiddleware = async ({ request, next, data }) => {
    if (!request.headers.has("content-type") || request.headers.get("content-type") !== "application/json") {
        return new Response("Invalid content-type", { status: 400 });
    }
    let res = ''
    if (!request.body) {
        return new Response("Missing body", { status: 400 })
    }
    const rawbody = await request.body.getReader().read()
    if (!rawbody.value) {
        return new Response("Empty body", { status: 400 })
    }
    if (rawbody.value instanceof Uint8Array) {
        res = new TextDecoder().decode(rawbody.value)
    }
    if (typeof rawbody.value === 'string') {
        res = rawbody.value
    }
    if (!res) return new Response("Invalid body", { status: 400 })
    let body;
    try {
        body = JSON.parse(res)
    } catch (error) {
        return new Response("Cannot parse body as JSON", { status: 400 })
    }
    if (!body.username) return new Response("Missing username", { status: 400 })
    if (!body.password) return new Response("Missing password", { status: 400 })
    if (typeof body.username !== 'string') return new Response("Invalid username", { status: 400 })
    if (typeof body.password !== 'string') return new Response("Invalid password", { status: 400 })
    if (Object.keys(body).length > 2) return new Response("Unknown fields in body", { status: 400 })
    data.username = body.username
    data.password = body.password
    return await next();
}

export const onRequestGet = [ApiGetMiddleware]
export const onRequestPost = [ApiPostMiddleware]