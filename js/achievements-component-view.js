define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');

    var AchievementsComponentView = Backbone.View.extend({

        className: "achievements-component",

        initialize: function () {
            this.listenTo(Adapt, 'remove', this.remove);
            this.listenTo(Adapt, 'achievements:showComponentButton', this.onCompletion);
            this.listenToOnce(Adapt, "remove", this.removeInViewListeners);
            this.render();
        },

        events: {
          "click .view-certificate":"viewCertificate"
        },

        render: function () {
            var data = this.model.toJSON();
            var template = Handlebars.templates["achievementsComponent"];
            $(this.el).html(template(data)).appendTo('.' + this.model.get('_id') + " > .component-inner");
            this.onCompletion();

            _.defer(_.bind(function() {
                this.postRender();
            }, this));
        },

        postRender: function() {
            this.$('.achievements-inner').on('inview', _.bind(this.inview, this));
        },

        onCompletion: function() {
          // Show or hide button depending on status
          if(Adapt.achievements.isAvailable){
            if(this.model.get('_achievements')._button._isEnabled) {
              this.$('.achievements-inner').show();
            } else {
              this.$('.achievements-inner').hide();
            }
          }
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible && Adapt.achievements.isAvailable && this.model.get('_achievements')._showPrompt) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }
                // Check if visible on screen
                if (this._isVisibleTop && this._isVisibleBottom) {
                    Adapt.trigger('achievements:showAvailablePrompt');
                }
            }
        },

        viewCertificate: function(event) {
            if (event) event.preventDefault();
            Adapt.trigger('achievements:showAchievementsDrawer');
        },

        removeInViewListeners: function () {
            this.$('.achievements-inner').off('inview');
        }

    });

    return AchievementsComponentView;

});
