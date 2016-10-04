define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');

    var AchievementsView = Backbone.View.extend({

        className: 'achievements',

        initialize: function(options) {
            this.isExternallyUpdated = options.isExternallyUpdated;
            if (this.isExternallyUpdated) {
                this.listenTo(Adapt, 'achievements:set', this.render);
            } else {
                this.listenTo(Adapt.achievements.questionComponents, 'change:_isCorrect', this.render);
            }
            this.render();
        },

        events: {
            "click .achievements-button": "openDrawer"
        },

        render: function(setScore) {
            // Set vars for use with the body text
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

            // Add to view if enabled
            if(Adapt.course.get('_achievements')._showOnNavbar) {
              var data = Adapt.achievements.questionComponents.toJSON();
              var template = Handlebars.templates['achievementsToggle'];
              this.$el.html(template({
                  score: score,
                  achievements:data
              }));
              // Add icon to button
              this.$('.achievements-button').addClass(Adapt.course.get('_achievements')._icon);
            }

            var str = Adapt.course.get('_achievements')._drawer.achievementsBody;
            Adapt.achievements.bodyText = str.replace(/{{{score}}}/g, score);
            Adapt.achievements.bodyText = Adapt.achievements.bodyText.replace(/{{{maxScore}}}/g, numQuestions);

        },

        openDrawer: function() {
          if (event) event.preventDefault();
            Adapt.trigger('achievements:showAchievementsDrawer');
        }

    });

    return AchievementsView;

});
