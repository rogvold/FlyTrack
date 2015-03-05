/**
 * Created by sabir on 06.11.14.
 */

var UserManager = function(){
    var self = this;
    this.users = [];
//    this.currentUserManager = new CurrentUserManager();
    this.interfaceDisabled = false;

    this.init = function(){
        initParse();
        enablePreloader();
        self.initEditBlock()
        self.initEditLinks()
        self.loadUsers(function(){
            disablePreloader();
            self.generateUsersCards();
        });
        self.initCreateButton();
    }

    this.loadUsers = function(callback){
        var q = new Parse.Query(Parse.User);
        q.addAscending('lastName');
        q.addAscending('firstName');
        q.limit(1000);
        q.find(function(users){
            console.log(users);
            self.users = users;
            callback();
        });
    }

    this.generateUsersCards = function(){
        var list = self.users;

        var s = '';
        for (var i in list){
            s += self.generateUserCardHtml(list[i]);
        }
        console.log(s);
        $('#usersCards').html(s);

    }


    this.generateUserCardHtml = function(u){
        if (u == undefined){
            return '';
        }
        var s = '';

        s+=('<div class="col-md-12">'
            +'<div class="panel overflow-hidden no-b profile p15">'
            +'<div class="row">'
            +'<div class="col-sm-12">'
            +'<div class="row">'
            +'<div class="col-xs-12 col-sm-10">'
            +'<h4 class="mb0 studentName">' + u.get('firstName')+ ' ' + u.get('lastName') +'</h4>'
            +'<ul class="user-meta">'
            +'<li>'
            +'<i class="ti-email mr5"></i>'
            +'<span class="studentEmail">' + u.get('email') +'</span>'
            +'</li>'
            +'<li>'
            +'<i class="ti-mobile mr5"></i>'
            +'<span" class="studentPhone" >' + u.get('phone') + '</span>'
            +'</li>'
            +'</ul>'
            +'</div>'
//            +'<p><a class="editLink" data-toggle="modal" data-target="#editModal" href="javascript: void(0);"  data-id=' + u.id +' >редактировать</a> </p>'
            +'</div>'
            +'</div>'

            +'</div>'

            +'</div>'

            +'</div>');

        return s;
    }


    this.initCreateButton = function(){
        $('#createNewUserButton').bind('click', function(){
            var firstName = $('#newUserFirstName').val().trim();
            var lastName = $('#newUserLastName').val().trim();
            var email = $('#newUserEmail').val().trim();
            var password = $('#newUserPassword').val().trim();
            var phone = $('#newUserPhone').val().trim();
            var u = new Parse.User();
            u.set('firstName', firstName);
            u.set('lastName', lastName);
            u.set('phone', phone);
            u.set('userPassword', password);
            u.set('email', email);
            u.set('username', email);
            u.set('password', password);
            u.signUp(null, {
                success: function(user, error){
//                    Parse.User.become(self.currentUserManager.currentUser._sessionToken);
                    self.loadUsers(function(){self.generateUsersCards()});
                },
                error: function(user, error){
                    alert(error.message);
                }
            });
        });
    }

    this.initEditLinks = function(){
        $('body').on('click', '.editLink', function(){
            var id = $(this).attr('data-id');
            var u = self.getUserById(id);
            $('#updateFirstName').val(u.get('firstName'));
            $('#updateLastName').val(u.get('lastName'));
        });
    }

    this.initEditBlock = function(){
        $('#updateButton').bind('click', function(){

        });
    }

    this.getUserById = function(id){
        var list = self.users;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
        return undefined;
    }

}
