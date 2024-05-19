"use strict";
import { hashPassword, prepareDBpassword } from "./_shared";
/**
 * signin function
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 * @returns 
 */
export async function onRequestPost({ env, data }) {
    const res1 = await prepareDBpassword(env.DB, data.username)
    if (res1.error) throw new Error(res1.error)
    if (res1.results[0]) return new Response("User already exists", { status: 409 })
    const res = await env.DB.prepare('INSERT INTO Users (Username, Password, Wins, Losses) VALUES (?1, ?2, 0, 0)').bind(data.username, hashPassword(data.password)).run()
    console.log(res)
    if (res.error) throw new Error(res.error)
    return new Response(`User ${data.username} created`, { status: 201 })
}
