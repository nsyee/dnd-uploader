$(function() {
  var uploader = new plupload.Uploader(
      { runtimes: "html5, flash"
      , browse_button: 'select-files'
      , container: 'main-inner'
      , drop_element: 'drop-files'
      , url: "/upload"
      , max_file_size: "1mb"
      , chunk_size: "1mb"
      , unique_names: false
//      , resize: { width: 320, height: 240, quality: 90 }
      , filters:
        [ { title: "Image files", extensions: "jpg,jpeg,gif,png" }
//        , { title: "Zip files", extensions: "zip" }
        ]
      , flash_swf_url : '/static/plupload.flash.swf'
      }
    )
    , client = new io.Socket(null, { port: 80 }).connect()
    , notify = $("#notify").notify()
    , notifies = {}
    , currentRuntime

  uploader.bind("Init", function(up, params) {
    currentRuntime = params.runtime
    $("#show-runtime").html("<div>Current runtime: "+params.runtime+"</div>")
  })

  uploader.bind("FilesAdded", function(up, files) {
    $.each(files, function(i, file) {
      var n = notify.notify("create"
                   , "upload-notify"
                   , { id: "msg-"+file.id
                     , text: file.name+" ("+plupload.formatSize(file.size)+")"
                     }
                   , { speed: 250, expires: false }
                   )
      notifies[file.id] = n

      if (!client.connected) client.connect()
    })
    up.refresh()
  })

  uploader.bind("QueueChanged", function(up, file) {
    uploader.start()
  })

  uploader.bind("UploadProgress", function(up, file) {
    $("#msg-"+file.id+" b").html(" " + file.percent + "%")
  })

  uploader.bind("Error", function(up, err) {
    var file = err.file
    if (file) {
      notify.notify("create"
           , "upload-notify"
           , { id: "msg-"+file.id
             , title: "Error: "+err.code
             , text: "File: "+file.name
             }
           , { speed: 250 }
           )
      up.refresh()

      setTimeout(function() {
        notifies[file.id].close()
      }, 3000)
    }
  })

  uploader.bind("FileUploaded", function(up, file) {
    $("#msg-"+file.id+" b").html(" 100%")
    $("a.delete-file").remove()

    up.refresh()

    setTimeout(function() {
      notifies[file.id].close()
    }, 3000)
  })

  client.on("connect", function() {
    //console.log("connect")
  })

  client.on("message", function(data) {
    switch (data.type) {
      case "load": updateList(data.files); break;
      case "uploaded": updateList(data.files); break;
      default: break;
    }
  })

  $("upload-files").click(function(e) {
    if (uploader.total.queued > 0) {
   	  uploader.start()
    } else {
      alert('You must at least upload one file.')
    }
    e.preventDefault()
  })

  $("a.delete-file").live("click", function(e){
    var div = $(this).parent()
      , file = uploader.getFile(div.get(0).id)
    uploader.removeFile(file)
    div.remove()
    e.preventDefault()
  })

  $("#drop-files").mouseover(function() {
    $(this).css("background-color", "#FFC")
  }).mouseout(function() {
    $(this).css("background-color", "white")
  })

  function updateList(files) {
    var i, sz = files.length, fileName
    for (i=0; i<sz; i++) {
      fileName = files[i]
      $("#file-list").prepend($(
        [ '<li id="file-', "", '">'
        , '<a id="fileName" href="/static/upload/',fileName,'">'
        , '<div class="imgbox">'
        , '<img alt="fileName" src="/static/upload/',fileName,'"/>'
        , '</div></a></li>'
        ].join("")
      ).fadeIn(1000))
    }
    $("#file-list li a").fancybox();
  }

  uploader.init()
})

