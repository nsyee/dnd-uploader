var http = require("http")
  , util = require("util")
  , fs = require("fs")
  , path = require("path")
  , url = require("url")
  , formidable = require("formidable")
  , port = 8000
  , tmpDir = path.join(__dirname, "tmp")
  , saveDir = path.join(__dirname, "static/upload")

http.createServer(function(req, res) {
  switch (url.parse(req.url).pathname) {
    case "/"      : staticHandler(req, res); break;
    case "/upload": uploadHandler(req, res); break;
    default       : defaultHandler(req, res); break;
  }
}).listen(port)

util.puts("listening on http://localhost:"+port+"/")


// handlers
function uploadHandler(req, res) {
  var form = new formidable.IncomingForm()
  , files = []
  , fields = []
  form.uploadDir = tmpDir
  form
    .on("file", function(name, file) {
      var tmpFile = file.path
        , fileName = path.basename(tmpFile)
        , ext = path.extname(params(req, "name"))
        , saveFile = saveDir+"/"+fileName+ext
      fs.rename(tmpFile, saveFile, function(err) {
        if (err) throw err
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

function redirect(res) {
  res.writeHead(302, {"Location": "/\n\n"})
  res.end()
}

function params(req, name) {
  return url.parse(req.url, true).query[name]
}

function ctypes(file) {
  var types =
    { ".html": "text/html"
    , ".js"  : "application/javascript"
    , ".swf" : "application/x-shockwave-flash"
    }
  return types[path.extname(file)] || 'text/plain'
}
