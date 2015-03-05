/**
 * Created by sabir on 07.11.14.
 */

var AircraftManager = function(){
    var self = this;
    this.aircrafts = [];
    this.selectedAircraft = undefined;

    this.init = function(){
        initParse();
        self.initEditBlock();
        self.initCreateBlock();
        self.loadAircrafts(function(){
            self.drawAircrafts();
        });
    }

    this.loadAircrafts = function(callback){
        var Aircraft = Parse.Object.extend('Aircraft');
        var query = new Parse.Query(Aircraft);
        query.ascending('name');
        query.limit(1000);
        query.find({
            success: function(results){
                self.aircrafts = results;
                callback();
            }
        });
    }

    this.drawAircrafts = function(){
        var list = self.aircrafts;
        var s = '';
        for (var i in list){
            s+= self.getAircraftPanelHtml(list[i]);
        }
        $('#aircraftsCards').html(s);
    }

    this.getAircraftPanelHtml = function(a){
        var s = '';
        s+=('<div class="col-md-4">'
            +'<div class="panel overflow-hidden no-b profile p15">'
            +'<div class="row">'
            +'<div class="col-sm-12">'
            +'<div class="row">'
            +'<div class="col-xs-12 col-sm-8">'
            +'<h4 class="mb0 studentName aircraftName" data-toggle="modal" data-target="#editModal" data-id="' + a.id + '"  >' + a.get('name') + '</h4>'
            +'<small><span class="studentDepartment">' + a.get('aircraftType') +'</span> - <span class="studentGroupNumber" >' + a.get('aircraftId') + '</span></small>'
            +'<ul class="user-meta">'
            +'<li>'
            +'<span class="studentEmail">' + a.get('callName') +'</span>'
            +'</li>'
            +'</ul>'
            +'</div>'
            +'<div class="col-xs-12 col-sm-4 text-center">'
            +'<figure>'
            +'<img src="img/' + a.get('aircraftType') + '.png" alt="" class="avatar avatar-lg aircraftAvatar img-circle avatar-bordered">'
            +'</figure>'
            +'</div>'
            +'</div>'
            +'</div>'

            +'</div>'

            +'</div>'

            +'</div>');
        return s;
    }



    this.initEditBlock = function(){
        $('body').on('click', '.aircraftName', function(){
            var id = $(this).attr('data-id');
            self.selectedAircraft = self.getAircraftById(id);
            $('#editName').val(self.selectedAircraft.get('name'));
            $('#editAircraftId').val(self.selectedAircraft.get('aircraftId'));
            $('#editCallName').val(self.selectedAircraft.get('callName'));
            $('input[name=editAircraftType][value=' + self.selectedAircraft.get('aircraftType') +']').select();
        });

        $('#updateButton').bind('click', function(){
            var name = $('#editName').val().trim();
            var aircraftId = $('#editAircraftId').val().trim();
            var callName = $('#editCallName').val().trim();
            var aircraftType = $('input[name=editAircraftType]:checked').val();
            var a = self.selectedAircraft;
            a.set('name', name);
            a.set('aircraftId', aircraftId);
            a.set('aircraftType', aircraftType);
            a.set('callName', callName);
            a.save().then(function(){
                window.location.href = window.location.href;
            });
        });
    }

    this.initCreateBlock = function(){
        $('#createButton').bind('click', function(){
            var name = $('#name').val().trim();
            var aircraftId = $('#aircraftId').val().trim();
            var callName = $('#callName').val().trim();
            var aircraftType = $('input[name=aircraftType]:checked').val();
            var Aircraft = Parse.Object.extend('Aircraft');
            var q = new Parse.Query(Aircraft);
            q.equalTo('aircraftId', aircraftId);
            q.find(function(results){
                if (results != undefined && results.length > 0){
                    alert('Авиасудно с данным номером уже зарегистрировано');
                    return;
                }
                var a = new Aircraft();
                a.set('name', name);
                a.set('aircraftId', aircraftId);
                a.set('aircraftType', aircraftType);
                a.set('callName', callName);
                a.save().then(function(){
                    window.location.href = window.location.href;
                });
            });

        });
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




}