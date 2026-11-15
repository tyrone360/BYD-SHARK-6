const CACHE_NAME = "byd-shark-6-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./lab.html",
    "./offline.html",
    "./styles.css",
    "./lab.css",
    "./script.js",
    "./lab.js",
    "./manifest.webmanifest",

    "./_Assets/Advert/BYD%20Ardv.png",

    "./_Assets/Branding/apple-touch-icon.png",
    "./_Assets/Branding/byd-shark-emblem.svg",
    "./_Assets/Branding/icon-192.png",
    "./_Assets/Branding/icon-512.png",

    "./_Assets/Colours/black-side.webp",
    "./_Assets/Colours/gray-side-.webp",
    "./_Assets/Colours/shark-green.webp",
    "./_Assets/Colours/white-side-.webp",

    "./_Assets/Interior/Blue%20interior.jpg",
    "./_Assets/Interior/Desert.jpg",
    "./_Assets/Interior/interior-pc.jpg",
    "./_Assets/Interior/Nature.jpg",
    "./_Assets/Interior/purple%20interior.jpg",
    "./_Assets/Interior/River%20rocker.png",
    "./_Assets/Interior/Sun%20set.png",

    "./_Assets/Technology/Blade_battery.jpg",
    "./_Assets/Technology/BYD-e-platform-3-nav2.png",
    "./_Assets/Technology/Tech.png"
];

// Install: cache the app's pages and local assets.
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

// Activate: remove older versions of this app's cache.
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(name =>
                        name.startsWith("byd-shark-6-") &&
                        name !== CACHE_NAME
                    )
                    .map(name => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: serve cached assets and provide an offline page for navigation.
self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Do not intercept requests to other websites, such as Google Fonts.
    if (url.origin !== self.location.origin) return;

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(async () => {
                    const cachedPage = await caches.match(request);

                    if (cachedPage) return cachedPage;

                    return await caches.match("./offline.html");
                })
        );

        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) return cachedResponse;

                return fetch(request).then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, copy));
                    }

                    return response;
                });
            })
    );
});