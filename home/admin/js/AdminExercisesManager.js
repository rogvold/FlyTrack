/**
 * Created by sabir on 05.11.14.
 */

var AdminExercisesManager = function(){
    var self = this;
    this.exercises = [];
    this.editingExercise = undefined;

    this.init = function(){
        initParse();
        self.initCreateNewExBlock();
        self.initDeleteButton();
        self.initEditingBlock();
        self.initExercisesList();
        self.loadExercises(function(){
            self.drawExercises();
        });
    }

    this.loadExercises = function(callback){
        enablePreloader();
        var q = new Parse.Query(Parse.Object.extend('Exercise'));
        q.limit(1000);
        q.descending('createdAt');
        q.find(function(list){
            self.exercises = list;
            disablePreloader();
            callback();
        });

    }

    this.drawExercises = function(){
        var list = self.exercises;
        var s = '';
        for (var i in list){
            s+= self.getExercisePanelHtml(list[i]);
        }
        console.log('drawExercises occured - s = ');
        console.log(s);
        $('#exercisesList').html(s);
    }

    this.initExercisesList = function(){
        $('body').on('click', '.editButton', function(){
            var id = $(this).attr('data-id');
            self.editingExercise = self.getExerciseById(id);
            self.prepareEditingBlock();
        });
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
            + '<div class="thumb">'
            + '<img class="img-responsive" alt="Responsive image" src="' + exercise.get('imageUrl') +'">'
            + '</div>'
            + '<div class="panel-body">'
            + '<div class="switcher-content">'
            + '<p>'
            + '<b>Name:</b><b style="color: firebrick;" >' + exercise.get('name') + '</b>'
            + '</p>'

            + '<p>'
            + '<b>Description:</b>' + exercise.get('description')
            + '</p>'

            + '<p>'
            + '<b>Task:</b>' + exercise.get('task')
            + '</p>'

            + '<a href="adminExercise.html?id=' + exercise.id + '" class="show small">view</a>'
            + '<a href="javascript:void(0);" data-id="' + exercise.id +'" class="show small editButton">edit</a>'
            + '</div>'
            + '</div>'
            + '</section>'
            + '</div>';
        console.log(s);
        return s;
    }

    this.getExerciseById = function(id){
        for (var i in self.exercises){
            if (self.exercises[i].id == id){
                return self.exercises[i];
            }
        }
        return undefined;
    }

    this.prepareEditingBlock = function(){
        $('#editingBlock').removeClass('hide');
        var ex = self.editingExercise;
        $('#editName').val(ex.get('name'));
        $('#editImageUrl').val(ex.get('imageUrl'));
        $('#editDescription').val(ex.get('description'));
        $('#editTask').val(ex.get('task'));

    }

    this.initEditingBlock = function(){
        $('#editSaveButton').bind('click', function(){
            var name = $('#editName').val().trim();
            var imageUrl = $('#editImageUrl').val().trim();
            var description = $('#editDescription').val().trim();
            var task = $('#editTask').val().trim();

            if (name == undefined || name == ''){
                alert('name is empty');
                return;
            }
            if (imageUrl == undefined || imageUrl == ''){
                imageUrl = 'http://disk.englishpatient.org/uploads/Ob5IRQi2MNI5gOM.png';
            }

            var ex = self.editingExercise;
            if (ex == undefined){
                return;
            }
            ex.set('name', name);
            ex.set('description', description);
            ex.set('task', task);
            ex.set('imageUrl', imageUrl);
            ex.save().then(function(){
                disablePreloader();
                self.loadExercises(function(){self.drawExercises()});
            });
        });
    }

    this.initCreateNewExBlock = function(){
        $('#createNewExButton').bind('click', function(){
            var name = $('#newExName').val().trim();
            var imageUrl = $('#newExImageUrl').val().trim();
            var task = $('#newExTask').val().trim();
            var description = $('#newExDescription').val().trim();
            enablePreloader();
            if (name == undefined || name == ''){
                alert('name is empty');
                return;
            }
            if (imageUrl == undefined || imageUrl == ''){
                imageUrl = 'http://disk.englishpatient.org/uploads/Ob5IRQi2MNI5gOM.png';
            }
            var Exercise = Parse.Object.extend('Exercise');
            var ex = new Exercise();
            ex.set('name', name);
            ex.set('description', description);
            ex.set('task', task);
            ex.set('imageUrl', imageUrl);
            ex.save().then(function(){
                disablePreloader();
                self.loadExercises(function(){self.drawExercises()});
            });
        });
    }

    this.deleteEditingExercise = function(){
        var ex = self.editingExercise;
        if (ex == undefined){
            return;
        }
        ex.destroy({
            success: function(){
                window.location.href = window.location.href;
            }
        });
    }

    this.initDeleteButton = function(){
        $('#deleteButton').bind('click', function(){
            self.deleteEditingExercise();
        });
    }

}