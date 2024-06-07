const VERSION = "current"
const PRECACHE = `precache-${VERSION}`;
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = ["/",
    "/scripts/shared.js",
    "/style/main.css",
    "/style/bios.css",
    "/style/desktop.css",
    "/images/energy.svg",
    "/images/background.jpg",
    "/images/xp48.svg",
    "/images/xp480_gradient.svg",
    "/images/plane.png",
    "/scripts/desktop/XPWindow.js",
    "/scripts/desktop/main.js",
    "/scripts/desktop/WindowManager.js",
    "/scripts/bios.js",
    "/scripts/main.js",
    "/images/startmenu/170.ico",
    "/images/796.ico",
    "/images/123.ico",
    "/images/startmenu/142.ico",
    "/images/startmenu/1375.ico",
    "/images/startmenu/436.ico",
    "/images/xp48_gradient.svg",
    "/images/startmenu/217.ico",
    "/images/startmenu/241.ico",
    "/images/startmenu/182.ico",
    "/images/startmenu/338.ico",
    "/fonts/Perfect_DOS_VGA_437.ttf",
    "/sounds/startup.mp3",
    "/images/264.ico",
    "/images/startmenu/633.ico",
    "/images/497.ico",
    "/site.webmanifest",
    "/images/bclose.png",
    "/images/bmaximize.png",
    "/images/bminimize.png"];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', (/**@type {import("@cloudflare/workers-types/experimental").ExtendableEvent}*/event) => {
    event.waitUntil(caches.open(PRECACHE)
        .then(cache => cache.addAll(PRECACHE_URLS))
        .then(self.skipWaiting())
    );
})

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (/**@type {import("@cloudflare/workers-types/experimental").ExtendableEvent}*/event) => {
    const currentCaches = [PRECACHE];
    event.waitUntil(caches.keys().then(cacheNames =>
        cacheNames.filter(cacheName => !currentCaches.includes(cacheName)))
        .then(cachesToDelete => Promise.all(cachesToDelete.map(cacheToDelete =>
            caches.delete(cacheToDelete))))
        .then(() => self.clients.claim()));
    console.log("Service Worker activated, version " + VERSION)
})

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', (/** @type {import("@cloudflare/workers-types/experimental").FetchEvent} */event) => {
    if (event.request.method !== "GET") return;
    if (event.request.url.startsWith("/api/")) return;
    // Prevent the default, and handle the request ourselves.
    event.respondWith(caches.match(event.request)
        .then((r) => r ?? fetch(event.request))
        .then((res) => {
            caches.open(RUNTIME).then((cache) => {
                cache.put(event.request, res);
            });
            return res.clone();
        }).catch(() => new Response("Failed to fetch", { status: -1 })))
})

self.addEventListener('message', (event) => {
    if (event.data === "clear") {
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                return caches.delete(cacheName);
            }));
        }).then(() => console.log("cacheclear"), console.error);
    }
})
