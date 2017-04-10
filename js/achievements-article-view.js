define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');

    var AchievementsArticleView = Backbone.View.extend({

        initialize: function () {
            this.listenTo(Adapt, 'remove', this.remove);
            this.render();
        },

        render: function () {
          this.questionComponents = new Backbone.Collection(this.model.findDescendants("components").where({_isQuestionType: true}));
          this.listenTo(this.questionComponents, 'change:_isCorrect', this.questionChanged);
        },

        questionChanged: function () {
          this.score = 0;
          this.numQuestions = this.model.get("_achievements")._numQuestions;

          if(Adapt.course.get('_achievements')._countDown) {
              this.score = this.questionComponents.length;
          }

          // If countdown is enabled
          if(Adapt.course.get('_achievements')._countDown) {
              // If the counter is to countdown when a question is correct
              if(Adapt.course.get('_achievements')._trackQuestion == "correct" || Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
                  if(Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
                      this.score = this.score - (this.questionComponents.where({_isCorrect: true}).length + ((this.questionComponents.where({_isAtLeastOneCorrectSelection: true}).length)/2));
                  } else {
                      this.score = this.score - (this.questionComponents.where({_isCorrect: true}).length);
                  }
              } else {
                  // If the counter is to countdown when a question is incorrect
                  this.score = this.score - (this.questionComponents.where({_isCorrect: false}).length);
              }
          } else {
              // If countdown is NOT enabled just total up the number of correct answers

              // If the counter is to countdown when a question is correct
              if(Adapt.course.get('_achievements')._trackQuestion == "correct" || Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
                  if(Adapt.course.get('_achievements')._trackQuestion == "partlyCorrect") {
                      this.score = this.questionComponents.where({_isCorrect: true}).length + ((this.questionComponents.where({_isAtLeastOneCorrectSelection: true}).length)/2);
                  } else {
                      this.score = this.questionComponents.where({_isCorrect: true}).length;
                  }
              } else {
                  // If the counter is to countdown when a question is incorrect
                  this.score = this.questionComponents.where({_isCorrect: false}).length;
              }
          }

          Adapt.trigger('achievements:updateAssessment', this.model.get("_achievements")._id, this.numQuestions, this.score);
        }

    });

    return AchievementsArticleView;

});
