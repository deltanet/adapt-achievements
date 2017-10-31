define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var AchievementsDrawerView = Backbone.View.extend({

        className: "achievements-drawer",

        initialize: function() {

            this.listenTo(Adapt, 'remove', this.remove);
            this.render();
        },

        render: function() {
            var modelData = this.model.toJSON();
            var template = Handlebars.templates["achievementsDrawer"];
            this.$el.html(template({model: modelData}));

            _.defer(_.bind(this.postRender, this));
            return this;
        },

        postRender: function() {
            this.listenTo(Adapt, 'drawer:triggerCustomView', this.remove);
            this.updateBody();
        },

        updateBody: function() {
          this.$('.achievements-drawer-body').html(Adapt.achievements.bodyText).a11y_text();
        }

    });

    return AchievementsDrawerView;
})
