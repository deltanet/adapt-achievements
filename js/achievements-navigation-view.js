define([
    'coreJS/adapt'
], function(Adapt) {

    var NavigationView = Backbone.View.extend({

        className: 'achievements',

        initialize: function() {
          this.listenTo(Adapt, 'remove', this.remove);
          this.listenTo(Adapt, "device:resize", this.updateNavButton);
          this.listenTo(Adapt, "device:changed", this.updateNavButton);
          this.listenTo(Adapt, 'achievements:updateScore', this.scoreHasUpdated);
          this.render();
        },

        events: {
            "click .achievements-button": "openDrawer"
        },

        render: function() {

          var data = this.model.toJSON();
          var template = Handlebars.templates['achievementsToggle'];
          this.$el.html(template(data));

          this.scoreHasUpdated(Adapt.achievements.totalScore);

          this.updateNavButton();
        },

        scoreHasUpdated: function(score) {
          this.$('.achievements-count').html(score).a11y_text();
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

        openDrawer: function(event) {
          if (event) event.preventDefault();
            Adapt.trigger('achievements:showAchievementsDrawer');
        }

      });

      return NavigationView;
  })
