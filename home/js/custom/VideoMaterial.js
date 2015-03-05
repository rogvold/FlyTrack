/**
 * Created by sabir on 04.11.14.
 */

var VideoMaterial = function(vimeoId){
    var self = this;
    this.vimeoId = vimeoId;
    this.width = 400;
    this.height = 225;
    this.videoPlaceholderDivId = 'videoPlaceholder';
    this.iframeId = 'patientExerciseIframe';
    this.materialType = 'video';

    this.getEmbedHtml = function(){
        var s = '';
        s+='<div class="videoBlock" >' +
                '<iframe id="' + self.iframeId + '" src="http://player.vimeo.com/video/' + self.vimeoId + '?title=0&byline=0&portrait=0" width="' + self.width + '" height="' + self.height + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>' +
            '</div>';
        return s;
    }

    this.prepareHtml = function(){
        $('#' + self.videoPlaceholderDivId).show();
        if ( $('#' + self.iframeId).length == 0 ){
            $('#' + self.videoPlaceholderDivId).html(self.getEmbedHtml());
            return;
        }
        if ($('#' + self.iframeId).attr('src').indexOf(self.vimeoId) > -1){
            return;
        }
        $('#' + self.iframeId).attr('src', 'http://player.vimeo.com/video/' + self.vimeoId + '?title=0&byline=0&portrait=0');
        $('#' + self.iframeId).css('width', self.width + 'px');
        $('#' + self.iframeId).css('height', self.height + 'px');
    }

}

