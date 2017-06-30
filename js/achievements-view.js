define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');

    var AchievementsView = Backbone.View.extend({

        className: 'achievements',

        initialize: function(options) {
          this.listenTo(Adapt, 'remove', this.remove);
          this.listenTo(Adapt, "device:resize", this.updateNavButton);
          this.listenTo(Adapt, "device:changed", this.updateNavButton);
          this.listenTo(Adapt.achievements.questionComponents, 'change:_isCorrect', this.updateScore);
          this.render();
        },

        events: {
            "click .achievements-button": "openDrawer"
        },

        render: function() {

          var data = Adapt.achievements.questionComponents.toJSON();
          var template = Handlebars.templates['achievementsToggle'];
          this.$el.html(template(data));

          // Add icon to button
          this.$('.achievements-button').addClass(Adapt.course.get('_achievements')._icon);

          // Check for _track feature
          if (Adapt.course.get('_achievements')._track == "Assessments") {
            this.setUpAssessmentData();
          } else {
            // Legacy functionality
            this.updateScore();
          }

          this.updateNavButton();
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

        showCounter: function(totalScore) {
          this.$('.achievements-count').html(totalScore);
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
          this.showCounter(Adapt.achievements.totalScore);
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
            this.showCounter(score);
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

        updateNavButton: function() {
          if(Adapt.course.get('_achievements')._showOnNavbar && Adapt.device.screenSize !== 'small') {
            this.$('.achievements-toggle').removeClass('hidden');
          } else {
            this.$('.achievements-toggle').addClass('hidden');
          }
          // Hide score if just the certificate is enabled
          if(Adapt.course.get('_achievements')._isEnabled == false) {
            this.$('.achievements-count').hide();
          }
        },

        openDrawer: function() {
          if (event) event.preventDefault();
            Adapt.trigger('achievements:showAchievementsDrawer');
        },

        remove: function() {
          this.stopListening(Adapt, "device:resize", this.updateNavButton);
          this.stopListening(Adapt, "device:changed", this.updateNavButton);
        }

    });

    return AchievementsView;

});
