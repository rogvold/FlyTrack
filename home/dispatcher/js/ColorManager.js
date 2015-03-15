/**
 * Created by sabir on 08.03.15.
 */

var ColorManager = function(){
    var self = this;
    this.colors = ['#BD2A4E', '#654B6B', '#628179', '#2C3845', '#899738', '#34AB1A',
        '#8CB6A9', '#396ACC', '#D7DC2B', '#256553', '#F1D97C', '#B96F53', '#9D2C1C',
        '#A74143', '#7DDCA9', '#A82A54' , '#542A54', '#C29819', '#244844', '#48695E', '#AFA689', '#520903', '#4D1676', '#6A0237', '#0B5D99'];
    this.colorMap = {};


    this.getColor = function(key){
        if (self.colorMap[key] == undefined){
            self.colorMap[key] = self.colors[Object.keys(self.colorMap).length];
        }
        console.log('-->returning color: ' + self.colorMap[key]);
        return self.colorMap[key];
    }


}