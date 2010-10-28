// Convert divs to queue widgets when the DOM is ready
$(function() {
  $("#uploader").pluploadQueue(
    { runtimes: "html5, flash"
    , url: "/upload"
    , max_file_size: "10mb"
    , chunk_size: "1mb"
    , unique_names: true
    // Resize images on clientside if we can
    , resize: { width: 320, height: 240, quality: 90 }
    // Specify what files to browse for
    , filters:
      [ { title: "Image files", extensions: "jpg, gif, png" }
      , { title: "Zip files", extensions: "zip" }
      ]
    // Flash settings
    , flash_swf_url : '/static/plupload.flash.swf'
    }
  )

  // Client side form validation
  $('form').submit(function(e) {
    var uploader = $('#uploader').pluploadQueue()
      // Validate number of uploaded files
    if (uploader.total.uploaded == 0) {
      // Files in queue upload them first
      if (uploader.files.length > 0) {
    	// When all files are uploaded submit form
    	uploader.bind('UploadProgress', function() {
    	  if (uploader.total.uploaded == uploader.files.length)
    		$('form').submit()
    	})
    	uploader.start()
      } else {
    	alert('You must at least upload one file.')
      }
      e.preventDefault()
    }
  })
})

