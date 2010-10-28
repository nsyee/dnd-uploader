// Convert divs to queue widgets when the DOM is ready
$(function() {
  var uploader = new plupload.Uploader(
    { runtimes: "html5, flash"
    , browse_button: 'select-files'
    , container: 'container'
    , drop_element: 'drop-files'
    , url: "/upload"
    , max_file_size: "10mb"
    , chunk_size: "1mb"
    , unique_names: false
    , resize: { width: 320, height: 240, quality: 90 }
    , filters:
      [ { title: "Image files", extensions: "jpg,jpeg,gif,png" }
      , { title: "Zip files", extensions: "zip" }
      ]
    , flash_swf_url : '/static/plupload.flash.swf'
    }
  )

  uploader.bind("Init", function(up, params) {
    $("#file-list").html("<div>Current runtime: "+params.runtime+"</div>")
  })

  uploader.bind("FilesAdded", function(up, files) {
    $.each(files, function(i, file) {
      $("#file-list").append(
        [ '<div id="', file.id, '">'
        , file.name, ' ('
        , plupload.formatSize(file.size)
        , ') <a class="delete-file" href="#">[x]</a>'
        ,  '<b></b></div>'
        ].join("")
      )
    })
    up.refresh()
  })

  uploader.bind("UploadProgress", function(up, file) {
    $("#"+file.id+" b").html(" " + file.percent + "%")
    $("a.delete-file").remove()
  })

  uploader.bind("Error", function(up, err) {
    $("#file-list").append(
      [ '<div>Error: ', err.code
      , ' Message: ', err.message
      , (err.file ? ' File: '+err.file.name : '')
      ].join("")
    )
    up.refresh()
  })

  uploader.bind("FileUploaded", function(up, file) {
    $("#"+file.id+" b").html(" 100%")
    up.refresh()
  })

  uploader.init()

  $("#upload-files").click(function(e) {
    if (uploader.total.queued > 0) {
   	    //if (uploader.total.uploaded == uploader.files.length)
    	//$('form').submit()
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
})

