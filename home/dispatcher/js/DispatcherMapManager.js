/**
 * Created by sabir on 11.03.15.
 */

var DispatcherMapManager = function(){
    var self = this;
    this.mapDivId = 'map';
    this.centerLat = 56.104215;
    this.centerLon = 36.77124;
    this.map = undefined;
    this.points = [];
    this.path = [];
    this.overlay = undefined;
    this.marker = undefined;

    this.polylinesRegistry = {};
    this.overlaysRegistry = {};
    this.markersRegistry = {};

    this.objectsRegistry = {};




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
        //self.fitPolylines();
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
        var map = self.polylinesRegistry;
        var maxLat = -100000000;
        var minLat = 100000000;
        var maxLon = -100000000;
        var minLon = 100000000;
        for (var key in map){
            var pol = map[key];
            var points = pol.points;
            var maxLat_f = getMaxInArray(points.map(function(item){return item.get('lat')}));
            var minLat_f = getMinInArray(points.map(function(item){return item.get('lat')}));
            var maxLon_f = getMaxInArray(points.map(function(item){return item.get('lon')}));
            var minLon_f = getMinInArray(points.map(function(item){return item.get('lon')}));
            if (maxLat_f > maxLat){ maxLat = maxLat_f}
            if (minLat_f < minLat){ minLat = minLat_f}
            if (maxLon_f > maxLon){ maxLon = maxLon_f}
            if (minLon_f < minLon){ minLon = minLon_f}
        }
        self.map.fitLatLngBounds([new google.maps.LatLng(maxLat, maxLon), new google.maps.LatLng(minLat, minLon)]);
    }

    //this.fitPolylines = function(){
    //    var list = self.points;
    //    var maxLat = getMaxInArray(list.map(function(item){return item.get('lat')}));
    //    var minLat = getMinInArray(list.map(function(item){return item.get('lat')}));
    //    var maxLon = getMaxInArray(list.map(function(item){return item.get('lon')}));
    //    var minLon = getMinInArray(list.map(function(item){return item.get('lon')}));
    //    console.log(maxLat, maxLon, minLat, minLon);
    //    self.map.fitLatLngBounds([new google.maps.LatLng(maxLat, maxLon), new google.maps.LatLng(minLat, minLon)]);
    //}

    //this.removeOverlay = function(){
    //    if (self.overlay == undefined){
    //        return;
    //    }
    //    self.map.removeOverlay(self.overlay);
    //}
    //
    //this.removeMarker = function(){
    //    self.map.removeMarkers();
    //}

    //this.addMarker = function(lat, lon){
    //    self.removeMarker();
    //    self.map.addMarker({
    //        lat: lat,
    //        lng: lon
    //    });
    //}


    //this.addOverlay = function(lat, lon, html){
    //    self.removeOverlay();
    //    self.overlay = self.map.drawOverlay({
    //        lat: lat,
    //        lng: lon,
    //        content: html,
    //        click: function(data){
    //            console.log(data);
    //        }
    //    });
    //}


    this.updatePolyline = function(mapObjectId, points, color){
        if (mapObjectId == undefined){
            return;
        }
        self.polylinesRegistry[mapObjectId] = {
            points: points,
            color: color
        }
        self.redrawPolylinesInRegistry();
    }

    this.updateOverlay = function(mapObjectId, lat, lon, html){
        if (mapObjectId == undefined){
            return;
        }
        self.overlaysRegistry[mapObjectId] = {
            lat: lat,
            lon: lon,
            html: html
        }
        self.redrawOverlaysInRegistry();
    }

    this.updateMarker = function(mapObjectId, lat, lon){
        if (mapObjectId == undefined){
            return;
        }
        self.markersRegistry[mapObjectId] = {
            lat: lat,
            lon: lon
        }
        self.redrawMarkersInRegistry();
    }

    this.deletePolyline = function(mapObjectId){
        var pol = self.polylinesRegistry[mapObjectId];
        if (pol == undefined){
            return;
        }
        self.polylinesRegistry[mapObjectId] = undefined;
        self.redrawPolylinesInRegistry();
    }

    this.deleteMarker = function(mapObjectId){
        var m = self.markersRegistry[mapObjectId];
        if (m == undefined){
            return;
        }
        self.markersRegistry[mapObjectId] = undefined;
        self.redrawMarkersInRegistry();
    }

    this.deleteOverlay = function(mapObjectId){
        var m = self.overlaysRegistry[mapObjectId];
        if (m == undefined){
            return;
        }
        self.overlaysRegistry[mapObjectId] = undefined;
        self.redrawOverlaysInRegistry();
    }


    this.redrawPolylinesInRegistry = function(){
        self.map.removePolylines();
        var map = self.polylinesRegistry;
        for (var key in map){
            var polyline = map[key];
            if (polyline == undefined){
                continue;
            }
            if (polyline.points == undefined || polyline.points.length == 0){
                continue;
            }
            var path = polyline.points.map(function(p){return [p.get('lat'), p.get('lon')]});
            self.polylinesRegistry[key].polyline = self.addPolyline(path, polyline.color);
        }
        self.fitPolylines();
    }


    this.redrawOverlaysInRegistry = function(){
        self.map.removeOverlays();
        var map = self.overlaysRegistry;
        for (var key in map){
            var overlay = map[key];
            if (overlay == undefined){
                continue;
            }
            self.overlaysRegistry[key].overlay = self.map.drawOverlay({
                lat: overlay.lat,
                lng: overlay.lon,
                content: overlay.html,
                click: function(data){
                    console.log(data);
                }
            });
        }
    }


    this.redrawMarkersInRegistry = function(){
        self.map.removeMarkers();
        var map = self.markersRegistry;
        for (var key in map){
            var marker = map[key];
            if (marker == undefined){
                continue;
            }
            self.markersRegistry[key].marker = self.map.addMarker({
                lat: marker.lat,
                lng: marker.lon
            });
        }
    }

}