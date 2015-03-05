/**
 * Created by sabir on 09.11.14.
 */

var SimulationManager = function(){
    var self = this;
    this.aircrafts = [];
    this.users = [];
    this.PUBNUB = undefined;
    this.centerLat = 56.104215;
    this.centerLon = 36.77124;
    this.dx = 0.05;
    this.subscribeGPSChannel = 'GPS';
    this.subscribeHeartRateChannel = 'HeartRate';
    this.pilotAircraftMap = {};


    this.init = function(){
        self.initPubNub();
        self.loadBase(function(){
            console.log(self.users);
            console.log(self.aircrafts);
            self.initPilotAircraftMap();
            self.initSimulation();
        });
    }

    this.initPubNub = function(){
        self.PUBNUB = PUBNUB.init({
            publish_key: 'pub-c-a86ef89b-7858-4b4c-8f89-c4348bfc4b79',
            subscribe_key: 'sub-c-e5ae235a-4c3e-11e4-9e3d-02ee2ddab7fe'
        });
    }


    this.initPilotAircraftMap = function(){
        var map = {};
        var max = Math.min(self.users.length, self.aircrafts.length);
        for (var i = 0; i < max; i++){
            map[self.users[i].id] = self.aircrafts[i].id
        }
        self.pilotAircraftMap = map;
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


    this.getRandomGpsPoint = function(){
        var userId = self.users[Math.floor(Math.random() * Math.min(self.users.length, self.aircrafts.length) )].id;
        var m = {
            userId: userId,
            aircraftId: self.pilotAircraftMap[userId],
            lat: self.centerLat + self.dx * (0.5 -  Math.random()),
            lon: self.centerLon + self.dx * ( 0.5 - Math.random()),
            t: (new Date()).getTime()
        }
        return m;
    }


    this.initSimulation = function(){
        setInterval(function(){
            var m = self.getRandomGpsPoint();
            self.PUBNUB.publish({
                channel: self.subscribeGPSChannel,
                message: m
            });
        }, 5000);
    }


}