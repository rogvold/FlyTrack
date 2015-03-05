/**
 * Created by sabir on 04.11.14.
 */

var ImageMaterial = function(imageUrl){
    var self = this;
    this.imageUrl = imageUrl;
    this.height = 260;
    this.imageId = 'patientExerciseImage';
    this.imagePlaceholderDivId = 'imagePlaceholder';
    this.materialType = 'image';

    this.getEmbedHtml = function(){
        var s = '';
        s+='<div class="imageBlock" >' +
            '<img src="' + self.imageUrl +'" style="height: ' + self.height +'px;" />' +
            '</div>';
        return s;
    }

    this.prepareHtml = function(){
        $('#' + self.imagePlaceholderDivId).show();
        if ( $('#' + self.imageId).length == 0 ){
            $('#' + self.imagePlaceholderDivId).html(self.getEmbedHtml());
            return;
        }
        $('#' + self.imageId).attr('src', self.imageUrl);
        $('#' + self.imageId).css('height', self.height + 'px');
    }

}