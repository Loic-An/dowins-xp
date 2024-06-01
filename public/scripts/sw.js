const VERSION = 1
const PRECACHE = `precache-v${VERSION}`;
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
    "/apps/command_prompt/app.css",
    "/apps/hangman/app.css",
    "/apps/internet_explorer/app.css",
    "/apps/media_center/app.css",
    "/apps/flipper/app.css",
    "/apps/command_prompt/app.js",
    "/apps/hangman/app.js",
    "/apps/internet_explorer/app.js",
    "/apps/media_center/app.js",
    "/apps/flipper/app.js",
    "/apps/command_prompt/app.ico",
    "/apps/hangman/app.ico",
    "/apps/internet_explorer/app.ico",
    "/apps/media_center/app.ico",
    "/apps/flipper/app.ico",
    "/images/bclose.png",
    "/images/bmaximize.png",
    "/images/bminimize.png"];

/**
 * @type {(event: import("@cloudflare/workers-types/experimental").ExtendableEvent) => void}  
 */
const oninstall = (event) => {
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(self.skipWaiting())
    );
};
// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', oninstall)

/**
 * @type {(event: import("@cloudflare/workers-types/experimental").ExtendableEvent) => void}
 */
const onactivate = (event) => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
};

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', onactivate)

/**
 * @param {import("@cloudflare/workers-types/experimental").FetchEvent} event  
 */
const onfetch = (event) => {
    if (event.request.method !== "GET") return;
    if (event.request.url.startsWith("/api/")) return;
    console.log(event.request.url);
    // Prevent the default, and handle the request ourselves.
    event.respondWith(caches.match(event.request)
        .then((r) => r ?? fetch(event.request))
        .then((res) => {
            caches.open(RUNTIME).then((cache) => {
                cache.put(event.request, res);
            });
            return res.clone();
        }).catch(() => new Response("Failed to fetch", { status: -1 })))
};

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', onfetch)
