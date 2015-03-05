/**
 * Created by sabir on 12.11.14.
 */

var PilotChartManager = function(){
    var self = this;
    this.geoPoints = [];
    this.chartDivId = 'chart';
    this.chart = undefined;


    this.init = function(divId){
        if (divId != undefined){
            self.chartDivId = divId;
        }
        self.chart = new LineChart();
        self.chart.init(self.chartDivId);
    }



    this.drawPoints = function(){
        var list = self.geoPoints.map(function(p){return [p.get('t'), p.get('alt')]});
        self.chart.drawPoints(list);
    }

}