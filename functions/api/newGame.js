"use strict";

import { SQL_QUERY, getRandomWord, jsonHeader } from "./_shared";

const Difficulties = {
    easy: { min: 6, max: 8 },
    medium: { min: 8, max: 10 },
    hard: { min: 10, max: 12 },
    helldive: { min: 12, max: 99 }
}
/**
 * newGame function handler
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 * @returns 
 */
export async function onRequestGet({ env, data, request }) {
    const url = new URL(request.url)
    const difficulty = Difficulties[url.searchParams.get("difficulty")] || Difficulties.easy

    const mot = getRandomWord(difficulty.min, difficulty.max)
    /**
    * @type {import("@cloudflare/workers-types/experimental").D1Response}
    */
    const res = await env.DB.prepare(SQL_QUERY.newGame).bind(data.username, mot, "_".repeat(mot.length)).run()
    if (!res.error) return new Response(`{"wordLength":${mot.length}}`, { headers: jsonHeader })
    return new Response(res.error, { status: 500 })
}