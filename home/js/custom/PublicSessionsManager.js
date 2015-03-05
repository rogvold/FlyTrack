/**
 * Created by sabir on 14.12.14.
 */

var PublicSessionsManager = function(){
    var self = this;
    this.publicSessions = [];
    this.users = [];
    this.aircrafts = [];
    this.selectedSession = undefined;
    this.selectedPoints = [];
    this.currentUserManager = new CurrentUserManager();
    this.mapDivId = 'map';
    this.centerLat = 56.104215;
    this.centerLon = 36.77124;
    this.path = undefined;
    this.polyline = undefined;

    this.userSessions = [];


    this.init = function(){
        initParse();
        self.initSessionItem();
        self.initAddSessionButton();
        self.currentUserManager.init(function(){
            self.load(function(){
                //self.initMap();
                self.drawSessions();
            });
        });
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


    this.loadSessions = function(callback){
        enablePreloader();
        var q = new Parse.Query(Parse.Object.extend('AirSession'));
        q.equalTo('status', 'public');
        q.addDescending('createdAt');
        q.limit(1000);
        q.find(function(list){
            self.publicSessions = list;
            disablePreloader();
            callback();
        });
    }

    this.loadUserSessions = function(callback){
        enablePreloader();
        var q = new Parse.Query(Parse.Object.extend('AirSession'));
        q.notEqualTo('status', 'public');
        q.addDescending('createdAt');
        q.equalTo('userId', self.currentUserManager.currentUser.id);
        q.limit(1000);
        q.find(function(list){
            self.userSessions = list;
            disablePreloader();
            callback();
        });
    }


    this.loadUsers = function(callback){
        enablePreloader();
        var q = new Parse.Query(Parse.User);
        q.limit(1000);
        q.find(function(list){
            self.users = list;
            disablePreloader();
            callback();
        });
    }

    this.loadAircrafts = function(callback){
        enablePreloader();
        var q = new Parse.Query(Parse.Object.extend('Aircraft'));
        q.limit(1000);
        q.find(function(list){
            self.aircrafts = list;
            disablePreloader();
            callback();
        });
    }

    this.load = function(callback){
        self.loadSessions(function(){
            self.loadUsers(function(){
                self.loadAircrafts(function(){
                    self.loadUserSessions(function(){
                        console.log('loaded...');
                        callback();
                    });

                })
            });
        });
    }

    this.getSessionItem = function(session){
        var s = '';
        var u =self.getUserById(session.get('userId'));
        s+='<div class="col-md-12 publicSessionItem"   data-id="' + session.id + '"  >' +
        '   <div class="panel overflow-hidden no-b profile p15">' +
        '       <div class="row">' +
        '           <div class="col-sm-12">' +
        '               <div class="row">' +
        '                   <div class="col-xs-12 col-sm-10">' +
        '                       <h4 class="mb0 studentName">' + session.get('name') + '</h4>' +
        '                       <ul class="user-meta">' +
        '                           <li>' +
        '                               <i class="ti-text mr5"></i>' +
        '                               <span class=""> ' + session.get('description') + ' </span>' +
        '                           </li>' +
                                    '<li>' +
        '                               <i class="ti-user mr5"></i>' +
        '                               <span class=""> ' + u.get('firstName') + ' ' + u.get('lastName') + ' </span>' +
        '                           </li>' +
        '                           ' +
        '                       </ul>' +
        '                   </div>' +
        '               </div>' +
        '           </div>' +
        '       </div>' +
        '   </div>' +
        '</div>';

        return s;
    }

    this.drawSessions = function(){
        var s = '';
        var list = self.publicSessions;
        console.log('sessions = ', list);
        for (var i in list){
            s+=self.getSessionItem(list[i]);
        }
        $('#sessionsList').html(s);
    }

    this.initSessionItem = function(){
        $('body').on('click', '.publicSessionItem', function(){
            var id = $(this).attr('data-id');
            self.selectedSession = self.getSessionById(id);
            self.loadSelectedSession(function(){
                console.log(self.selectedPoints);
                $('#publicModal').modal();
                setTimeout(function(){
                    self.initMap();
                    self.drawPoints();
                }, 1000)
                $('.currentSessionName').html(self.selectedSession.get('name'));
                $('.currentSessionDescription').html(self.selectedSession.get('description'));
                self.prepareAddSessionButton();
            });
        });
    }

    self.loadSelectedSession = function(callback){
        enablePreloader();
        var q = new Parse.Query(Parse.Object.extend('LocationDataChunk'));
        q.addAscending('number');
        q.equalTo('sessionId', self.selectedSession.id);
        q.limit(1000);
        q.find(function(list){
            var arr = [];
            for (var i in list){
                var c = list[i];
                var times = c.get('times');
                var lat = c.get('lat');
                var lon = c.get('lon');
                var alt = c.get('alt');
                for (var j in times){
                    arr.push({
                        t: times[j],
                        lat: lat[j],
                        lon: lon[j],
                        alt: alt[j]
                    });
                }
            }
            self.selectedPoints = arr;
            disablePreloader();
            callback();
        });
    }

    this.getSessionById = function(id){
        var list = self.publicSessions;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }

    this.getUserById = function(id){
        var list = self.users;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }

    this.selectedSessionIsOwnedByUser = function(){
        if (self.selectedSession == undefined){
            return false;
        }
        var id = self.selectedSession.id;
        var list = self.userSessions;
        for (var i in list){
            if (list[i].get('originId') == id || self.selectedSession.get('originId') == list[i].id){
                return true;
            }
        }
        return false;

    }

    this.prepareAddSessionButton = function(){
        $('#addSessionButton').addClass('hide');
        if (self.selectedSessionIsOwnedByUser() == false){
            $('#addSessionButton').removeClass('hide');
        }
    }

    this.initAddSessionButton = function(){
        $('#addSessionButton').bind('click', function(){
            enablePreloader();
            Parse.Cloud.run('addSharedSession',{
                sessionId: self.selectedSession.id,
                userId: self.currentUserManager.currentUser.id
            },{
                success: function(){
                    toastr.success('Полет успешно скопирован в вашу базу');
                    disablePreloader();
                    window.location.href = window.location.href;
                },
                error: function(err){
                    console.log(err);
                    toastr.error(err.message);
                    disablePreloader();
                }
            });
        });
    }

    this.drawPoints = function(){
        self.map.removePolylines();
        self.path = self.selectedPoints.map(function(p){return [p.lat, p.lon]});
        self.polyline = self.addPolyline(self.path, '#131540');
        self.fitPolylines();
    }

    this.fitPolylines = function(){
        var list = self.selectedPoints;
        var maxLat = getMaxInArray(list.map(function(item){return item.lat}));
        var minLat = getMinInArray(list.map(function(item){return item.lat}));
        var maxLon = getMaxInArray(list.map(function(item){return item.lon}));
        var minLon = getMinInArray(list.map(function(item){return item.lon}));
        console.log(maxLat, maxLon, minLat, minLon);
        self.map.fitLatLngBounds([new google.maps.LatLng(maxLat, maxLon), new google.maps.LatLng(minLat, minLon)]);
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



}