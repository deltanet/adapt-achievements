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
          "click .print-button":"printCertificate"
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
            this.populateCertificate();
            this.updateBody();
            this.checkCompletion();
        },

        checkCompletion: function() {
            if(Adapt.achievements.isAvailable){
                this.$('.text-description').html(Adapt.course.get('_achievements')._drawer.certificateEnabled).a11y_text();
            } else {
                this.$('.text-description').html(Adapt.course.get('_achievements')._drawer.certificateDisabled).a11y_text();
                this.$('.certificate-container').hide();
                this.$('.print-button').hide();
                // Hide review
                this.$('.achievements-item-container').hide();
            }
        },

        updateBody: function() {
          this.$('.achievements-drawer-body').html(Adapt.achievements.bodyText).a11y_text();
        },

        populateCertificate: function() {
          this.$('.certificate-container').find('.certificate-title').html(Adapt.achievements.courseTitle);
          this.$('.certificate-container').find('.certificate-name').html(Adapt.achievements.userName);
          this.$('.certificate-container').find('.certificate-date').html(Adapt.achievements.datePassed);
        },

        printCertificate: function(event) {
            if (event) event.preventDefault();
            Adapt.trigger('achievements:printCertificate');
        }

    });

    return CertificateDrawerView;
})
