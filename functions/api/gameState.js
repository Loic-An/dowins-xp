/**
 * newGame function handler
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 * @returns 
 */
export async function onRequestGet(context) {
    if (data.username) {
        /**
         * @type {import("@cloudflare/workers-types/experimental").D1Response}
         */
        const res = await env.DB.prepare("Select * from FROM Games WHERE Username = ?1").bind(data.username).run()
        if (!res.error) {
            if (!res.results.length) return new Response({})
            /**
             * @type {{Word:string, CorrectGuesses:string, IncorrectGuesses:string}}
             */
            const p = res.results[0]
            return new Response({ wordLength: p.Word.length, errors: p.IncorrectGuesses.length, correctLetters: p.CorrectGuesses, isGameOver: p.IncorrectGuesses.length > 7 })

        }
    }
    return new Response(context)
}