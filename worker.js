let toCache = ["assets/scripts/main.js","assets/imgs/64x.png","assets/scripts/video.js","assets/imgs/icons/128x128.png","assets/imgs/icons/144x144.png","assets/imgs/icons/152x152.png","assets/imgs/icons/192x192.png","assets/imgs/icons/256x256.png","assets/imgs/icons/512x512.png","manifest.json"];self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open("Bagel.js game").then(cache=>cache.addAll(toCache)))});self.addEventListener("fetch",e=>{e.respondWith(caches.open("Bagel.js game").then(cache=>cache.match(e.request).then(response=>response||fetch(e.request).catch(_ => {console.warn("Bagel.js service worker failed to fetch " + JSON.stringify(e.request) + ".")}))))});
