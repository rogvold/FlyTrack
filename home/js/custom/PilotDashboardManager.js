/**
 * Created by sabir on 11.11.14.
 */

var PilotDashboardManager = function(){
    var self = this;
    this.currentUserManager = new CurrentUserManager();
    this.sessions = [];
    this.currentSession = undefined;
    this.mapManager = new PilotMapManager();
    this.currentSessionPoints = [];
    this.slider = undefined;
    this.cutStartPoint = undefined;
    this.cutEndPoint = undefined;
    this.startShowingTime = undefined;
    this.endShowingTime = undefined;
    this.heightsChartManager = new PilotChartManager();
    this.shareManager = new ShareFlightManager();
    this.photoManager = new PhotoManager();
    this.time = 0;
    this.timerIntervalId = undefined;
    this.dt = 1000;
    this.speed = 1;

    this.init = function(){
        initParse();
        self.initSettingsDialog();
        self.initDeleteButton();
        self.initShowCutButton();
        self.initCutApplyButton();
        self.initCutRejectButton();
        self.initShareButton();
        self.photoManager.init();

        self.heightsChartManager.init('heightsChart');

        enablePreloader();
        self.mapManager.init('map');
        self.shareManager.init();
        self.currentUserManager.init(function(){
            self.loadSessions(function(){
                self.drawSessions();
                disablePreloader();
            });

        });
    }

    this.loadSessions = function(callback){
        var q = new Parse.Query(Parse.Object.extend('AirSession'));
        q.descending('createdAt');
        q.equalTo('userId', self.currentUserManager.currentUser.id);
        q.notEqualTo('status', 'public');
        q.find(function(list){
            var l = [];
            for (var i in list){
                if (list[i].get('deleted') == true){
                    continue;
                }
                l.push(list[i]);
            }
            self.sessions = l;
//            self.sessions = list;
            callback();
        });
    }

    this.getSessionItemHtml = function(item){
        var s = '';
        var name = item.get('name');
        var sDate = moment(item.createdAt).format('DD.MM.YYYY HH:mm');
        if (name == undefined || name == 'undefined'){
            name = sDate;
        }
        s+='<li data-id="'+ item.id +'" class="p10 bb sessionItem " title="' + sDate + '" >' +
            '<span class="aImagePlaceholder mr5">' +
            '<span class="aName bolder mr5">' + name + '</span>' +
            '</li>';
        return s;
    }

    this.drawSessions = function(){
        var s = '';
        var list = self.sessions;
        for (var i in list){
            s+=self.getSessionItemHtml(list[i]);
        }
        $('#sessionsList').html(s);
        $('body').on('click', '.sessionItem', function(){
            $('.sessionItem').removeClass('selected');
            $(this).addClass('selected');
            var id = $(this).attr('data-id');
            self.currentSession = self.getSessionById(id);
            self.prepareCurrentSession();
        });
    }

    this.prepareCurrentSession = function(){
        var se = self.currentSession;
        enablePreloader();
        $('.cutBlock2').addClass('hide');
        $('.cutBlock1').removeClass('hide');
        self.startShowingTime = (self.currentSession.get('startShowingTime') == undefined) ? 0 : self.currentSession.get('startShowingTime');
        self.endShowingTime = (self.currentSession.get('endShowingTime') == undefined) ? ((new Date()).getTime() * 2) : self.currentSession.get('endShowingTime');
        self.loadCurrentSessionPoints(function(){
            self.prepareCurrentSessionInfoBlock();
            self.mapManager.updatePoints(self.currentSessionPoints);
            self.initMapSlider();
            self.photoManager.loadPhotos(self.currentSession.id);
            disablePreloader();
        });
    }

    this.getSessionById = function(id){
        if (id == undefined){
            return undefined;
        }
        var list = self.sessions;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
        return undefined;
    }

    this.loadCurrentSessionPoints = function(callback){
        if (self.currentSession == undefined){
            return;
        }
        var sessionId = self.currentSession.id;
        //self.recurSessionPointsLoading(0, sessionId, [], callback);
        self.loadLocationChunks(function(){
            callback();
        });
    }

    this.recurSessionPointsLoading = function(page, sessionId, ress, callback){
        console.log('page = ', page);
        if (ress == undefined){
            ress = [];
        }
        if (page == undefined){
            page = 0;
        }
        var AirSessionPoint = Parse.Object.extend('AirSessionPoint');
        var q = new Parse.Query(AirSessionPoint);
        q.equalTo('sessionId', sessionId);
        q.ascending('t');
        q.greaterThanOrEqualTo('t', self.startShowingTime);
        q.lessThanOrEqualTo('t', self.endShowingTime);
//        console.log(self.startShowingTime, ' - ', self.endShowingTime);

        q.limit(1000);
        q.skip(page * 1000);
        q.find(function(list){
            ress = ress.concat(list);
//            console.log('ress = ', ress)
            if (list.length > 0){
                self.recurSessionPointsLoading(page + 1, sessionId, ress, callback);
            }else{
                self.currentSessionPoints = ress;
                callback();
            }
        });
    }

    this.loadLocationChunks = function(callback){
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

    this.prepareCurrentSessionInfoBlock = function(){
        var se = self.currentSession;
        var name = se.get('name');
        var sDate = moment(se.createdAt).format('DD.MM.YYYY HH:mm');
        if (name == undefined || name == 'undefined'){
            name = sDate;
        }
        $('.sessionName').html(name);
        $('#settingsSessionName').val(name);
        self.heightsChartManager.geoPoints = self.currentSessionPoints;
        self.heightsChartManager.drawPoints();
    }

    this.initSettingsDialog = function(){
        $('#settingsSaveButton').click(function(){
            se = self.currentSession;
            if (self.currentSession == undefined){
                toastr.error('Выберите сначала полет из списка слева');
                return;
            }
            var name = $('#settingsSessionName').val().trim();
            if (name == '' || name == undefined){
                name = moment(se.createdAt).format('DD.MM.YYYY HH:mm');
            }
            se.set('name', name);
            enablePreloader();
            se.save().then(function(sess){
                self.currentSession = sess;
                $('.sessionName').html(sess.get('name'));
                disablePreloader();
                toastr.success('Название полета успешно обновлено');
            });
        });
    }

    this.initSlider = function(){
        self.slider = $('#slider').slider();
    }

    this.initMapSlider = function(){
        $('#sliderToolsBlock').removeClass('hide');
        $('#sliderBlock').removeClass('hide');
        $('#cutSliderBlock').addClass('hide');
        var min = self.currentSessionPoints[0].get('t');
        var max = (self.currentSessionPoints[self.currentSessionPoints.length - 1].get('t') - min) / 1000;
        min = 0;
        self.initAnySlider('sliderBlock', 0, min, max, function(value){
            var T = value;
            var curr = self.getNearestPointInCurrenSessionByTimeFromSessionStart(T);
//            console.log(curr.get('lat'), curr.get('lon'));
            self.mapManager.addOverlay(curr.get('lat'), curr.get('lon'), '<b>' + Math.floor(curr.get('alt')) + '</b>')
            self.mapManager.addMarker(curr.get('lat'), curr.get('lon'), '<b>' + curr.get('alt') + '</b>');
        });
    }

    this.getNearestPointInCurrenSessionByTimeFromSessionStart = function(t){ // t is from slider (it's in seconds)
        var list = self.currentSessionPoints;
        t = t * 1000 + list[0].get('t');
        var curr = list[0];
        for (var i in list){
            if (list[i].get('t') > t){
                break;
            }
            curr = list[i];
        }
        return curr;
    }

    this.initShowCutButton = function(){
        $('#showCutButton').bind('click', function(){
            $('#cutSliderBlock').removeClass('hide');
            $('#sliderBlock').addClass('hide');
            var min = self.currentSessionPoints[0].get('t');
            var max = (self.currentSessionPoints[self.currentSessionPoints.length - 1].get('t') - min) / 1000;
            min = 0;
            self.initAnySlider('cutSliderBlock', [min, max], min, max, function(value){
                console.log(value);
                var v1 = Math.min(value[0], value[1]);
                var v2 = Math.max(value[0], value[1]);
                var c1 = self.getNearestPointInCurrenSessionByTimeFromSessionStart(v1);
                var c2 = self.getNearestPointInCurrenSessionByTimeFromSessionStart(v2);
                self.cutStartPoint = c1;
                self.cutEndPoint = c2;
                self.mapManager.selectLine(c1.get('lat'), c1.get('lon'), c2.get('lat'), c2.get('lon'));
            });
            $('.cutBlock1').addClass('hide');
            $('.cutBlock2').removeClass('hide');
        });
    }

    this.initShareButton = function(){

    }

    this.initCutApplyButton = function(){
        $('#cutApplyButton').bind('click', function(){
            if (self.cutStartPoint == undefined || self.cutEndPoint == undefined){
                toastr.error('Выберите границы трека прежде чем нажимать на эту кнопку.');
                return;
            }
            self.currentSession.set('startShowingTime', self.cutStartPoint.get('t'));
            self.currentSession.set('endShowingTime', self.cutEndPoint.get('t'));
            self.currentSession.save().then(function(){
                self.prepareCurrentSession();
//                window.location.href = window.location.href;
//                window.location.href = window.location.href;
            });
        });
    }

    this.initCutRejectButton = function(){
        $('#cutRejectButton').bind('click', function(){
            $('.cutBlock2').addClass('hide');
            $('.cutBlock1').removeClass('hide');
            self.prepareCurrentSession();
        });
    }

    this.initAnySlider = function(sliderContainerDivId, val, min, max, slideCallback){
//        console.log('initAnySlider: ', sliderContainerDivId, val, min, max, slideCallback);
        $('#' + sliderContainerDivId +' .slider.slider-horizontal').remove();
        var sliderDivId = 'slider' + (new Date()).getTime();
        console.log('sliderDivId = ', sliderDivId);
        $('#' + sliderContainerDivId).append('<div id="' + sliderDivId + '"></div>');
//        console.log('appended ' + sliderDivId + ' to ' + sliderContainerDivId);

        $('#' + sliderDivId).slider({
            min: min,
            max: max,
            value: val,
            formater: function(t){
                var h = Math.floor(t / (60 * 60));
                var m = Math.floor((t - 60*h) / 60);
                var s = t % 60;
                return h + ':' + m + ':' + s;
            }
        }).on('slide', function(ev){
            //console.log(ev.value);
            slideCallback(ev.value);
        });
    }

    this.initDeleteButton = function(){
        $('#deleteButton').click(function(){
            if (self.currentSession == undefined){
                toastr.error('Выберите полет из списка слева');
                return;
            }
            var se = self.currentSession;
            se.set('deleted', true);
            enablePreloader();
            self.save().then(function(){
                window.location.href = window.location.href;
            });
        });
    }


    this.initShareButton = function(){
        $('#shareIcon').bind('click', function(){
            self.shareManager.session = self.currentSession;
            self.shareManager.prepareModal();
            $('#shareModal').modal();
        });
    }


    this.migrateSession = function(){
        var list = self.currentSessionPoints;
        var c = 500;
        var n = list.length / c;
        var chunks = [];
        for (var i=0; i <= n; i++){
            var j0 = c*i;
            var jMax = Math.min(c*(i+1), list.length);
            var lat = [], lon = [], times = [], alt = [], acc = [], bea = [], vel = [];
            for (var j = j0; j < jMax; j++){
                lat.push(list[j].get('lat'));
                lon.push(list[j].get('lon'));

                alt.push(list[j].get('alt'));
                acc.push(list[j].get('acc'));
                bea.push(list[j].get('bea'));
                vel.push(list[j].get('vel'));

                times.push(list[j].get('t'));
            }
            var LocationDataChunk = Parse.Object.extend('LocationDataChunk');
            var ch = new LocationDataChunk();
            ch.set('sessionId', self.currentSession.id);
            ch.set('times', times);
            ch.set('lat', lat);
            ch.set('lon', lon);

            ch.set('alt', alt);
            ch.set('acc', acc);
            ch.set('bea', bea);
            ch.set('vel', vel);
            ch.set('number', i+1);
            chunks.push(ch);
        }

        Parse.Object.saveAll(chunks, {
            success: function(ress){
            console.log(ress);
        },
            error: function(err){
            console.log(err);
        }
        });
    }

    this.startTimer = function(){
        setInterval(function(){
            self.time = self.time + self.dt;
        }, self.dt);
    }


}