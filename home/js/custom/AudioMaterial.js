/**
 * Created by sabir on 04.11.14.
 */

var AudioMaterial = function(audioUrl){
    var self = this;
    this.audioUrl = audioUrl;
    this.audioPlaceholderDivId = 'audioPlaceholder';
    this.audioId = 'patientExerciseAudio';
    this.materialType = 'audio';

    this.getEmbedHtml = function(){
        var s = '';
        s+='<div class="audioBlock" >' +
                '<audio id="' + self.audioId + '" src="' + self.audioUrl + '" controls ></audio>' +
            '</div>';
        return s;
    }

    this.prepareHtml = function(){
        $('#' + self.audioPlaceholderDivId).show();
        if ( $('#' + self.audioId).length == 0 ){
            $('#' + self.audioPlaceholderDivId).html(self.getEmbedHtml());
            return;
        }
        $('#' + self.audioId).attr('src', self.audioUrl);
    }

}

