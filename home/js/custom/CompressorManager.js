/**
 * Created by sabir on 27.01.15.
 */

var CompressorManager = function(){
    var self = this;
    this.urls = [];
    this.compressedUrls = [];


    this.compress = function(url, cb){
        enablePreloader();
        $.ajax({
            type: 'GET',
            url: 'http://flytrack.net/compressor.php?url=' + url,
            success: function (arr){
                disablePreloader();
                var u = 'http://flytrack.net/uploads/' + arr[0];
                if (cb != undefined){
                    cb(u);
                }
            },
            dataType: 'jsonp',
            jsonp: 'callback',
            jsonpCallback: 'jsonpCallback'
        });
    }

    this.recurCompress = function(n, callback, oneUploadCallback){
        if (n >= self.urls.length){
            callback(self.compressedUrls);
            return;
        }
        var url = self.urls[n];
        $.ajax({
            type: 'GET',
            url: 'http://m.reshaka.ru/compressor.php?url=' + url,
            success: function (arr){
                var u = arr[0];
                oneUploadCallback(n);
                self.compressedUrls.push(u);
                n = n+1;
                self.recurCompress(n, callback, oneUploadCallback);
            },
            dataType: 'jsonp',
            jsonp: 'callback',
            jsonpCallback: 'jsonpCallback'
        });
    }

    this.compressArray = function(urls, callback, oneCallback){
        self.urls = urls;
        self.compressedUrls = [];
        self.recurCompress(0, callback, oneCallback);
    }

}