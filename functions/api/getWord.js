//@ts-check
/**
 * @type {{[key:number]:string[]}}
 */
var words = {}
/**
 * 
 * @param {import("@cloudflare/workers-types/experimental").EventContext<Request, string, Record<string,any>>} context 
 */
export async function onRequestGet({ request }) {
    const url = new URL(request.url)
    const minSize = +(url.searchParams.get("minLetters") || 6)
    const maxSize = +(url.searchParams.get("maxLetters") || 8)
    if (minSize > maxSize) return new Response("Wrong minmax values.", { status: 404 })
    return new Response(await getRandomWord(url, minSize, maxSize))
}
/**
 * 
 * @param {URL} url 
 * @returns 
 */
async function getWords(url) {
    if (!Object.keys(words).length) (await (await fetch(`${url.origin}/lesmiserables.txt`)).text())
        .split(/[(\r?\n),. ]/).map((v) => v.normalize('NFD').replace(/\p{Diacritic}/gu, ""))
        .filter((v) => !/[A-Z']|[^a-zA-Z\s]/.test(v)).forEach((v) => {
            if (!words[v.length]) words[v.length] = []
            if (words[v.length].indexOf(v) === -1) words[v.length].push(v.toUpperCase())
        })
    return words
}
/**
 * @param {URL} url 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
async function getRandomWord(url, min, max) {
    const w = await getWords(url)
    if (max > Object.keys(w).length) {
        max = Object.keys(w).length - 1
        if (min > Object.keys(w).length) min = Object.keys(w).length - 1
    }
    const index = min + Math.floor(Math.random() * (max - min))
    return w[index][(Math.random() * w[index].length) | 0]
}