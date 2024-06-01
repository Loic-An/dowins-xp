import { SQL_QUERY, jsonHeader } from "../_shared"

/**
 * 
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 * @returns 
 */
export async function onRequestGet({ params, env, data }) {
    if (!params.letter) {
        return new Response("Missing letter", { status: 400 })
    }
    if (params.letter.length !== 1) {
        return new Response("More than one letter", { status: 400 })
    }
    const letter = params.letter[0].toLowerCase()
    if (!/[a-z]/.test(letter)) {
        return new Response("Not a letter", { status: 400 })
    }
    /**
     * @type {import("@cloudflare/workers-types/experimental").D1Response}
     */
    const req = await env.DB.prepare(SQL_QUERY.getGame).bind(data.username).run()
    if (req.error) {
        return new Response("unable to access game", { status: 500 })
    }
    if (!req.results.length) {
        return new Response("given user does not have any active game", { status: 400 })
    }
    /**
     * @type {{Username:string,Word:string, CorrectGuesses:string, IncorrectGuesses:string}}
     */
    const game = req.results[0]
    console.log("before", game)
    let positions = []
    let isGameOver = false
    for (let i = 0; i < game.Word.length; i++) {
        if (game.Word[i] === letter) {
            positions.push(i)
        }
    }
    if (!positions.length) {
        if (!game.IncorrectGuesses.includes(letter)) game.IncorrectGuesses += letter
        isGameOver = game.IncorrectGuesses.length > 6
    } else {
        game.CorrectGuesses = game.CorrectGuesses.split('').map((v, i) => positions.includes(i) ? letter : v).join('')
        isGameOver = game.CorrectGuesses === game.Word
    }
    console.log("after", game)
    const res = await env.DB.prepare(isGameOver ? SQL_QUERY.deleteGame : SQL_QUERY.updateGame).bind(...(isGameOver ? [data.username] : [data.username, game.CorrectGuesses, game.IncorrectGuesses])).run()
    if (res.error) {
        return new Response("unable to update gameState", { status: 500 })
    }
    if (!positions.length) {
        if (isGameOver) {
            return new Response(JSON.stringify({ letter, isCorrect: false, errors: game.IncorrectGuesses.length, isGameOver, word: game.Word }), { headers: jsonHeader })
        } else
            return new Response(JSON.stringify({ letter, isCorrect: false, errors: game.IncorrectGuesses.length, isGameOver }), { headers: jsonHeader })
    }
    return new Response(JSON.stringify({ letter, isCorrect: true, positions, isGameOver }), { headers: jsonHeader })
}