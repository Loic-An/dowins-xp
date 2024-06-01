import { SQL_QUERY, jsonHeader } from "./_shared"

/**
 * newGame function handler
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 * @returns 
 */
export async function onRequestGet({ env, data }) {
    /**
     * @type {import("@cloudflare/workers-types/experimental").D1Response}
     */
    const res = await env.DB.prepare(SQL_QUERY.getGame).bind(data.username).run()
    if (!res.error) {
        if (!res.results.length) return new Response("{}", { headers: jsonHeader })
        /**
         * @type {{Word:string, CorrectGuesses:string, IncorrectGuesses:string}}
         */
        const p = res.results[0]

        return new Response(JSON.stringify({
            wordLength: p.Word.length, nbErrors: p.IncorrectGuesses.length,
            correctLetters: p.CorrectGuesses.toUpperCase().split(''), incorrectLetters: p.IncorrectGuesses.toUpperCase().split('')
        }), { headers: jsonHeader })
    }
}