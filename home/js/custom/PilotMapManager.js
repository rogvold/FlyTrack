/**
 * Created by sabir on 11.11.14.
 */

var PilotMapManager = function(){
    var self = this;
    this.mapDivId = 'map';
    this.centerLat = 56.104215;
    this.centerLon = 36.77124;
    this.map = undefined;
    this.points = [];
    this.path = [];
    this.overlay = undefined;
    this.marker = undefined;
    this.arrowsAlongPathEnabled = true;

    this.selectionPoints = [];
    this.selectionPath = [];

    this.init = function(divId){
        self.initMap(divId);
    }

    this.initMap = function(divId){
        if (divId != undefined){
            self.mapDivId = divId;
        }
        self.map = new GMaps({
            div: '#' + self.mapDivId,
            lat: self.centerLat,
            lng: self.centerLon
        });
    }



    this.clearAllPoints = function(){

    }

    this.updatePoints = function(points, color){
        if (color == undefined){
            color = '#131540';
        }
        self.removeMarker();
        self.removeOverlay();
        self.map.removePolylines();
        self.points = points;
        self.path = self.points.map(function(p){return [p.get('lat'), p.get('lon')]});
        self.polyline = self.addPolyline(self.path, color);
        self.fitPolylines();

        if (self.arrowsAlongPathEnabled == true){
            self.drawArrowsAlongPath(points);
        }
    }

    this.addPolyline = function(path, color){
        var pol = self.map.drawPolyline({
            path: path,
            strokeColor: color,
            strokeOpacity: 0.6,
            strokeWeight: 3
        });
        return pol;
    }

    this.fitPolylines = function(){
        var list = self.points;
        var maxLat = getMaxInArray(list.map(function(item){return item.get('lat')}));
        var minLat = getMinInArray(list.map(function(item){return item.get('lat')}));
        var maxLon = getMaxInArray(list.map(function(item){return item.get('lon')}));
        var minLon = getMinInArray(list.map(function(item){return item.get('lon')}));
        console.log(maxLat, maxLon, minLat, minLon);
        self.map.fitLatLngBounds([new google.maps.LatLng(maxLat, maxLon), new google.maps.LatLng(minLat, minLon)]);
    }

    this.removeOverlay = function(){
        if (self.overlay == undefined){
            return;
        }
        self.map.removeOverlay(self.overlay);
    }

    this.removeMarker = function(){
        self.map.removeMarkers();
    }

    this.addMarker = function(lat, lon){
        self.removeMarker();
        self.map.addMarker({
            lat: lat,
            lng: lon
        });
    }


    this.addOverlay = function(lat, lon, html){
        self.removeOverlay();
        self.overlay = self.map.drawOverlay({
            lat: lat,
            lng: lon,
            content: html,
            click: function(data){
                console.log(data);
            }
        });
    }

    this.selectLine = function(startLat, startLon, endLat, endLon){
        self.map.removePolylines();
        self.addPolyline(self.path, '#131540');

        var startI = 0;
        var endI = self.points.length;
        var points = [];
        var path = [];
        var list = self.points;
        var f1 = false;
        for (var i in list){
            if (list[i].get('lat') == startLat && list[i].get('lon') == startLon){
                f1 = true;
            }
            if (list[i].get('lat') == endLat && list[i].get('lon') == endLon){
                f1 = false;
            }
            if (f1 == false){
                continue;
            }
            points.push(list[i]);

        }
        path = points.map(function(p){return [p.get('lat'), p.get('lon')]});
        self.selectionPoints = points;
        self.selectionPath = path;
        self.addPolyline(path, 'green');
        self.removeMarker();
        self.map.addMarker({ lat: points[0].get('lat'), lng: points[0].get('lon')});
        self.map.addMarker({ lat: points[points.length - 1].get('lat'), lng: points[points.length - 1].get('lon')});
    }


    this.drawArrow = function(lat1, lon1, lat2, lon2){
        console.log('drawArrow occured: ', lat1, lon1, lat2, lon2);
        var arrows = self.getArrowCoords(lat1, lon1, lat2, lon2);
        self.map.drawPolyline({
            path: [[arrows[0], arrows[1]], [lat2, lon2], [lat2, lon2], [arrows[2], arrows[3]]],
            strokeColor: '#00688B',
            strokeOpacity: 1,
            strokeWeight: 2
        });
    }

    this.drawArrowsAlongPath = function(points){
        var N = 15;
        var list = points;
        var step = points.length / (N + 1);
        for (var i =0; i < N; i++){
            var n = Math.floor(i * step);
            console.log('n = ', n);
            var p1 = points[n];
            var p2 = points[n + 1];
            console.log(p1, p2);
            if (p1 == undefined || p2 == undefined){
                return;
            }
            self.drawArrow(p1.get('lat'), p1.get('lon'), p2.get('lat'), p2.get('lon'));
        }
    }

    this.getArrowCoords = function(lat1, lon1, lat2, lon2){
        var d = Math.sqrt((lat1 - lat2)*(lat1-lat2) + (lon1 - lon2) * (lon1 - lon2));
        var l = 0.001;
        var pr = l*Math.cos(Math.PI / 6);
        var perpPr = l*Math.sin(Math.PI / 6);

        var qLat = lat2 - pr * (lat2 - lat1) / d;
        var qLon = lon2 - pr * (lon2 - lon1) / d;
        var perpLat = - perpPr * (lon2 - lon1) / d;
        var perpLon = perpPr * (lat2 - lat1) / d;

        var lLat = qLat + perpLat;
        var lLon = qLon + perpLon;
        var rLat = qLat - perpLat;
        var rLon = qLon - perpLon;

        return [lLat, lLon, rLat, rLon];
    }

}