export function onRequestGet(context) {
    if (!context.params.letter) {
        return new Response("Missing letter", { status: 400 })
    }
    if (context.params.letter.length !== 1) {
        return new Response("More than one letter", { status: 400 })
    }
    return new Response(context.params.letter.toUpperCase())
}