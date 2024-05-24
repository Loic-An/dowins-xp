"use strict";

import { getRandomWord } from "./_shared";

/**
 * newGame function handler
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 * @returns 
 */
export async function onRequestGet({ data }) {
    if (data.username) {
        const mot = getRandomWord(6, 8)
        /**
         * @type {import("@cloudflare/workers-types/experimental").D1Response}
         */
        const res = await env.DB.prepare('INSERT INTO Games (Username, Word, CorrectGuesses, IncorrectGuesses) VALUES (?1, ?2, ?3, "")').bind(data.username, mot, "_".repeat(mot.length)).run()
        if (!res.error) return new Response({ wordLength: mot.length })
        return new Response(res.error, { status: 500 })
    }
    return new Response("no username in token? wat", { status: 400 })
}