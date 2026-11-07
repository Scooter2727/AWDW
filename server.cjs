"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = __dirname;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".woff2": "font/woff2" };
http.createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
    catch { response.writeHead(400).end("Bad request"); return; }
    const file = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!file.startsWith(root + path.sep)) { response.writeHead(403).end("Forbidden"); return; }
    const relative = path.relative(root, file).replaceAll("\\", "/");
    if (!["index.html", "styles.css", "reset.css", "script.js"].includes(relative) && !/^assets\/[^/]+\.(jpe?g|png|webp|woff2)$/i.test(relative)) {
        response.writeHead(404).end("Not found"); return;
    }
    fs.readFile(file, (error, contents) => {
        if (error) { response.writeHead(404).end("Not found"); return; }
        response.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream", "X-Content-Type-Options": "nosniff" });
        response.end(contents);
    });
}).listen(4173, "127.0.0.1", () => console.log("HackTrent: http://127.0.0.1:4173"));
