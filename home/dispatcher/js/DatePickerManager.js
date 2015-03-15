/**
 * Created by sabir on 09.03.15.
 */

var DatePickerManager = function(){
    var self = this;
    this.startTime = undefined;
    this.endTime = undefined;
    this.pickerId = 'datepicker';


    this.init = function(){
        $('#' + self.pickerId).datepicker({
            format: 'dd/mm/yyyy',
            autoclose: true,
            "setDate": new Date()
        });
        $('#' + self.pickerId).datepicker("setDate", new Date());
        $('#' + self.pickerId).datepicker('update');
        $('#' + self.pickerId + '').on('changeDate', function(e){
            self.selectCallback(e);
        });
    }


    this.selectCallback = function(e){
        console.log(e);
    }


}