/**
 * Created by sabir on 05.03.15.
 */

var PhotoManager = function(){
    var self = this;
    this.photos = [];
    this.selectedPhoto = undefined;
    this.sessionId = undefined;
    this.fileManager = new FileManager();
    this.currentUserManager = new CurrentUserManager();

    this.init = function(){
        initParse();
        self.currentUserManager.init(function(){
            self.initPhotoDialog();
            self.initPhotoItem();
            self.initCreationForm();
            self.initFileManager();
        });
    }

    this.loadPhotos = function(sessionId, callback){
        if (sessionId == undefined){
            return;
        }
        self.sessionId = sessionId;
        var q = new Parse.Query(Parse.Object.extend('Photo'));
        q.equalTo('sessionId', sessionId);
        q.addDescending('createdAt');
        q.limit(1000);
        enablePreloader();
        q.find(function(results){
            disablePreloader();
            self.photos = results;
            self.drawPhotos();
            if (self.photos.length > 0){
                $('.app').addClass('offscreen move-right');
            }
            if (callback != undefined){
                callback();
            }
        });
    }

    this.initFileManager = function(){
        self.fileManager.init();
        self.fileManager.photoAddedCallback = function(url, compressedUrl){
            var Photo = Parse.Object.extend('Photo');
            var p = new Photo();
            p.set('userId', self.currentUserManager.currentUser.id);
            p.set('sessionId', self.sessionId);
            p.set('url', url);
            p.set('compressedUrl', compressedUrl);
            enablePreloader();
            p.save().then(function(){
                self.loadPhotos(self.sessionId, function(){
                    self.drawPhotos();
                })
            });
        };
    }

    this.drawPhotos = function(){
        var s = '';
        var list = self.photos;
        for (var i in list){
            s+=self.getPhotoItem(list[i]);
        }
        $('#sessionImages').html(s);
    }

    this.initCreationForm = function(){

        $('#addPhotoButton').bind('click', function(){
            $('#fileselect').click();
        });
    }

    this.getPhotoItem = function(p){
        var s = '';
        s+='<div class="chat-user photoItem" data-id="' + p.id + '"  >' +
            '<div>' +
                '<img src="' + p.get('compressedUrl') + '" />' +
            '</div>' +
        '</div>';
        return s;
    }


    this.initPhotoItem = function(){
        $('body').on('click', '.photoItem', function(){
            $('.photoItem').removeClass('selected');
            $(this).addClass('selected');
            var id = $(this).attr('data-id');
            self.selectedPhoto = self.getPhotoById(id);
            $('#photoModal').modal();
            self.drawSelectedPhotoInDialog();
        });
    }

    this.getNextPhoto = function(){
        var p = undefined;
        var n = (self.photos == undefined) ? 0 : self.photos.length;
        for (var i = 0; i < n-1; i++){
            if (self.photos[i].id == self.selectedPhoto.id){
                p = self.photos[i + 1];
            }
        }
        console.log('getNextPhoto: p = ', p);
        return p;
    }

    this.getPrevPhoto = function(){
        var p = undefined;
        var n = (self.photos == undefined) ? 0 : self.photos.length;
        for (var i = 1; i < n; i++){
            if (self.photos[i].id == self.selectedPhoto.id){
                p = self.photos[i - 1];
            }
        }
        console.log('getPrevPhoto: p = ', p);
        return p;
    }


    this.getPhotoById = function(id){
        var list = self.photos;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }

    this.initPhotoDialog = function(){
        $('#photoModal .prevLink').bind('click', function(){
            var p = self.getPrevPhoto();
            if (p == undefined){
                return;
            }
            self.selectedPhoto = p;
            $('.chat-user').removeClass('selected');
            $('.chat-user[data-id="' + p.id + '"]').addClass('selected');
            self.drawSelectedPhotoInDialog();
        });
        $('#photoModal .nextLink').bind('click', function(){
            var p = self.getNextPhoto();
            if (p == undefined){
                return;
            }
            self.selectedPhoto = p;
            $('.chat-user').removeClass('selected');
            $('.chat-user[data-id="' + p.id + '"]').addClass('selected');
            self.drawSelectedPhotoInDialog();
        });
        self.initDeletePhotoButton();
    }

    this.drawSelectedPhotoInDialog = function(){
        var p = self.selectedPhoto;
        var s = '<a href="' + p.get('url') + '" target="_blank" ><img src="' + p.get('compressedUrl') +'" /></a>';
        $('#photoDialogPlaceholder').html(s);
        self.updatePhotoCountBlock();
    }

    this.deleteSelectedPhoto = function(callback){
        var arr = [];
        var list = self.photos;
        for (var i in list){
            if (list[i].id == self.selectedPhoto.id){
                continue;
            }
            arr.push(list[i]);
        }
        enablePreloader();
        self.selectedPhoto.destroy({
            success: function(){
                disablePreloader();
                self.photos = arr;
                self.drawPhotos();
                toastr.info('Фотография удалена');
                callback();
            }
        });
    }

    this.initDeletePhotoButton = function(){
        $('#deletePhotoButton').bind('click', function(){
            if (confirm('Вы уверены, что хотите удалить эту фотографию?') == false){
                return;
            }
            var newSelectedPhoto = self.getPrevPhoto();
            if (newSelectedPhoto == undefined){
                newSelectedPhoto = self.getNextPhoto();
            }
            self.deleteSelectedPhoto(function(){
                if (newSelectedPhoto == undefined){
                    $('#photoModal').modal('close');
                    return;
                }
                self.selectedPhoto = newSelectedPhoto;
                self.drawSelectedPhotoInDialog();
            });
        });
    }

    this.updatePhotoCountBlock = function(){
        var p = self.selectedPhoto;
        var n = self.photos.length;
        var list = self.photos;
        var k = 0;
        for (var i in list){
            if (list[i].id == p.id){
                k = i;
            }
        }
        k++;
        var s = '<b>' + k + '</b> / ' + n;
        console.log(s);
        $('#photosCountBlock').html(s);
    }

}