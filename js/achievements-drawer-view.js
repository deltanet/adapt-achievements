define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var CertificateDrawerView = Backbone.View.extend({

        className: "achievements-drawer",

        initialize: function() {

            this.listenTo(Adapt, 'remove', this.remove);
            this.render();
        },

        events: {
          "click .view-button":"viewCertificate"
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
            this.checkCompletion();
        },

        checkCompletion: function() {
            if(Adapt.achievements.isAvailable){
                this.$('.text-description').html(Adapt.course.get('_achievements')._drawer.certificateEnabled);
            } else {
                this.$('.text-description').html(Adapt.course.get('_achievements')._drawer.certificateDisabled);
                this.$('.view-button').hide();
            }
        },

        viewCertificate: function() {
          Adapt.trigger('achievements:showCertificate');
          Adapt.trigger('drawer:closeDrawer');
        },

        updateBody: function() {
          this.$('.achievements-drawer-body').html(Adapt.achievements.bodyText);
        }

    });

    return CertificateDrawerView;
})
