/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "8a13a5fa15a7d7e55599c82f507fe5a0"
  }, {
    "url": "pwa-512x512.png",
    "revision": "33e90daea9b2d8c0f65af6a14696edd0"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9f2723befeedc273436a507769fbd7a6"
  }, {
    "url": "index.html",
    "revision": "d0d15367c3f7d98e830f905dc8a47cc4"
  }, {
    "url": "icon.svg",
    "revision": "6140efc785408c10b0dbcea1323998db"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "3c4e2410e45c866a2c69dc93f78b9c75"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/index-CYhguEco.js",
    "revision": null
  }, {
    "url": "assets/index-BCYVEYe2.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "3c4e2410e45c866a2c69dc93f78b9c75"
  }, {
    "url": "icon.svg",
    "revision": "6140efc785408c10b0dbcea1323998db"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9f2723befeedc273436a507769fbd7a6"
  }, {
    "url": "pwa-512x512.png",
    "revision": "33e90daea9b2d8c0f65af6a14696edd0"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "8a13a5fa15a7d7e55599c82f507fe5a0"
  }, {
    "url": "manifest.webmanifest",
    "revision": "cf10f6ef5a6c43301ea90b89cd8640d0"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
