/**
 * Created by sabir on 24.01.15.
 */

var FileManager = function(){
    var self = this;
    this.addFileButtonId = 'addPhotoButton';
    this.urls = [];
    this.compressedUrls = [];
    this.selectedFile = undefined;
    this.compressedMap = {};
    this.compressManager = new CompressorManager();
    this.chatMode = false;
    this.photosListId = 'photosList';

    this.init = function(){
        //self.prepareForm();
        self.initFileSelect();
        self.initDeleteLink();
    }

    this.initAddFileButton = function(){
        $('#' + self.addFileButtonId).bind('click', function(){

        });
    }


    this.prepareForm = function(){
        var s = '';
        s+='<form id="fileupload"  name="fileupload" enctype="multipart/form-data" acceptcharset="UTF-8" method="post">';
        s+='<fieldset><input type="file" name="fileselect" id="fileselect" />' +
        '<input id="uploadbutton" type="button" value="Upload to Parse"/></fieldset>';
        s+='</form>';
        $('body').append(s);
    }

    this.initFileSelect = function(){
        $('body').on('change', '#fileselect', function(e){
            var files = e.target.files || e.dataTransfer.files;
            self.selectedFile = files[0];
            //alert('file selected');
            console.log('file selected');
            console.log(self.selectedFile);
            self.uploadFile(function(url){
                self.compressManager.compress(url, function(compressed){
                    self.compressedMap[url] = compressed;
                    self.addUrl(url);
                    self.photoAddedCallback(url, compressed);
                    //self.drawUploadedUrls();
                });
            });
        });
    }

    this.photoAddedCallback = function(url, compressedUrl){
        console.log('photoAddedCallback: ' + url + ' ; ' + compressedUrl);
    }

    this.selectFile = function(){
        //console.log('select file occured');
        setTimeout(function(){
            $('#fileselect').trigger('click');
        }, 100);

    }

    this.updateCompressedUrls = function(){
        var list = self.urls;
        var arr = [];
        for (var i in list){
            arr.push(self.compressedMap[list[i]]);
        }
        self.compressedUrls = arr;
    }

    this.addUrl = function(url){
        self.urls.push(url);
        var s = self.getNewUrlHtml(url);
        $('#uploadedPhotos').append(s);
        self.updateCompressedUrls();
        self.urlsNumberChanged();
    }

    this.urlsNumberChanged = function(){
        console.log('urlsNumberChanged: ', self.urls);
    }

    this.getNewUrlHtml = function(url){
        var s = '';
        s+='<div class="uploadedImageItem" data-url="' + url + '" > <img src="' + self.compressedMap[url] + '" /> </div>';
        console.log(s);
        return s;
    }

    this.uploadFile = function(callback){
        var file = self.selectedFile;
        if (file == undefined){
            return;
        }
        console.log('uploading file ', file);
        enablePreloader();
        var serverUrl = 'https://api.parse.com/1/files/' + 'user -' + (new Date()).getTime() + '-' + getRandowString(5);
        $.ajax({
            type: "POST",
            beforeSend: function(request) {
                request.setRequestHeader("X-Parse-Application-Id", 'HSiEbuDjvWellSHrvObKn1ue5QBNU0iTwkSSPXUj');
                request.setRequestHeader("X-Parse-REST-API-Key", 'MKfH4heCoZhMXc4YCp0rr4TzgHFz9GrqxmgTc0ya');
                request.setRequestHeader("Content-Type", file.type);
            },
            url: serverUrl,
            data: file,
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt){
                    console.log(evt);
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        var perc = Math.floor(100 * percentComplete);
                        //alert(perc);
                        $('#status p.center-text').html('Загрузка... <br/> ' + perc + '%');
                    }
                }, false);

                return xhr;
            },
            processData: false,
            contentType: false,
            success: function(data) {
                disablePreloader();
                console.log(data.url);
                callback(data.url);
            },
            error: function(data) {
                console.log('error: ', data);
                disablePreloader();
                //alert(data);
            }
        });
    }

    this.drawUploadedUrls = function(){
        var list = self.urls;
        var s = list.map(function(url){return self.getNewUrlHtml(url)}).join(' ');
        console.log(s);
        $('#' + self.photosListId).html(s);
    }

    this.initDeleteLink = function(){
        $('body').on('click', '.deleteImageLink', function(){
            var url = $(this).attr('data-url');
            var arr = [];
            var list = self.urls;
            for (var i in list){
                if (list[i] == url){
                    continue;
                }
                arr.push(list[i]);
            }
            self.urls = arr;
            $('.uploadedImageItem[data-url="' + url + '"]').remove();
            self.updateCompressedUrls();
            self.urlsNumberChanged();
            self.drawUploadedUrls();
        });
    }




}