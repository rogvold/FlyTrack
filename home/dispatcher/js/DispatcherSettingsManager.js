/**
 * Created by sabir on 09.11.14.
 */

var DispatcherSettingsManager = function(){
    var self = this;
    this.paramsMap = {
        autoScale: true,
        tracesEnabled: false,
        tracesTime: 0,
        circleRadius: 100,
        radiusEnabled: true
    }

    this.init = function(){
        self.initParams();
        self.initSettingsModal();
    }

    this.initParams = function(){
        for (var key in self.paramsMap){
            if ($.cookie(key) != undefined){
                var v = $.cookie(key);
                if (v == 'true'){ v = true}
                if (v == 'false'){ v = false}
                self.paramsMap[key] = v;
            }
        }
    }

    this.saveSettings = function(name, data){
        self.paramsMap[name] = data;
        $.cookie(name, data);
    }

    this.get = function(name){
        return self.paramsMap[name];
    }

    this.initSettingsModal = function(){
        //init tracesEnabledCheckbox
        console.log('tracesEnabled = ', self.paramsMap['tracesEnabled']);

        if (self.paramsMap['tracesEnabled'] == true){
            console.log('tracesEnabled is true');
            $('#settingsTraceCheckbox').attr('checked', true);
            $('#settingsTrace').val(self.paramsMap['tracesTime']);
            $('#settingsTrace').show();
        }else{
            $('#settingsTraceCheckbox').removeAttr('checked');
            $('#settingsTrace').hide();
        }

        if (self.paramsMap['radiusEnabled'] == true){
            $('#settingsRadiusCheckbox').attr('checked', true);
            $('#settingsRadius').val(self.paramsMap['circleRadius']);
            $('#settingsRadius').show();
        }else{
            $('#settingsRadiusCheckbox').removeAttribute('checked');
            $('#settingsRadius').hide();
        }

        $('#settingsTraceCheckbox').change(function(){
            var ch = $('#settingsTraceCheckbox').is(':checked');
            if (ch == true){
                $('#settingsTrace').show();
            }else{
                $('#settingsTrace').hide();
            }
        });

        $('#settingsRadiusCheckbox').change(function(){
            var ch = $('#settingsRadiusCheckbox').is(':checked');
            if (ch == true){
                $('#settingsRadius').show();
            }else{
                $('#settingsRadius').hide();
            }
        });

        $('#saveSettings').bind('click', function(){
            var ch = $('#settingsTraceCheckbox').is(':checked');
            self.saveSettings('tracesEnabled', ch);
            var tTime = $('#settingsTrace').val().trim();
            tTime = +tTime;
            if (isNaN(tTime) == true){
                alert('Пожалуйста введите нормальное число');
                return;
            }else{
                self.saveSettings('tracesTime', tTime)
            }

            var rch = $('#settingsRadiusCheckbox').is(':checked');
            self.saveSettings('tracesEnabled', ch);
            var r = $('#settingsRadius').val().trim();
            r = +r;
            if (isNaN(r) == true){
                alert('Пожалуйста введите нормальное число');
                return;
            }else{
                self.saveSettings('circleRadius', r)
            }

            self.onSettingsChanges();
            alert('Сохранено');
        });

    }

    this.onSettingsChanges = function(){

    }

}