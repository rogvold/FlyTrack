/**
 * Created by sabir on 04.11.14.
 */

var ExerciseCard = function(){
    var self = this;
    this.mediaMaterials = [];

    this.init = function(materials){
        self.mediaMaterials = materials;
    }

    this.prepareHtml = function(){
        var list = self.mediaMaterials;
        for (var i in list){
            var m = list[i];
            m.prepareHtml();
        }
    }



}