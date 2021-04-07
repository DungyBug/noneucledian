const http = require("http");
const fs = require("fs");

http.createServer((req, res) => {
    if(req.url.match(".js")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "text/javascript"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".html")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".css")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "text/css"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".jpg")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "image/jpeg"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".wav")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "audio/wave"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".png")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "image/png"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".gif")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "image/gif"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".ico")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "image/icon"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".mp3")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "audio/mp3"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".glb")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "model/gltf-binary"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".babylon")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "application/babylon"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".manifest")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "text/cache-manifest"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
    if(req.url.match(".dds")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "image/vnd-ms.dds"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
        return;
    }
}).listen(80); // process.env.PORT