define([
    'coreJS/adapt',
    './achievements-drawer-view',
    './achievements-component-view',
    './certificate-view',
    './achievements-view'
], function(Adapt, AchievementsDrawerView, AchievementsComponentView, CertificateView, AchievementsView) {

  var Achievements = _.extend({

    initialize: function() {
        this.listenToOnce(Adapt, "app:dataReady", this.onDataReady);
    },

    onDataReady: function() {
      if (Adapt.course.get("_achievements") && Adapt.course.get("_achievements")._isEnabled) {
        this.achievementsEnabled = Adapt.course.get("_achievements")._isEnabled;
        this.setupAchievements();
        this.setupEventListeners();
        this.addAchievementsDrawerItem();
      }
    },

    setupEventListeners: function() {
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
    },

    setupAchievements: function() {
      // Check if certificate is enabled
      if (Adapt.course.get("_achievements")._certificate && Adapt.course.get("_achievements")._certificate._isEnabled) {
        this.certificateEnabled = Adapt.course.get("_achievements")._certificate._isEnabled;
      } else {
        this.certificateEnabled = false;
      }
      // Define achievements model
      Adapt.achievements = {};
      // Set var for text string to go in the drawer
      Adapt.achievements.bodyText = "";
      // Get question components
      Adapt.achievements.questionComponents;
      Adapt.achievements.isExternallyUpdated = false;
      Adapt.achievements.questionComponents = new Backbone.Collection(Adapt.components.where({_isQuestionType: true}));
      // Set vars for achievements data
      Adapt.achievements.courseTitle = Adapt.course.get('displayTitle');
      Adapt.achievements.userName = Adapt.offlineStorage.get("student");
      Adapt.achievements.datePassed = "";
      Adapt.achievements.userFirstname = "";
      Adapt.achievements.userSurname = "";
      Adapt.achievements.view = "";
      // Set current date
      this.setCurrentDate();
      // Check saved completion - based on completion date if one has been set
      if(!(typeof Adapt.offlineStorage.get("achievementsDate") === "undefined") || (Adapt.offlineStorage.get("achievementsDate") == "")) {
        Adapt.achievements.datePassed = Adapt.offlineStorage.get("achievementsDate");
        Adapt.achievements.isAvailable = true;
      } else {
        Adapt.achievements.datePassed = Adapt.achievements.currentDate;
        Adapt.achievements.isAvailable = false;
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

      this.setupNavigationEvent();

    },

    setupNavigationEvent: function() {
        Adapt.on('navigationView:postRender', function(navigationView) {
            navigationView.$('.navigation-inner').append(new AchievementsView({
                collection: Adapt.achievements.questionComponents
            }).$el);
        });
    },

    onPageMenuReady: function(pageModel) {
      if (this.achievementsEnabled) {
          new CertificateView({model:pageModel});
      }
      // Set type for achievements close button to reference
      Adapt.achievements.view = pageModel.get("_type");
    },

    addAchievementsDrawerItem: function() {
      var drawerAchievements = Adapt.course.get('_achievements');

      var drawerObject = {
          title: drawerAchievements.title,
          description: drawerAchievements.description,
          className: 'achievements-drawer'
      };
      Adapt.drawer.addItem(drawerObject, 'achievements:showAchievementsDrawer');
    },

    setupDrawerAchievements: function() {
      var achievementsDrawerModel = Adapt.course.get('_achievements');
      var achievementsDrawerModel = new Backbone.Model(achievementsDrawerModel);

      Adapt.drawer.triggerCustomView(new AchievementsDrawerView({
        model: achievementsDrawerModel
      }).$el);
    },

    onComponentReady: function(view) {
      if (this.achievementsEnabled && this.certificateEnabled && view.model && view.model.get("_achievements") && view.model.get("_achievements")._isEnabled) {
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
      $('.certificate').removeClass('display-none');
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
        $('.certificate').addClass('display-none');
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
    }

  }, Backbone.Events);

    Achievements.initialize();

    return Achievements;

})
