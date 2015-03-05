/**
 * Created by sabir on 06.11.14.
 */

var UserDashboardManager = function(){
    var self = this;
    this.currentUserManager = new CurrentUserManager();
    this.exercises = [];

    this.init = function(){
        initParse();
        enablePreloader();
        self.currentUserManager.init(function(){
            self.loadExercises(function(){
                self.drawExercises();
                disablePreloader();
            });
        });
    }

    this.loadExercises = function(callback){
        var q = new Parse.Query(Parse.Object.extend('Exercise'));
        q.descending('createdAt');
        q.find(function(list){
            self.exercises = list;
            callback();
        });
    }

    this.drawExercises = function(){
        var list = self.exercises;
        var s = '';
        for (var i in list){
            s += self.getExercisePanelHtml(list[i]);
        }
        $('#exercisesCards').html(s);
    }

    this.getExercisePanelHtml = function(exercise){
        var s = '';
        console.log('getExercisePanelHtml: ex =  ');
        console.log(exercise);
        if (exercise == undefined){
            return '';
        }
        s+= '<div class="switch-item hr legal mt5 exercisePanel " style="">'
            + '<section class="panel">'
            + '<div class="thumb">' +
            '<a href="exercise.html?id=' + exercise.id + '" >'
            + '<img class="img-responsive" alt="Responsive image" src="' + exercise.get('imageUrl') +'">' +
            '</a>'
            + '</div>'
            + '<div class="panel-body">'
            + '<div class="switcher-content">'
            + '<p>'
            + '<h3 class="mt0"><a href="exercise.html?id='+ exercise.id +'">' + exercise.get('name') + ' </a></h3>'
            + '</p>'

            + '<p>'
            + '<b>Description: </b>' + exercise.get('description')
            + '</p>'

            + '<p>'
            + '<b>Task: </b>' + exercise.get('task')
            + '</p>'
            + '</div>'
            + '</div>'
            + '</section>'
            + '</div>';
        console.log(s);
        return s;
    }


}