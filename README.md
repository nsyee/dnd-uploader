ドラッグ&ドロップで画像ファイルをアップロードするサンプルアプリ。複数ファイル同時アップに対応しています

This is a sample application to upload multiple files with drag'n drop.
Chrome9 dev, Firefox3.6, Safari5 work. IE does'nt work with Drag&Drop (also Opera?)


# Requirement
node-v0.2.4, v.0.3.0

# Installation

	$git clone git://github.com/nsyee/dnd-uploader.git --recursive
	$cd dnd-uploader
	//you may need sudo for executing with port 80.
	$sudo node server.js

# Using Modules
* [node-formidable](http://github.com/felixge/node-formidable)
* [node-dirty](http://github.com/felixge/node-dirty)
* [socket.io](http://socket.io/)

# Using Client side libraries
* [plupload](http://www.plupload.com/)
* [jquery-notify](https://github.com/ehynds/jquery-notify)
* [fancybox](http://fancybox.net/) 
* [socket.io](http://socket.io/)

# License
This application is licensed under the MIT license exclude above modules and libraries.