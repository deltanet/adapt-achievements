define([
    'coreJS/adapt',
    './achievements-navigation-view',
    './achievements-drawer-view',
    './achievements-component-view',
    './certificate-view'
], function(Adapt, AchievementsNavigationView, AchievementsDrawerView, AchievementsComponentView, CertificateView) {

  var Achievements = _.extend({

    initialize: function() {
        this.listenToOnce(Adapt, "app:dataReady", this.onDataReady);
    },

    onDataReady: function() {
      if (Adapt.course.get("_achievements") && Adapt.course.get("_achievements")._isEnabled) {
        this.achievementsEnabled = Adapt.course.get("_achievements")._isEnabled;
      } else {
        this.achievementsEnabled = false;
      }

      if (Adapt.course.get("_achievements")._certificate && Adapt.course.get("_achievements")._certificate._isEnabled) {
        this.certificateEnabled = Adapt.course.get("_achievements")._certificate._isEnabled;
      } else {
        this.certificateEnabled = false;
      }

      if (this.achievementsEnabled || this.certificateEnabled) {
        this.setupAchievements();
        this.setupEventListeners();
        this.addAchievementsDrawerItem();
      }
    },

    setupEventListeners: function() {
      this.listenTo(Adapt, "navigationView:postRender", this.addNavigation);
      this.listenTo(Adapt, "router:page router:menu", this.onPageMenuReady);
      this.listenTo(Adapt, "componentView:postRender", this.onComponentReady);
      this.listenTo(Adapt, "achievements:showAchievementsDrawer", this.setupDrawerAchievements);
      this.listenTo(Adapt, 'achievements:showCertificate', this.showCertificate);
      this.listenTo(Adapt, 'achievements:printCertificate', this.printCertificate);
      this.listenTo(Adapt, 'achievements:closeCertificate', this.closeCertificate);
      this.listenTo(Adapt, 'achievements:saveCompletion', this.saveCompletionDate);
      this.listenToOnce(Adapt, 'achievements:showAvailablePrompt', this.showAvailablePrompt);
      // Listen for course completion
      this.listenTo(Adapt.course, 'change:_isComplete', this.onContentCompletion);
      this.listenTo(Adapt.course, 'change:_isAssessmentPassed', this.onAssessmentCompletion);

      this.listenTo(Adapt, "accessibility:toggle", this.onAccessibilityChange);
      // Listen for language change
      this.listenTo(Adapt.config, 'change:_activeLanguage', this.onLangChange);
    },

    setupAchievements: function() {
      // Define achievements model
      Adapt.achievements = {};
      // Set total score
      Adapt.achievements.totalScore = 0;
      // Set var for text string to go in the drawer
      Adapt.achievements.bodyText = "";
      // Get question components
      Adapt.achievements.questionComponents;
      Adapt.achievements.isExternallyUpdated = false;
      // Set up collections
      Adapt.achievements.questionComponents = new Backbone.Collection(Adapt.components.where({_isQuestionType: true}));
      Adapt.achievements.articles = new Backbone.Collection(Adapt.articles.models);
      // Create and populate array of Articles with tracked questions
      Adapt.achievements.questionArticles = new Array();
      for (var i = 0; i < Adapt.achievements.articles.length; i++) {
        if(Adapt.achievements.articles.models[i].has("_achievements") && Adapt.achievements.articles.models[i].get("_achievements")._isEnabled) {
          Adapt.achievements.questionArticles.push(Adapt.achievements.articles.models[i]);
        }
      }
      this.listenTo(Adapt.achievements.questionComponents, 'change:_isCorrect', this.updateScore);
      // Set vars for achievements data
      Adapt.achievements.courseTitle = Adapt.course.get('displayTitle');
      Adapt.achievements.userName = Adapt.offlineStorage.get("student");
      Adapt.achievements.datePassed = "";
      Adapt.achievements.userFirstname = "";
      Adapt.achievements.userSurname = "";
      // Set current date
      this.setCurrentDate();
      // Check saved completion - based on completion date if one has been set
      if (Adapt.offlineStorage.get("achievementsDate") === "undefined" || Adapt.offlineStorage.get("achievementsDate") === undefined || Adapt.offlineStorage.get("achievementsDate") == "") {
        Adapt.achievements.datePassed = Adapt.achievements.currentDate;
        Adapt.achievements.isAvailable = false;
      } else {
        Adapt.achievements.datePassed = Adapt.offlineStorage.get("achievementsDate");
        Adapt.achievements.isAvailable = true;
      }

      var nameArray = [];

      // Split at comma
      if (Adapt.course.get('_achievements')._certificate._splitNameAt == "comma") {
        nameArray = Adapt.achievements.userName.split(',');
      }
      // Split at space
      if (Adapt.course.get('_achievements')._certificate._splitNameAt == "space") {
        nameArray = Adapt.achievements.userName.split(' ');
      }
      // Split at comma with a space after it
      if (Adapt.course.get('_achievements')._certificate._splitNameAt == "commaSpace") {
        nameArray = Adapt.achievements.userName.split(', ');
      }
      if (nameArray.length > 0) {
        Adapt.achievements.userFirstname = nameArray[1];
        Adapt.achievements.userSurname = nameArray[0];
      } else {
        Adapt.achievements.userFirstname = "name";
        Adapt.achievements.userSurname = "unknown";
      }

      if (Adapt.course.get('_achievements')._certificate._switchNames) {
        Adapt.achievements.userName = Adapt.achievements.userFirstname+" "+Adapt.achievements.userSurname;
      } else {
        Adapt.achievements.userName = Adapt.achievements.userSurname+" "+Adapt.achievements.userFirstname;
      }

      // Check for _track feature
      if (Adapt.course.get('_achievements')._track == "Assessments") {
        this.setUpAssessmentData();
      } else {
        // Legacy functionality
        this.updateScore();
      }
    },

    onAccessibilityChange: function() {
      if (Adapt.course.get('_achievements')._track == "Assessments") {
        this.updateAssessmentScore();
      } else {
        this.updateScore();
      }
    },

    setUpAssessmentData: function() {
      // Setup vars
      Adapt.achievements.numTotalQuestions = 0;
      Adapt.achievements.numAssessments = 0;
      // Set up arrays for scores
      Adapt.achievements.articleQuestions = new Array();
      Adapt.achievements.score = new Array();
      Adapt.achievements.numQuestions = new Array();
      Adapt.achievements.id = new Array();

      for (var i = 0; i < Adapt.achievements.questionArticles.length; i++) {

        Adapt.achievements.numQuestions[i] = Adapt.achievements.questionArticles[i].get("_achievements")._numQuestions;
        Adapt.achievements.id[i] = Adapt.achievements.questionArticles[i].get("_achievements")._id;

        Adapt.achievements.numTotalQuestions = Adapt.achievements.numTotalQuestions + Adapt.achievements.numQuestions[i];
        Adapt.achievements.articleQuestions[i] = new Backbone.Collection(Adapt.achievements.questionArticles[i].findDescendants("components").where({_isQuestionType: true}));

        this.listenTo(Adapt.achievements.articleQuestions[i], 'change:_isCorrect', this.updateAssessmentScore);

        if(Adapt.course.get('_achievements')._countDown) {
          Adapt.achievements.score[i] = Adapt.achievements.numQuestions[i];
        } else {
          Adapt.achievements.score[i] = 0;
        }

      }
      this.updateAssessmentScore();
    },

    updateDrawer: function(score, total) {
      var str = Adapt.course.get('_achievements')._drawer.achievementsBody;
      Adapt.achievements.bodyText = str.replace(/{{{score}}}/g, score);
      Adapt.achievements.bodyText = Adapt.achievements.bodyText.replace(/{{{maxScore}}}/g, total);
    },

    updateAssessment: function(id, total, score) {
      // Change score based on updated data
      for (var i = 0; i < Adapt.achievements.questionArticles.length; i++) {
        if(id == Adapt.achievements.id[i]) {
          Adapt.achievements.score[i] = score;
        }
      }
      this.updateCounter();
      this.updateDrawer(Adapt.achievements.totalScore, Adapt.achievements.numTotalQuestions);
    },

    updateCounter: function() {
      // Reset
      Adapt.achievements.totalScore = 0;
      // Count up all scores
      for (var i = 0; i < Adapt.achievements.questionArticles.length; i++) {
        Adapt.achievements.totalScore = Adapt.achievements.totalScore + Adapt.achievements.score[i];
      }
      Adapt.trigger('achievements:updateScore', Adapt.achievements.totalScore);
    },

    updateScore: function() {
      if (Adapt.course.get('_achievements')._track !== "Assessments") {

        var score = 0;
        var numQuestions = Adapt.achievements.questionComponents.length;

        if(Adapt.course.get('_achievements')._countDown) {
            score = Adapt.achievements.questionComponents.length;
        }
        // If countdown is enabled
        if(Adapt.course.get('_achievements')._countDown) {
            // If the counter is to countdown when a question is correct
            if(Adapt.course.get('_achievements')._trackQuestion == "correct" || Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
                if(Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
                    score = score - (Adapt.achievements.questionComponents.where({_isCorrect: true}).length + ((Adapt.achievements.questionComponents.where({_isAtLeastOneCorrectSelection: true}).length)/2));
                } else {
                    score = score - (Adapt.achievements.questionComponents.where({_isCorrect: true}).length);
                }
            } else {
                // If the counter is to countdown when a question is incorrect
                score = score - (Adapt.achievements.questionComponents.where({_isCorrect: false}).length);
            }
        } else {
            // If countdown is NOT enabled just total up the number of correct answers
            // If the counter is to countdown when a question is correct
            if(Adapt.course.get('_achievements')._trackQuestion == "correct" || Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
                if(Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
                    score = Adapt.achievements.questionComponents.where({_isCorrect: true}).length + ((Adapt.achievements.questionComponents.where({_isAtLeastOneCorrectSelection: true}).length)/2);
                } else {
                    score = Adapt.achievements.questionComponents.where({_isCorrect: true}).length;
                }
            } else {
                // If the counter is to countdown when a question is incorrect
                score = Adapt.achievements.questionComponents.where({_isCorrect: false}).length;
            }
        }
        Adapt.achievements.totalScore = score;

        Adapt.trigger('achievements:updateScore', score);
        this.updateDrawer(score, numQuestions);
      }
    },

    questionChanged: function (i) {
      if(Adapt.course.get('_achievements')._countDown) {
          Adapt.achievements.score[i] = Adapt.achievements.numQuestions[i];
      } else {
        Adapt.achievements.score[i] = 0;
      }
      // If countdown is enabled
      if(Adapt.course.get('_achievements')._countDown) {
          // If the counter is to countdown when a question is correct
          if(Adapt.course.get('_achievements')._trackQuestion == "correct" || Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
              if(Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
                  Adapt.achievements.score[i] = Adapt.achievements.score[i] - (Adapt.achievements.articleQuestions[i].where({_isCorrect: true}).length + ((Adapt.achievements.articleQuestions[i].where({_isAtLeastOneCorrectSelection: true}).length)/2));
              } else {
                  Adapt.achievements.score[i] = Adapt.achievements.score[i] - (Adapt.achievements.articleQuestions[i].where({_isCorrect: true}).length);
              }
          } else {
              // If the counter is to countdown when a question is incorrect
              Adapt.achievements.score[i] = Adapt.achievements.score[i] - (Adapt.achievements.articleQuestions[i].where({_isCorrect: false}).length);
          }
      } else {
          // If countdown is NOT enabled just total up the number of correct answers
          // If the counter is to countdown when a question is correct
          if(Adapt.course.get('_achievements')._trackQuestion == "correct" || Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
              if(Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
                  Adapt.achievements.score[i] = Adapt.achievements.articleQuestions[i].where({_isCorrect: true}).length + ((Adapt.achievements.articleQuestions[i].where({_isAtLeastOneCorrectSelection: true}).length)/2);
              } else {
                  Adapt.achievements.score[i] = Adapt.achievements.articleQuestions[i].where({_isCorrect: true}).length;
              }
          } else {
              // If the counter is to countdown when a question is incorrect
              Adapt.achievements.score[i] = Adapt.achievements.articleQuestions[i].where({_isCorrect: false}).length;
          }
      }
      this.updateAssessment(Adapt.achievements.id[i] , Adapt.achievements.numQuestions[i], Adapt.achievements.score[i]);
    },

    updateAssessmentScore: function() {
      for (var i = 0; i < Adapt.achievements.questionArticles.length; i++) {
        this.questionChanged(i);
      }
    },

    addNavigation: function(navigationView) {
      if ((this.achievementsEnabled || this.certificateEnabled) && Adapt.course.get('_achievements')._showOnNavbar) {
        var achievementsModel = Adapt.course.get('_achievements');
        var achievementsToggleModel = new Backbone.Model(achievementsModel);
        navigationView.$('.navigation-inner').append(new AchievementsNavigationView({
          model: achievementsToggleModel
        }).$el);
      }
    },

    onPageMenuReady: function(pageModel) {
      if (this.certificateEnabled) {
          new CertificateView({model:pageModel});
      }
    },

    addAchievementsDrawerItem: function() {
      if (this.achievementsEnabled || this.certificateEnabled) {
        var drawerAchievements = Adapt.course.get('_achievements');

        var drawerObject = {
            title: drawerAchievements.title,
            description: drawerAchievements.description,
            className: 'achievements-drawer'
        };
        Adapt.drawer.addItem(drawerObject, 'achievements:showAchievementsDrawer');
      }
    },

    setupDrawerAchievements: function() {
      var achievementsDrawerModel = Adapt.course.get('_achievements');
      var achievementsDrawerModel = new Backbone.Model(achievementsDrawerModel);

      Adapt.drawer.triggerCustomView(new AchievementsDrawerView({
        model: achievementsDrawerModel
      }).$el);
    },

    onComponentReady: function(view) {
      if (this.certificateEnabled && view.model && view.model.get("_achievements") && view.model.get("_achievements")._isEnabled) {
        try{
          // Only render view if it DOESN'T already exist - Work around for assessmentResults component
          if (!$('.' + view.model.get('_id')).find('.achievements-component').length) {
            new AchievementsComponentView({model:view.model});
          }
        } catch(e){
          console.log(e);
        }
      }
    },

    showCertificate: function() {
      Adapt.trigger('audio:pauseAudio', 0);
      $('.achievements-certificate').removeClass('display-none');
      $('.navigation').addClass('display-none');
      $('.drawer').addClass('display-none');
      $('#wrapper').css('visibility','hidden');
      $('#wrapper').addClass('noprint');
    },

    printCertificate: function() {
      this.showCertificate();
      window.print();
      this.closeCertificate();
    },

    closeCertificate: function() {
        $('.achievements-certificate').addClass('display-none');
        $('.navigation').removeClass('display-none');
        $('.drawer').removeClass('display-none');
        $('#wrapper').removeClass('noprint');
        $('#wrapper').css('visibility','visible');
    },

    setCurrentDate: function() {
      var today = new Date();
      var day = today.getUTCDate();
      var month = (today.getUTCMonth()) + 1;
      var year = today.getUTCFullYear();
      Adapt.achievements.currentDate = day+"/"+month+"/"+year;
    },

    onContentCompletion: function() {
      if(!Adapt.course.get('_achievements')._certificate._completionOnPassed) {
        Adapt.achievements.isAvailable = true;
        Adapt.trigger('achievements:showComponentButton');
        this.saveCompletionDate();
      }
    },

    onAssessmentCompletion: function() {
      // Review
      Adapt.trigger('achievements:showReview');
      // Certificate
      if(Adapt.course.get('_achievements')._certificate._completionOnPassed && Adapt.course.get('_isAssessmentPassed')) {
        Adapt.achievements.isAvailable = true;
        Adapt.trigger('achievements:showComponentButton');
        this.saveCompletionDate();
      }
    },

    saveCompletionDate: function() {
      // Only save completion if one hasn't been set already
      if((typeof Adapt.offlineStorage.get("achievementsDate") === "undefined") || (Adapt.offlineStorage.get("achievementsDate") == "")) {
        Adapt.achievements.datePassed = Adapt.achievements.currentDate;
        // Store date in suspend data
        Adapt.offlineStorage.set("achievementsDate", Adapt.achievements.datePassed);
      }
    },

    showAvailablePrompt: function() {
      var pushObject = {
        title: Adapt.course.get('_achievements')._completePrompt.title,
        body: Adapt.course.get('_achievements')._completePrompt.body,
        _timeout: Adapt.course.get('_achievements')._completePrompt._displayTime
      };
      Adapt.trigger('notify:push', pushObject);
    },

    onLangChange: function() {
      // Reset suspend data
      Adapt.offlineStorage.set("achievementsDate", "");
      // Reload
      this.listenToOnce(Adapt, "app:dataReady", this.checkNewConfig);
    },

    checkNewConfig: function() {
      if (Adapt.course.get("_achievements") && Adapt.course.get("_achievements")._isEnabled) {
        this.achievementsEnabled = true;
      } else {
        this.achievementsEnabled = false;
      }
      if (Adapt.course.get("_achievements")._certificate && Adapt.course.get("_achievements")._certificate._isEnabled) {
        this.certificateEnabled = true;
      } else {
        this.certificateEnabled = false;
      }

      if (this.achievementsEnabled || this.certificateEnabled) {
        this.setupAchievements();
        //this.setupEventListeners();
        //this.addAchievementsDrawerItem();
      }
    }

  }, Backbone.Events);

    Achievements.initialize();

    return Achievements;

})
