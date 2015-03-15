/**
 * Created by sabir on 09.11.14.
 */

var MapManager = function(){
    var self = this;
    this.mapDivId = 'map';
    this.centerLat = 56.104215;
    this.centerLon = 36.77124;
    this.map = undefined;
    this.overlaysMap = {};
    this.overlaysCoordsMap = {};
    this.circlesMap = {};
    this.circleR = 100;
    this.autoScaleEnabled = true;
    this.shouldShowCircles = true;

    this.initMap = function(divId){
        if (divId != undefined){
            self.mapDivId = divId;
        }
        self.map = new GMaps({
            div: self.mapDivId,
            lat: self.centerLat,
            lng: self.centerLon
        });
    }

    this.init = function(divId){
        self.initMap(divId);
    }

    this.removeMarkers = function(){
        self.map.removeMarkers();
        self.map.removeOverlays();
    }

    this.addMarker = function(lat, lon){
        self.map.createMarker({
            lat: lat,
            lng: lon
        });
    }

    this.addCircle = function(lat, lon, r, aircraftId){
        if (self.circlesMap[aircraftId] != undefined){
            self.circlesMap[aircraftId].setMap(null);
        }
        var circle = self.map.drawCircle({
            lat: lat,
            lng: lon,
            radius: self.circleR,
            strokeColor: '#B22222',
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: 'transparent',
            clickable: true,
            click: function(d1, d2, d3){
                console.log(d1, d2, d3);
            }
        });
        self.circlesMap[aircraftId] = circle;
    }

    this.addAircraftOverlay = function(lat, lon, html, aircraftId){
        self.map.removeOverlay(self.overlaysMap[aircraftId]);
        var o = self.addOverlay(lat, lon, html);
        self.overlaysMap[aircraftId] = o;
        self.overlaysCoordsMap[aircraftId] = {
            lat: lat,
            lon: lon
        };
        self.addCircle(lat,lon, self.circleR, aircraftId);
    }

    this.removeOverlay = function(aircraftId){
        if (aircraftId == undefined){
            return;
        }
        if (self.overlaysMap[aircraftId] != undefined){
            self.map.removeOverlay(self.overlaysMap[aircraftId]);
        }
    }

    this.removeCircle = function(aircraftId){
        if (self.circlesMap[aircraftId] != undefined){
            self.circlesMap[aircraftId].setMap(null);
        }
    }

    this.addOverlay = function( lat, lon, html, aircraftId){
        var overlay = self.map.drawOverlay({
            lat: lat,
            lng: lon,
            content: html,
            click: function(data){
                console.log(data);
            }
        });
        if (self.autoScaleEnabled == true){
            self.fitOverlays();
        }

        return overlay;
    }

    this.fitOverlays = function(){
        var list = [];
        var map = self.overlaysCoordsMap;
        for (var key in map){
            list.push(map[key]);
        }
        if (list.length == 0){
            return;
        }
        var maxLat = getMaxInArray(list.map(function(item){return item.lat}));
        var minLat = getMinInArray(list.map(function(item){return item.lat}));
        var maxLon = getMaxInArray(list.map(function(item){return item.lon}));
        var minLon = getMinInArray(list.map(function(item){return item.lon}));
        console.log(maxLat, maxLon, minLat, minLon);
        self.map.fitLatLngBounds([new google.maps.LatLng(maxLat, maxLon), new google.maps.LatLng(minLat, minLon)]);
    }

}
