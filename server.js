require.paths.unshift(__dirname+"/lib")
var io         = require("socket.io")
  , formidable = require("formidable")
  , dirty      = require("dirty")
  , server     = require("http").createServer()
  , util       = require("util")
  , fs         = require("fs")
  , path       = require("path")
  , url        = require("url")

  , tmpDir     = path.join(__dirname, "tmp")
  , saveDir    = path.join(__dirname, "static", "upload")
  , port       = 80
  , files      = []
  , db

  , routes     =
      function(req, res) {
        switch (url.parse(req.url).pathname) {
          case "/"      : staticHandler(req, res);  break;
          case "/upload": uploadHandler(req, res);  break;
          default       : defaultHandler(req, res); break;
        }
      }

db = dirty("files.db")
db.on("load", start_app)


function start_app() {
  db.forEach(function(key, val) {
    files.push(val)
  })

  check_dirs([tmpDir, saveDir])

  server.on("request", routes)
  server.listen(port)

  io = io.listen(server)
  io.on("connection", function(client) {
    client.send({ type: "load", files: files })
  })

  util.puts("listening on http://localhost:"+port+"/")
}


// handlers
function uploadHandler(req, res) {
  var form = new formidable.IncomingForm()
  form.uploadDir = tmpDir
  form
    .on("file", function(name, file) {
      var tmpFile = file.path
        , ext = path.extname(params(req, "name")).toLowerCase()
        , fileName = path.basename(tmpFile)+ext
        , saveFile = path.join(saveDir, fileName)
      fs.rename(tmpFile, saveFile, function(err) {
        if (err) throw err
        db.set(new Date().getTime(), fileName, function() {
          files.push(fileName)
          io.broadcast({ type: "uploaded", files: [fileName] })
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

function check_dirs(dirs) {
  dirs.forEach(function(dir) {
    path.exists(dir, function(exists) {
      if (!exists) fs.mkdirSync(dir, 0755)
    })
  })
}

function notFound(res) {
  res.writeHead(404, {"Content-Type": "text/plain"})
  res.end("Resource is not found.")
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
