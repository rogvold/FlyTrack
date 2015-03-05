/**
 * Created by sabir on 07.10.14.
 */
//requires flot charts
// points - 2d array

var LineChart = function(){
    var self = this;
    this.divId = '';
    this.points = [];
    this.selectedPoints = [];
    this.data = [];
    this.chartName = '';
    this.chartMode = "time";
    this.options = {
        series: {
            lines: {
                show: true,
                color: '#848ca1',
                lineWidth: 1
            },
            points: {
                show: false
            }
        },
        grid: {
            borderWidth: 1,
            borderColor: '#848ca1'
        },
        xaxis: {
            mode: "time",
            timeformat: "%H:%M"
        }
    };
    this.placeholder = undefined;
    this.plot = undefined;
    this.selectedFrom = 0;
    this.selectedTo = 0;


    this.selectionCallback = function(selectedPoints){
//        alert(ranges.from + ' - ' + ranges.to);
//        console.log(ranges);
    }

    this.unselectionCallback = function(){

    }

    this.init = function(divId){
        if (divId == undefined || divId == ""){
            alert('divId is not defined');
            return;
        }
        self.divId = divId;
        self.placeholder = $('#' + divId);
        self.initSelectionCallback();
        self.plot = $.plot(self.placeholder, [self.data], self.options);
    }

    this.initSelectionCallback = function(){
        self.placeholder.bind("plotselected", function (event, ranges) {
            self.selectedFrom = ranges.xaxis.from,
            self.selectedTo = ranges.xaxis.to
            console.log(self.selectedFrom + ' - ' + self.selectedTo);
            var sel = [];
            for (var i in self.points){

                if ((self.points[i][0] >= ranges.xaxis.from) && (self.points[i][0] < ranges.xaxis.to)){
                    sel.push(self.points[i]);
//                    console.log(self.points[i]);
                }
            }
            self.selectedPoints = sel;
            console.log(self.selectedPoints.length);
            self.selectionCallback(self.selectedPoints);
        });
        self.placeholder.bind("plotunselected", function (event) {
            self.unselectionCallback();
        });
    }



    this.selectRange = function(from, duration){
        if (from == undefined || duration == undefined){
            alert('selectRange: from or duration is not defined');
            return;
        }
        var to = from + duration;
        if (to > self.points[self.points.length - 1][0]){
            to = self.points[self.points.length - 1][0];
        }
        from = Math.max(0, to - duration);
        self.plot.setSelection({
            xaxis: {
                from: from,
                to: to
            }
        });
    }

    this.filterByMaxXValue = function(points, maxX){
        var arr = [];
        for (var i in points){
            if (maxX == undefined){
                arr.push(points[i]);
                continue;
            }
            if (points[i][0] > maxX){
                continue;
            }
            arr.push(points[i]);
        }
        return arr;
    }

    this.drawPoints = function(points){

        console.log('LineChart drawPoints occured: points = ');
        console.log(points);

//        points = self.filterByMaxXValue(points, maxX);

        if (points == undefined){
            alert('data is not defined');
            return;
        }


        self.points = points;
        self.data = {
            label: self.chartName,
            data: points,
            color: '#848ca1',
            lineWidth: 1
        };

//        self.options.xaxis.max = points[points.length  - 1][0];


        if (self.plot == undefined){
            self.plot = $.plot(self.placeholder, [self.data], self.options);
        }else{
            self.plot = $.plot(self.placeholder, [self.data], self.options);
//            self.plot.setData([self.data]);
//            self.plot.draw();
        }


    }

}

function tickGenerator(axis) {
    var res = [];
    var N = 6;
    var mode = "time";
    //if (axis.max < 10){ // wtf???
    //    mode = "xy";
    //}

    for (var i = 0 ; i < N; i++){
//        console.log("mode = " + mode);
        var t = axis.min + ((axis.max - axis.min) * i * 1.0 / N);
        if (mode == "xy"){
            res.push([t, Math.floor(100 * t) / 100.0]);
//            console.log('yes t = ' + t);
            continue;
        }
        var h = moment.duration(t).hours();
        var m = zerStr(moment.duration(t).minutes());
        var s = zerStr(moment.duration(t).seconds());
        var str = h + ':' + m + ':' + s;
        res.push([t, str]);
    }
    return res;
}

function zerStr(t){
    if (t < 10) return ('0' + t);
    return t;
}

