"use strict";
import { comparePassword, createNewToken } from "./_shared";

/**
 * login function
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 * @returns 
 */
export async function onRequestPost({ data, env }) {
    console.log(data)
    /**
     * @type {import("@cloudflare/workers-types/experimental").D1Response}
     */
    const res = await env.DB.prepare('SELECT Password FROM Users WHERE Username = ?1').bind(data.username).run()
    console.log(res)
    if (res.error) throw new Error(res.error)
    if (!res.results) return new Response("User not found", { status: 404 })
    if (!comparePassword(data.password, res.results[0].Password)) return new Response("Invalid password", { status: 401 })

    return new Response(await createNewToken(data.username, env), { status: 201 })

}
