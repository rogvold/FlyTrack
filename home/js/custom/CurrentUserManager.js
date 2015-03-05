/**
 * Created by sabir on 06.11.14.
 */


var CurrentUserManager = function(){
    var self = this;
    this.currentUser = undefined;
    this.userName = '';
    this.avatarUrl = '';

    this.init = function(callback){
        initParse();
        if (window.location.href.indexOf('signin') > -1){
            if (Parse.User.current() != undefined){
                window.location.href = 'index.html';
            }
            self.initSignInButton();
            return;
        }
        self.prepareUserInfo(function(){
            if (callback != undefined){
                callback();
            }
        });
    }

    this.prepareUserInfo = function(callback){
        self.currentUser = Parse.User.current();
        console.log('current user is: ');
        console.log(self.currentUser);
        if (self.currentUser == undefined){
            window.location.href = 'signin.html';
            return;
        }
        self.userName = self.currentUser.get('firstName') + ' ' + self.currentUser.get('lastName');
//        self.avatarUrl = self.currentUser.get('avatarUrl') + '?size=large';
//        $('.header-avatar').attr('src', self.avatarUrl);
        $('.username').text(self.userName);
        self.initLogoutLink();
        callback();
    }


    this.initLogoutLink = function(){
        $('.logoutLink').bind('click', function(){
            self.logout();
        });;
    }

    this.initSignInButton = function(){
        $('#signInButton').bind('click', function(){
            var email = $('#email').val().trim();
            var password = $('#password').val().trim();
            Parse.User.logIn(email, password, {
                success: function(user) {
                    window.location.href = 'index.html';
                },
                error: function(user, error) {
                    if (error.code = 101){
                        alert('Неправильная пара email/пароль');
                        return;
                    }

                }
            });
        });

    }

    this.logout = function(){
        Parse.User.logOut();
        window.location.href = 'signin.html';
    }

}