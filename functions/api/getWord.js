/**
 * 
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 */
export async function onRequestGet({ request }) {
    const url = new URL(request.url)
    const minSize = +(url.searchParams.get("minLetters") || 6)
    const maxSize = +(url.searchParams.get("maxLetters") || 8)
    if (minSize > maxSize) return new Response("Wrong minmax values.", { status: 404 })
    return new Response(getRandomWord(minSize, maxSize))
}

/**
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
function getRandomWord(min, max) {
    if (max > Object.keys(words).length) {
        max = Object.keys(words).length - 1
        if (min > Object.keys(words).length) min = Object.keys(words).length - 1
    }
    const index = min + Math.floor(Math.random() * (max - min))
    return words[index][(Math.random() * words[index].length) | 0]
}
/**
 * @type {{[key:number]:string[]}}
 */
const words = {}
