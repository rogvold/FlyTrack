/**
 * Created by sabir on 05.11.14.
 */

var AdminQuizManager = function(){
    var self = this;
    this.cards = [];
    this.selectedCard = undefined;
    this.exerciseId = undefined;
    this.exercise = undefined;


    this.init = function(){
        initParse();
        self.initCreationBlock();
        self.initUpdateBlock();
        self.loadCurrentExercise(function(){
            $('.exerciseName').html(self.exercise.get('name'));
            self.loadCards(function(){
                self.initCardsNumbers();
            });
        });
    }

    this.loadCurrentExercise = function(callback){
        self.exerciseId = gup('id');
        if (self.exerciseId == undefined){
            window.location.href = 'adminExercises.html';
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

    this.prepareUpdatingBlockByMaterials = function(materials){
        for (var i in materials){
            var m = materials[i];
            if (m.materialType == 'audio'){
                $('#updateAudioUrl').val(m.audioUrl);
            }
            if (m.materialType == 'text'){
                $('#updateBigText').val(m.text);
            }
            if (m.materialType == 'video'){
                $('#updateVimeoId').val(m.vimeoId);
            }
            if (m.materialType == 'image'){
                $('#updateImageUrl').val(m.imageUrl);
            }
        }
    }

    this.initCreationBlock = function(){
        $('#createButton').bind('click', function(){
            var materials = self.getMaterialsByCreationForm();
            if (materials.length == 0){
                alert('no material is specified');
                return;
            }
            var comment = $('#comment').val().trim();
            var transcript = $('#transcript').val().trim();
            var time = $('#time').val().trim();
            var Card = Parse.Object.extend('ExerciseCard');
            var card = new Card();
            card.set('exerciseId', self.exerciseId);
            card.set('number', self.cards.length);
            card.set('materials', materials);
            card.set('comment', comment);
            card.set('transcript', transcript);
            enablePreloader();
            card.save().then(function(){
                self.loadCards(function(){self.initCardsNumbers();});
                self.clearCreationForm();
                disablePreloader();
            });
        });
    }

    this.clearCreationForm = function(){
        $('#comment').val('');
        $('#transcript').val('');
        $('#vimeoId').val('');
        $('#imageUrl').val('');
        $('#audioUrl').val('');
        $('#bigText').val('');
    }

    this.clearUpdateForm = function(){
        $('#updateComment').val('');
        $('#updateTranscript').val('');
        $('#updateVimeoId').val('');
        $('#updateImageUrl').val('');
        $('#updateAudioUrl').val('');
        $('#updateBigText').val('');
    }

    this.initUpdateBlock = function(){
        $('#updateButton').bind('click', function(){
            var materials = self.getMaterialsByUpdateForm();
            if (materials.length == 0){
                alert('no material is specified');
                return;
            }
            var comment = $('#comment').val().trim();
            var transcript = $('#transcript').val().trim();
            var time = $('#time').val().trim();
            var card = self.selectedCard;
            card.set('exerciseId', self.exerciseId);
            card.set('materials', materials);
            card.set('comment', comment);
            card.set('transcript', transcript);
            enablePreloader();
            card.save().then(function(){
                self.loadCards(function(){self.initCardsNumbers();});
                disablePreloader();
            });
        });
    }

    this.getMaterialsByCreationForm = function(){
        var materials = [];
        var vimeoId = $('#vimeoId').val().trim();
        if (vimeoId != undefined && vimeoId != ''){
            materials.push({
                materialType: 'video',
                vimeoId: vimeoId
            });
        }
        var imageUrl = $('#imageUrl').val().trim();
        if (imageUrl != undefined && imageUrl != ''){
            materials.push({
                materialType: 'image',
                imageUrl: imageUrl
            });
        }
        var text = $('#bigText').val().trim();
        if (text != undefined && text != ''){
            materials.push({
                materialType: 'text',
                text: text
            });
        }
        var audioUrl = $('#audioUrl').val().trim();
        if (audioUrl != undefined && audioUrl != ''){
            materials.push({
                materialType: 'audio',
                audioUrl: audioUrl
            });
        }
        console.log('materials = ');
        console.log(materials);
        return materials;
    }

    this.getMaterialsByUpdateForm = function(){
        var materials = [];
        var vimeoId = $('#updateVimeoId').val().trim();
        if (vimeoId != undefined && vimeoId != ''){
            materials.push({
                materialType: 'video',
                vimeoId: vimeoId
            });
        }
        var imageUrl = $('#updateImageUrl').val().trim();
        if (imageUrl != undefined && imageUrl != ''){
            materials.push({
                materialType: 'image',
                imageUrl: imageUrl
            });
        }
        var text = $('#updateBigText').val().trim();
        if (text != undefined && text != ''){
            materials.push({
                materialType: 'text',
                text: text
            });
        }
        var audioUrl = $('#updateAudioUrl').val().trim();
        if (audioUrl != undefined && audioUrl != ''){
            materials.push({
                materialType: 'audio',
                audioUrl: audioUrl
            });
        }
        console.log('materials = ');
        console.log(materials);
        return materials;
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