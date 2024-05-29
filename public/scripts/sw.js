// Service Worker code
/**
 * @type {(event: import("@cloudflare/workers-types/experimental").ExtendableEvent) => void}  
 */
const oninstall = (event) => {
    event.waitUntil(
        caches.open('file').then((cache) => {
            return cache.addAll(["/index.html"]);
        })
    );
}
/**
 * @type {(event: import("@cloudflare/workers-types/experimental").ExtendableEvent) => void}
 */
self.onactivate = (event) => { }

/**
 * @param {import("@cloudflare/workers-types/experimental").FetchEvent} event  
 */
self.addEventListener('fetch', (event) => {
    if (event.request.method !== "GET") return;
    if (event.request.url.startsWith("/api/")) return;
    console.log(event.request.url);
    // Prevent the default, and handle the request ourselves.
    event.respondWith(caches.match(event.request)
        .then((r) => r ?? fetch(event.request))
        .then((res) => {
            caches.open("v1").then((cache) => {
                cache.put(event.request, res);
            });
            return res.clone();
        }).catch(() => new Response("Failed to fetch", { status: -1 })))
})