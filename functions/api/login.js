"use strict";
import { comparePassword, createNewToken, prepareDBpassword } from "./_shared";

/**
 * login function
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 * @returns 
 */
export async function onRequestPost({ data, env }) {
    console.log(data)
    const res = await prepareDBpassword(env.DB, data.username)
    console.log(res)
    if (res.error) throw new Error(res.error)
    if (!res.results[0]) return new Response("User not found", { status: 404 })
    if (!comparePassword(data.password, res.results[0].Password)) return new Response("Invalid password", { status: 401 })
    return new Response(await createNewToken(data.username, env), { status: 201 })

}
