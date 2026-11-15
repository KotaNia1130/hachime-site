# StPageFlip 2.0.7

Source: https://registry.npmjs.org/page-flip/-/page-flip-2.0.7.tgz
Upstream: https://github.com/Nodlik/StPageFlip
License: MIT (LICENSE retained)
Original browser bundle SHA-256: `bbaca0bbef57a22bb66a3fc69d67baf9a17fb9a9c89ec9ed35e2b91abe4bd1e7`

Local lifecycle patch: Render.start tracks its requestAnimationFrame ID and running flag; Render.stop cancels it and clears pending animation; PageFlip.destroy calls Render.stop. Upstream 2.0.7 otherwise continues scheduling frames after destroy. This site uses a disposable transition overlay, so cleanup is necessary. Geometry and page drawing are unchanged. No network/CDN is needed at runtime.
