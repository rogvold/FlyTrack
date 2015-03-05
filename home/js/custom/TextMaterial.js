/**
 * Created by sabir on 04.11.14.
 */

var TextMaterial = function(text){
    var self = this;
    this.text = text;
    this.textId = 'patientExerciseImage';
    this.textPlaceholderDivId = 'textPlaceholder';
    this.materialType = 'text';


    this.getEmbedHtml = function(){
        var s = '';
        s+='<div class="textBlock" >' +
                '<span>' + self.text + '</span>' +
            '</div>';
        return s;
    }

    this.prepareHtml = function(){
        $('#' + self.textPlaceholderDivId).show();
        if ( $('#' + self.textId).length == 0 ){
            $('#' + self.textPlaceholderDivId).html(self.getEmbedHtml());
            return;
        }
        $('#' + self.textId).text(self.text);
    }

}