/* V.C. Tips service worker: installable app that also opens without a connection.
   - Files from this site: network first (always the latest version), cached copy when offline.
   - Firebase libraries (www.gstatic.com/firebasejs, pinned version) and Google Fonts: cached copy first,
     so the app can start with no signal. Firestore keeps its own offline copy of the content (auth.js). */
const CACHE = "vctips-v13";
const SHELL = ["./", "./index.html", "./app.js", "./auth.js", "./firebase-config.js", "./manifest.webmanifest",
               "./icons/icon-192.png", "./icons/icon-512.png", "./img/videocheck-layout.jpg"];
const LIBS = ["app", "auth", "firestore"].map(n => `https://www.gstatic.com/firebasejs/10.12.2/firebase-${n}-compat.js`);
const isLib = u => u.hostname === "www.gstatic.com" && u.pathname.startsWith("/firebasejs/");
const isFont = u => u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(SHELL).catch(() => {});
    await Promise.all(LIBS.map(u => fetch(u, {mode: "no-cors"}).then(r => c.put(u, r)).catch(() => {})));
  }).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(isLib(url) || isFont(url)){
    /* cached copy first; fetch and store it the first time */
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
    return;
  }
  if(url.origin !== self.location.origin) return;   // Firebase / Google sign-in and data: not touched
  e.respondWith(
    fetch(req).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("./index.html")))
  );
});
