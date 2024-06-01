"use strict";
import { SQL_QUERY, hashPassword } from "./_shared";
/**
 * signin function
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 * @returns 
 */
export async function onRequestPost({ env, data }) {
    const res1 = await env.DB.prepare(SQL_QUERY.getPassword).bind(data.username).run()
    if (res1.error) throw new Error(res1.error)
    if (res1.results[0]) return new Response("User already exists", { status: 409 })
    const res = await env.DB.prepare(SQL_QUERY.createUser).bind(data.username, hashPassword(data.password)).run()
    console.log(res)
    if (res.error) throw new Error(res.error)
    return new Response(`User ${data.username} created`, { status: 201 })
}
