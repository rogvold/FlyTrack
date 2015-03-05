/**
 * Created by sabir on 04.11.14.
 */

var QuizManager = function(){
    var self = this;
    this.exerciseId = undefined;
    this.currentUserManager = new CurrentUserManager();
    this.exercise = undefined;

    this.init = function(){
        initParse();
        self.currentUserManager.init(function(){
            self.loadCurrentExercise(function(){
                $('.exerciseName').html(self.exercise.get('name'));
                $('.exerciseTask').html(self.exercise.get('task'));

                self.loadCards(function(){
                    self.initCardsNumbers();
                });
            });
        });
    }

    this.loadCurrentExercise = function(callback){
        self.exerciseId = gup('id');
        if (self.exerciseId == undefined){
            window.location.href = 'index.html';
            return;
        }
        var q = new Parse.Query(Parse.Object.extend('Exercise'));
        enablePreloader();
        q.get(self.exerciseId,{
            success: function(ex){
                self.exercise = ex;
                disablePreloader();
                callback();
            }
        });
    }

    this.loadCards = function(callback){
        enablePreloader();
        var q = new Parse.Query(Parse.Object.extend('ExerciseCard'));
        q.ascending('number');
        q.equalTo('exerciseId', self.exerciseId);
        q.find(function(list){
            self.cards = list;
            disablePreloader();
            callback();
        });

    }


    this.initCardsNumbers = function(){
        var s = '';
        var list = self.cards;
        for (var i in list){
            s+='<li class="cardNumber" data-id="' + list[i].id + '" >' +
                '<a href="javascript: void(0);">' + (+i + 1) + '</a>' +
                '</li>';
        }
        $('#exercisesNumbersBlock').html(s);
        $('.cardNumber').bind('click', function(){
            $('.cardNumber').removeClass('active');
            $(this).addClass('active');
            var id = $(this).attr('data-id');
            self.selectedCard = self.getCardById(id);
            console.log('selectedCard = ');
            console.log(self.selectedCard);
            $('.mediaMaterial').hide();
            self.prepareSelectedCard();
        });
        $('#deleteButton').bind('click', function(){
            self.selectedCard.destroy({
                success: function(){
                    window.location.href = window.location.href;
                }
            });
        });
        $('.cardNumber:first').click();
    }


    this.prepareSelectedCard = function(){
        $('#deleteButton').addClass('hide');
        var s = '';
        $('#commentText').html(self.selectedCard.get('comment'));
        $('#transcriptText').html(self.selectedCard.get('transcript'));
        var materials = self.selectedCard.get('materials');
        materials = materials.map(function(m){return self.extractMaterial(m)});
        for (var i in materials){
            var m = materials[i];
            m.prepareHtml();
        }
        if (self.selectedCard.id == $('.cardNumber:last').attr('data-id')){
            $('#deleteButton').removeClass('hide');
        }
        $('#updateBlock').removeClass('hide');
        self.clearUpdateForm();
        self.prepareUpdatingBlockByMaterials(materials);
        $('#updateTranscript').val(self.selectedCard.get('transcript'));
        $('#updateComment').val(self.selectedCard.get('comment'));
        $('#updateTime').val(self.selectedCard.get('time'));
    }


    this.extractMaterial = function(data){
        if (data == undefined){
            return undefined;
        }
        if (data.materialType == 'video'){
            return (new VideoMaterial(data.vimeoId));
        }
        if (data.materialType == 'audio'){
            return (new AudioMaterial(data.audioUrl));
        }
        if (data.materialType == 'image'){
            return (new ImageMaterial(data.imageUrl));
        }
        if (data.materialType == 'text'){
            return (new TextMaterial(data.text));
        }
        return undefined;
    }


    this.getCardById = function(id){
        var list = self.cards;
        if (id == undefined){
            return undefined;
        }
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
        return undefined;
    }


}