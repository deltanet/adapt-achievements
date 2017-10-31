define([
    'coreJS/adapt',
    './achievements-drawer-view',
    './achievements-view'
], function(Adapt, AchievementsDrawerView, AchievementsView) {

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

      if (this.achievementsEnabled) {
        this.setupAchievements();
        this.setupEventListeners();
        this.addAchievementsDrawerItem();
      }
    },

    setupEventListeners: function() {
      this.listenTo(Adapt, "router:page router:menu", this.onPageMenuReady);
      this.listenTo(Adapt, "achievements:showAchievementsDrawer", this.setupDrawerAchievements);
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
      this.setupNavigationEvent();
    },

    setupNavigationEvent: function() {
        Adapt.on('navigationView:postRender', function(navigationView) {
            navigationView.$('.navigation-inner').append(new AchievementsView({
                collection: Adapt.achievements.questionComponents
            }).$el);
        });
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
    }

  }, Backbone.Events);

    Achievements.initialize();

    return Achievements;

})
