/**
 * Created by sabir on 14.12.14.
 */

var ShareFlightManager = function(){
    var self = this;
    this.session = undefined;

    this.init = function(){
        initParse();
        self.initModal();
    }


    this.shareSession = function(session){
        self.session = session;
    }

    this.prepareModal = function(){
        if (self.session == undefined){
            return;
        }
        $('#shareName').val(self.session.get('name'));
    }


    this.initModal = function(){
        $('#shareButton').bind('click', function(){
            var name = $('#shareName').val().trim();
            if (name == undefined || name == ''){
                toastr.error('Вы не ввели название');
                return
            }
            var description = $('#shareDescription').val().trim();
            enablePreloader();
            Parse.Cloud.run('shareSession',{
                sessionId: self.session.id,
                name: name,
                description: description,
                userId: self.session.get('userId'),
                aircraftId: self.session.get('aircraftId')
            },{
                success: function(){
                    toastr.success('Теперь полет доступен для просмотра всеми пользователями');
                    disablePreloader();
                },
                error: function(err){
                    console.log(err);
                    toastr.error(err.message);
                    disablePreloader();
                }
            });
        });
    }

}