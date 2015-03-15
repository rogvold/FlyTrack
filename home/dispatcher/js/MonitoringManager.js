/**
 * Created by sabir on 07.11.14.
 */

var MonitoringManager = function(){
    var self = this;
    this.PUBNUB = undefined;
    this.users = [];
    this.aircrafts = [];
    this.selectedAircrafts = [];

    this.subscribeGPSChannel = 'GPS';
    this.subscribeHeartRateChannel = 'HeartRate';
    this.time = 0;
    this.gpsPointsMap = {};
    this.heartRatePointsMap = {};
    this.sim = new SimulationManager();
    this.mapManager = new MapManager();
    this.aircraftsPointsMap = {};
    this.idleTime = 5 * 1000;
    this.settingsManager = new DispatcherSettingsManager();
    this.shouldShowWarnings = true;
    this.aircraftsInDanger = [];


    this.initPubNub = function(){
        self.PUBNUB = PUBNUB.init({
            publish_key: 'pub-c-a86ef89b-7858-4b4c-8f89-c4348bfc4b79',
            subscribe_key: 'sub-c-e5ae235a-4c3e-11e4-9e3d-02ee2ddab7fe'
        });
    }

    this.init = function(){
        initParse();
        enablePreloader();
        self.settingsManager.init();
        self.initPubNub();
        self.loadBase(function(){
            disablePreloader();
            self.initSubscriptions();
//            self.sim.init();
            self.initMapManager();

            self.prepareAllAircraftsHtml();
            self.initTimer();
            self.initFooterSettingsTools();
            //todo: load history and subscribe
        });
    }

    this.initMapManager = function(){
        self.mapManager.init();
        self.mapManager.circleR = +self.settingsManager.get('circleRadius');
        self.settingsManager.onSettingsChanges = function(){
            self.settingsChanged();
        }
    }

    this.settingsChanged = function(){
        self.mapManager.circleR = self.settingsManager.get('circleRadius');
        self.mapManager.shouldShowCircles = self.settingsManager.get('radiusEnabled');
    }


    this.loadGpsHistory = function(callback){
        self.PUBNUB.history({
            channel: self.subscribeGPSChannel,
            count: 100,
            callback: function(m){
                console.log(m);
                callback();
            }
        });
    }


    this.loadHeartRateHistory = function(callback){
        self.PUBNUB.history({
            channel: self.subscribeHeartRateChannel,
            count: 100,
            callback: function(m){
                console.log(m);
                callback();
            }
        });
    }


    this.loadBase = function(callback){
        var q = new Parse.Query(Parse.User);
        q.limit(1000);
        q.find(function(list){
            self.users = list;
            var q = new Parse.Query(Parse.Object.extend('Aircraft'));
            q.limit(1000);
            q.find(function(results){
                self.aircrafts = results;
                callback();
            });
        });
    }

    this.onGPSReceived = function(data){
//        console.log('onGPSReceived', data);
        if (self.isSelectedAircraft(data.aircraftId) == true){
            self.mapManager.addAircraftOverlay(data.lat, data.lon, self.getAircraftOverlayHtml(self.getAircraftById(data.aircraftId)), data.aircraftId);
        }
        $('li[data-id="' + data.aircraftId +'"]').removeClass('hide');
        if (self.aircraftsPointsMap[data.aircraftId] == undefined){
            self.aircraftsPointsMap[data.aircraftId] = {points: []};
        }

        self.aircraftsPointsMap[data.aircraftId].points.push(data);
        self.aircraftsPointsMap[data.aircraftId].lastUpdatedTime = (new Date()).getTime();
        self.checkCriticalDistances(data.aircraftId);
    }

    this.onHeartRateReceived = function(data){
        console.log('onHeartRateReceived', data);

        //todo: update view
    }

    this.initSubscriptions = function(){
        self.subscribeGPS();
        self.subscribeHeartRate();
    }

    this.subscribeGPS = function(){
        self.PUBNUB.subscribe({
            channel: self.subscribeGPSChannel,
            message: function(m){
                self.onGPSReceived(m);
            }
        });
    }

    this.subscribeHeartRate = function(){
        self.PUBNUB.subscribe({
            channel: self.subscribeHeartRateChannel,
            message: function(m){
                self.onHeartRateReceived(m);
            }
        });
    }

    this.initTimer = function(){
        setInterval(function(){
            self.time+=100;
            self.updateUpdateTime();
        }, 100);
    }

    this.getPlaneCardHtml = function(a){
        var s = '';
        s+='<li data-id="'+ a.id +'" class="p10 bb hide">' +
            '<span class="aImagePlaceholder mr5"><input type="checkbox" class="p5 aircraftCheckbox" checked data-id="' + a.id + '" /></span>' +
            '<span class="aImagePlaceholder mr5"><img class="aImg" src="img/' + a.get('aircraftType') + '.png" /></span>' +
            '<span class="aName bolder mr5">' + a.get('name') + '</span>' +
            '<span class=""><span class="updatedTime pl5 pr5 ml10 pull-right"></span></span>' +
            '<span class="callName text-right pull-right">' + a.get('callName') + '</span>' +
            '</li>';
        return s;
    }

    this.prepareAllAircraftsHtml = function(){
        var s = '';
        var list = self.aircrafts;
        for (var i in list){
            s+=self.getPlaneCardHtml(list[i]);
        }
        console.log(s);
        $('#pilotsList').html(s);
        self.initAircraftCheckboxes();
    }

    this.getAircraftOverlayHtml = function(a){
        var s = '';
        s+='<span class="aircraftOverlay ' + a.get('aircraftType') + '" >' +
            '<span class="aircraftImgPlaceholder"><img style="width: 50px; height: auto; top: -25px; left: -25px;" src="img/' + a.get('aircraftType') + '.png" /></span>' +
            '</span>';
        return s;
    }

    this.getAircraftById = function(id){
        var list = self.aircrafts;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
        return undefined;
    }

    this.updateUpdateTime = function(){
        var now = (new Date()).getTime();
        var map = self.aircraftsPointsMap;
        for (var key in map){
            var dt = now - map[key].lastUpdatedTime;
            $('li[data-id=' + key + '] .updatedTime').html(Math.floor(dt / 100.0) / 10.0 + ' s');
            $('li[data-id=' + key + ']').removeClass('online');
            $('li[data-id=' + key + ']').removeClass('offline');
            $('li[data-id=' + key + ']').removeClass('animated');
            $('li[data-id=' + key + ']').removeClass('flash');
            if (dt < self.idleTime){
                $('li[data-id=' + key + ']').addClass('online');
                $('li[data-id=' + key + ']').addClass('animated');

            }else{
                $('li[data-id=' + key + ']').addClass('offline');
            }
        }
    }

    this.initFooterSettingsTools = function(){
        $('#autoscaleCheckbox').change(function(){
            var ch = $(this).is(':checked');
            self.mapManager.autoScaleEnabled = ch;
        });
        $('#showNotificationCheckbox').change(function(){
            var ch = $(this).is(':checked');
            self.shouldShowWarnings = ch;
        });
    }

    this.checkCriticalDistances = function(aircraftId){
        self.aircraftsInDanger = [];
        var map = self.aircraftsPointsMap;
        var checkedPairs = {};
        var cD = 2 * self.settingsManager.get('circleRadius');
        for (var aircraftId1 in map){
            if (self.isSelectedAircraft(aircraftId1) == false){
                continue;
            }
            var points1 = map[aircraftId1].points;
            var p1 = points1[points1.length - 1];
            for (var aircraftId2 in map ){
                if (self.isSelectedAircraft(aircraftId2) == false){
                    continue;
                }
                if (checkedPairs[aircraftId1 + aircraftId2] != undefined || checkedPairs[aircraftId2 + aircraftId1] != undefined){
                    continue;
                }
                checkedPairs[aircraftId1 + aircraftId2] = 1;
                checkedPairs[aircraftId2 + aircraftId1] = 1;
                var points2 = map[aircraftId2].points;
                var p2 = points2[points2.length - 1];
                if (aircraftId1 == aircraftId2){
                    continue;
                }
                var d = getDistanceFromLatLon(p1.lat, p1.lon, p2.lat, p2.lon);
                if (d < cD){
                    if (aircraftId == aircraftId1 || aircraftId == aircraftId2){
                        self.aircraftsInDanger.push(self.getAircraftById(aircraftId1));
                        self.aircraftsInDanger.push(self.getAircraftById(aircraftId2));
                        if (self.shouldShowWarnings == true){
                            toastr.options = {"progressBar": true, "onclick": function(){}}
                            toastr.error('Опасное сближение');
                        }

                    }
                }
            }
        }
    }

    this.getSelectedAircrafts = function(){
        var arr = [];
        $('.aircraftCheckbox:visible').each(function(){
            var id = $(this).attr('data-id');
            arr.push(self.getAircraftById(id));
        });
        return arr;
    }

    this.isSelectedAircraft = function(aircraftId){
        if ($('.aircraftCheckbox[data-id="' + aircraftId + '"]').is(':visible') == true){
            return true;
        }
        return false;
    }

    this.initAircraftCheckboxes = function(){
        $('.aircraftCheckbox').change(function(){
            var id = $(this).attr('data-id');
            var ch = $(this).is(':checked');
            if (ch == false){
                self.mapManager.removeOverlay(id);
                self.mapManager.removeCircle(id);
                console.log('removing overlay from aircraft id = ' + id);
            }else{
                var points = self.aircraftsPointsMap[data.aircraftId].points;
                var p = points[points.length - 1];
                self.mapManager.addAircraftOverlay(p.lat, p.lon, self.getAircraftOverlayHtml(self.getAircraftById(id)), id);
            }
        });
    }


}