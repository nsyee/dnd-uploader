require.paths.unshift(__dirname+"/lib")
var io         = require("socket.io")
  , formidable = require("formidable")
  , db         = require("dirty")("files.db")
  , server     = require("http").createServer()
  , util       = require("util")
  , fs         = require("fs")
  , path       = require("path")
  , url        = require("url")
  , emitter    = new process.EventEmitter()
  , port       = 80
  , tmpDir     = path.join(__dirname, "tmp")
  , saveDir    = path.join(__dirname, "static/upload")
  , files      = []
  , pathname

server.on("request", function(req, res) {
  switch (url.parse(req.url).pathname) {
   case "/"      : staticHandler(req, res);  break;
   case "/upload": uploadHandler(req, res);  break;
   default       : defaultHandler(req, res); break;
  }
})

db.on("load", function() {
  db.forEach(function(key, val) {
    files.push(val)
  })

  ;[tmpDir, saveDir].forEach(function(dir) {
    path.exists(dir, function(exists) {
      if (!exists) fs.mkdirSync(dir, 0755)
    })
  })

  server.listen(port)
  util.puts("listening on http://localhost:"+port+"/")

  io = io.listen(server)
  io.on("connection", function(client) {
    client.send({ type: "load", files: files })

    client.on("message", function(data) {
      client.broadcast(data)
    })
    emitter.on("uploaded", function(file) {
      client.send({ type: "uploaded", files: [file] })
    })
  })
})

// handlers
function uploadHandler(req, res) {
  var form = new formidable.IncomingForm()
  form.uploadDir = tmpDir
  form
    .on("file", function(name, file) {
      var tmpFile = file.path
        , ext = path.extname(params(req, "name")).toLowerCase()
        , fileName = path.basename(tmpFile)+ext
        , saveFile = saveDir+"/"+fileName
      fs.rename(tmpFile, saveFile, function(err) {
        if (err) throw err
        db.set(new Date().getTime(), fileName, function() {
          files.push(fileName)
          emitter.emit("uploaded", fileName)
        })
      })
    })
    .on("end", function() {
      res.writeHead(200, {"Content-Type": "text/plain"})
      res.end()
    })
  form.parse(req)
}

function defaultHandler(req, res) {
  if (url.parse(req.url).pathname.match("^/static/(.*)$"))
    staticHandler(req, res)
  else notFound(res)
}

function staticHandler(req, res) {
  var file = req.url.replace("/", "")
    , file =  file === "" ? "index.html" : file
  fs.readFile(file, function(err, data) {
    if (err) notFound(res)
    res.writeHead(200, {"Content-Type": ctypes(file)})
    res.end(data)
  })
}

// utils
function p(x) { console.log(util.inspect(x)) }

function notFound(res) {
  res.writeHead(404, {"Content-Type": "text/plain"})
  res.end("Page is not found.")
}

function redirect(res, dest) {
  res.writeHead(302, {"Location": dest+"\n\n"})
  res.end()
}

function params(req, name) {
  return url.parse(req.url, true).query[name]
}

function ctypes(file) {
  return (
    { ".html" : "text/html"
    , ".css"  : "text/css"
    , ".js"   : "application/javascript"
    , ".swf"  : "application/x-shockwave-flash"
    , ".jpeg" : "image/jpeg"
    , ".jpg"  : "image/jpeg"
    , ".gif"  : "image/gif"
    , ".png"  : "image/png"
    }
  )[path.extname(file).toLowerCase()] || "text/plain"
}
