/**
 * Created by sabir on 07.03.15.
 */

var DispatcherHistoryManager = function(){
    var self = this;
    this.users = [];
    this.aircrafts = [];
    this.time = 0;
    this.dt = 500;
    this.intervalId = undefined;
    this.sessions = [];
    this.chunks = [];
    this.startTime = 0;
    this.endTime = 0;
    this.todayPilots = [];
    this.todayAircrafts = [];
    this.pilotsData = {};
    this.aircraftsData = {};
    this.speed = 1;
    this.nowMap = {};
    this.nowAircraftsMap = {};
    this.mapManager = new DispatcherMapManager();
    this.colorManager = new ColorManager();
    this.datePickerManager = new DatePickerManager();
    this.traceTime = 10 * 60 * 1000;
    this.paused = false;


    this.init = function(){
        initParse();
        console.log('DispatcherHistoryManager occured');
        self.initStartTime();
        self.initDatePicker();
        self.initSpeedButtons();
        self.initPauseButton();
        console.log('starting loading session');
        self.loadUsers(function(){
            self.loadAircrafts(function(){
                self.reloadData(function(){
                    self.initPilotsData();
                    console.log('loaded');
                    //self.mapManager.arrowsAlongPathEnabled = false;
                    self.mapManager.init();
                });
            });
        });
    }


    this.reloadData = function(callback){
        enablePreloader();
        self.loadAirSessions(function(){
            self.loadChunks(function(){
                self.initPilotsData();
                self.initAircraftsData();
                disablePreloader();
                callback();
            });
        });
    }


    this.loadUsers = function(callback){
        var q = new Parse.Query(Parse.User);
        q.limit(1000);
        q.find(function(results){
            self.users = results;
            console.log('console.log: users loaded: users = ', self.users);
            callback();
        });
    }

    this.loadAircrafts = function(callback){
        var q = new Parse.Query(Parse.Object.extend('Aircraft'));
        q.limit(1000);
        q.find(function(results){
            self.aircrafts = results;
            console.log('aircrafts loaded', self.aircrafts);
            callback();
        });
    }

    this.getUserById = function(id){
        var list = self.users;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }

    this.getSessionById = function(id){
        var list = self.sessions;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }

    this.getAircraftById = function(id){
        var list = self.aircrafts;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }

    this.onTick = function(){
        //console.log('onTick occured');
        console.log(moment(self.time).format('MMMM Do YYYY, h:mm:ss a'));
        $('#currentTimePlaceholder').html(moment(self.time).format('hh:mm:ss a'));
        self.nowMap = self.getNowMap();
        self.nowAircraftsMap = self.getNowAircraftsMap();
        var map = self.nowMap;
        var n = 0;
        for (var key in map){
            var data = map[key];
            if (data.length > 0){
                 n++;
            }
        }
        console.log('online pilots: n = ' + n);
        self.drawNowPoints();

        if (self.time > self.endTime){
            clearInterval(self.intervalId);
            alert('Полеты завершены');
        }
        //console.log(self.nowMap);
    }

    this.initTimer = function(){
        self.intervalId = setInterval(function(){
            if (self.paused == false){
                self.time+=self.dt * self.speed;
                self.onTick();
            }

        }, self.dt);
    }

    this.updateTimer = function(){
        //if (self.intervalId != undefined){
        clearInterval(self.intervalId);
        //}
        self.time = self.startTime;
        self.initTimer();
    }

    this.loadAirSessions = function(callback){
        var q = new Parse.Query(Parse.Object.extend('AirSession'));
        q.limit(1000);
        q.greaterThan('createdAt', new Date(self.startTime));
        q.lessThan('endDate', self.endTime);
        q.addAscending('createdAt');
        q.equalTo('deleted', false);
        q.find(function(results){
            self.sessions = results;
            console.log('sessions loaded: sessions = ', self.sessions);
            var list = self.sessions;
            var min = (new Date().getTime() + 24 * 3600 * 1000);
            var max = 0;
            for (var j in list){
                var sess = list[j];
                var tt = moment(sess.createdAt).unix() * 1000;
                var tt2 = sess.get('endDate');
                console.log('tt2 = ' + tt2);
                if (tt < min){
                    min = tt;
                }
                if (tt2 > max){
                    max = tt2;
                }
            }
            self.startTime = min;
            self.endTime = max;
            console.log('updated start time = ' + self.startTime);
            console.log('updated end time = ' + self.endTime);
            callback();
        });
    }

    this.loadLocationChunks = function(callback){ //shit
        var q = new Parse.Query(Parse.Object.extend('LocationDataChunk'));
        var AirSessionPoint = Parse.Object.extend('AirSessionPoint');
        q.limit(1000);
        q.addAscending('number');
        q.equalTo('sessionId', self.currentSession.id);
        q.find(function(results){
            console.log('chunks = ', results);
            var arr = [];
            for (var i in results){
                var c = results[i];
                var times = c.get('times');
                for (var j in times){
                    var p = new AirSessionPoint();

                    p.set('t', times[j]);
                    p.set('lat', c.get('lat')[j]);
                    p.set('lon', c.get('lon')[j]);

                    if (c.get('alt') != undefined){ p.set('alt', c.get('alt')[j]); }
                    if (c.get('acc') != undefined){ p.set('acc', c.get('acc')[j]); }
                    if (c.get('bea') != undefined){ p.set('bea', c.get('bea')[j]); }
                    if (c.get('vel') != undefined){ p.set('vel', c.get('vel')[j]); }
                    arr.push(p);
                }
            }
            self.currentSessionPoints = arr;
            callback();
        });
    }

    this.loadChunks = function(callback){
        var q = new Parse.Query(Parse.Object.extend('LocationDataChunk'));
        q.limit(1000);
        q.addAscending('sessionId');
        q.addAscending('number');
        var arr = self.sessions.map(function(r){ return r.id});
        q.containedIn('sessionId', arr);
        q.find(function(results){
            self.chunks = results;
            callback();
        });
    }

    this.getChunksBySessionId = function(sessionId){
        console.log('getChunksBySessionId: sessionId = ' + sessionId);
        var arr = [];
        var list = self.chunks;
        for (var i in list){
            if (list[i].get('sessionId') == sessionId){
                arr.push(list[i]);
            }
        }
        console.log('returning ', arr);
        return arr;
    }


    this.getDataBySessionId = function(sessionId){
        var list = self.getChunksBySessionId(sessionId);
        var arr = [];
        var AirSessionPoint = Parse.Object.extend('AirSessionPoint');
        var session = self.getSessionById(sessionId);
        var pilot = self.getUserById(session.get('userId'));
        var sessionsList = self.getPilotSessions(pilot.id);
        session = sessionsList[0];
        var pilotStart = moment(session.createdAt).unix() * 1000;
        console.log('getDataBySessionId: pilotStart = ' + pilotStart + '; formatted = ' + moment(pilotStart).format('MMMM Do YYYY, h:mm:ss a'));

        for (var i in list){
            var c = list[i];
            var times = c.get('times');
            for (var j in times){
                var p = new AirSessionPoint();

                p.set('t', times[j] + pilotStart);
                p.set('lat', c.get('lat')[j]);
                p.set('lon', c.get('lon')[j]);
                p.set('sessionId', sessionId);

                if (c.get('alt') != undefined){ p.set('alt', c.get('alt')[j]); }
                if (c.get('acc') != undefined){ p.set('acc', c.get('acc')[j]); }
                if (c.get('bea') != undefined){ p.set('bea', c.get('bea')[j]); }
                if (c.get('vel') != undefined){ p.set('vel', c.get('vel')[j]); }
                arr.push(p);
            }
        }
        return arr;
    }

    this.initStartTime = function(){
        self.startTime = moment(new Date().getTime()).startOf('day').unix() * 1000;
        self.endTime = moment(new Date().getTime()).endOf('day').unix() * 1000 ;
       console.log('initStartTime: startTime = ' + self.startTime + ' ; ' + self.endTime);
    }


    this.initTodayPilots = function(){
        console.log('initTodayPilots occured');
        var list = self.sessions;
        var arr = [];
        var map = {};
        for (var i in list){
            var userId = list[i].get('userId');
            if (map[userId] != undefined){
                continue;
            }
            map[userId] = userId;
            arr.push(self.getUserById(userId));
        }
        self.todayPilots = arr;
        console.log('today pilots = ', arr);
    }

    this.initTodayAircrafts = function(){
        console.log('initTodayAircrafts occured');
        var list = self.sessions;
        var arr = [];
        var map = {};
        for (var i in list){
            var aircraftId = list[i].get('aircraftId');
            if (map[aircraftId] != undefined){
                continue;
            }
            map[aircraftId] = aircraftId;
            arr.push(self.getAircraftById(aircraftId));
        }
        self.todayAircrafts = arr;
        console.log('today aircrafts = ', arr);
    }


    this.getPilotSessions = function(userId){
        var arr = [];
        console.log('getPilotSessions occured');
        var list = self.sessions;
        for (var i in list){
            if (list[i].get('userId') == userId){
                arr.push(list[i]);
            }
        }
        console.log('returning user (' + userId + ') sessions', arr);
        return arr;
    }

    this.getAircraftSessions = function(aircraftId){
        var arr = [];
        console.log('getAircraftSessions occured');
        var list = self.sessions;
        for (var i in list){
            if (list[i].get('aircraftId') == aircraftId){
                arr.push(list[i]);
            }
        }
        console.log('returning aircraft (' + aircraftId + ') sessions', arr);
        return arr;
    }

    this.getAircraftData = function(aircraftId){
        var arr = [];
        var list = self.getAircraftSessions(aircraftId);
        for (var i in list){
            var session = list[i];
            var d = self.getDataBySessionId(session.id);
            arr = arr.concat(d);
        }
        return arr;
    }

    this.getPilotData = function(userId){
        var arr = [];
        var list = self.getPilotSessions(userId);
        for (var i in list){
            var session = list[i];
            var d = self.getDataBySessionId(session.id);
            arr = arr.concat(d);
        }
        return arr;
    }

    this.initPilotsData = function(){
        console.log('-->initPilotsData occured');
        self.initTodayPilots();
        var list = self.todayPilots;
        var map = {};
        for (var i in list){
            var pilot = list[i];
            map[pilot.id] = self.getPilotData(pilot.id);
        }
        self.pilotsData = map;
        console.log('pilots map = ');
        console.log(map);
        console.log('updated start time = ' + self.startTime);
        self.time = self.startTime;
        //self.initTimer();
        self.updateTimer();
    }

    this.initAircraftsData = function(){
        //aircraftsData
        console.log('-->initPilotsData occured');
        self.initTodayAircrafts();
        var list = self.todayAircrafts;
        var map = {};
        for (var i in list){
            var aircraft = list[i];
            map[aircraft.id] = self.getAircraftData(aircraft.id);
        }
        self.aircraftsData = map;
        console.log('aircrafts map = ');
        console.log(map);
        console.log('updated start time = ' + self.startTime);
        self.time = self.startTime;
        //self.initTimer();
        self.updateTimer();
    }

    this.getNowMap = function(){
        var map = self.pilotsData;
        var nowMap = {};
        var t0 = self.startTime;
        for (var key in map){
            var arr = map[key];
            var arr2 = [];
            for (var j in arr){
                var point = arr[j];
                var delta = self.time - point.get('t');
                if (delta > self.traceTime){
                    continue;
                }
                if (point.get('t') < self.time){
                    arr2.push(point);
                }
            }
            nowMap[key] = arr2;
        }
        return nowMap;
    }

    this.getNowAircraftsMap = function(){
        var map = self.aircraftsData;
        var nowMap = {};
        var t0 = self.startTime;
        for (var key in map){
            var arr = map[key];
            var aircraft = self.getAircraftById(key);
            var arr2 = [];
            for (var j in arr){
                var point = arr[j];
                var session = self.getSessionById(point.get('sessionId'));
                var delta = self.time - point.get('t');
                if (delta > self.traceTime){
                    continue;
                }
                //if (self.time > session.get('endDate')){
                //    console.log('session: ' + session.get('name') + '; plane = ' + aircraft.get('name'));
                //    console.log('self.time = ' + moment(self.time).format('DD-MM-YYYY h:mm:ss a') + '; endDate = ' + moment(session.get('endDate')).format('DD-MM-YYYY h:mm:ss a'));
                //}
                if (point.get('t') < self.time){
                    arr2.push(point);
                }
            }
            nowMap[key] = arr2;
        }
        return nowMap;
    }


    this.drawNowPoints = function(){
        //var map = self.nowMap;
        var map = self.nowAircraftsMap;
        for (var key in map){
            var arr = map[key];
            var p = undefined;
            var aircraft = self.getAircraftById(key);
            if (arr.length > 0){
                p = arr[arr.length - 1];
                //self.mapManager.addOverlay(p.get('lat'), p.get('lon'), '<b>' + 'x' + '</b>');
                //self.mapManager.addMarker(p.get('lat'), p.get('lon'), '<b>' + p.get('alt') + '</b>');
                //self.mapManager.updatePoints(arr, self.colorManager.getColor(pilot.id));
                //self.mapManager.addMarker(p.get('lat'), p.get('lon'));
                self.mapManager.updatePolyline(aircraft.id, arr, self.colorManager.getColor(aircraft.id));
                self.mapManager.updateOverlay(aircraft.id, p.get('lat'), p.get('lon'), '<span style="background-color: white; color: ' +  self.colorManager.getColor(aircraft.id)  + '; padding: 3px; font-weight: bold; border: 1px solid ' + self.colorManager.getColor(aircraft.id) +  '; " >' + aircraft.get('name') + ' [' + aircraft.get('callName') +'] ' + '</span>');
            }
        }
    }

    this.initDatePicker = function(){
        self.datePickerManager.init();
        self.datePickerManager.selectCallback = function(e){
            console.log('--. ', e.date);
            clearInterval(self.intervalId);
            self.startTime = moment(e.date).startOf('day').unix() * 1000;
            self.endTime = moment(e.date).endOf('day').unix() * 1000;
            self.reloadData(function(){
                self.updateTimer();
            });
        }
    }

    this.initSpeedButtons = function(){
        $('.speedButton').bind('click', function(){
            $('.speedButton').removeClass('btn-instagram');
            $(this).addClass('btn-instagram');
            self.speed = parseInt($(this).attr('data-speed'));
        });
    }

    this.initPauseButton = function(){
        $('#pauseButton').bind('click', function(){
            $(this).removeClass('btn-instagram');
            if (self.paused == false){
                self.paused = true;
                $(this).html('НА ПАУЗЕ');
                $(this).addClass('btn-instagram');
            }else{
                $(this).html('поставить на паузу');
                self.paused = false;
            }
        });
    }

}