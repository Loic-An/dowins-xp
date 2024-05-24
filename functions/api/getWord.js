import { getRandomWord } from "./_shared"
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