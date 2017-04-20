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
          "click .drawer-review-button":"reviewAssessment",
          "click .print-button":"printCertificate"
        },

        render: function() {
            var collectionData = this.collection.toJSON();
            var modelData = this.model.toJSON();
            var template = Handlebars.templates["achievementsDrawer"];
            this.$el.html(template({model: modelData, assessment:collectionData}));

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
                this.$('.text-description').html(Adapt.course.get('_achievements')._drawer.certificateEnabled);
            } else {
                this.$('.text-description').html(Adapt.course.get('_achievements')._drawer.certificateDisabled);
                this.$('.certificate-container').hide();
                this.$('.print-button').hide();
            }
        },

        updateBody: function() {
          this.$('.achievements-drawer-body').html(Adapt.achievements.bodyText);
        },

        populateCertificate: function() {
          this.$('.certificate-container').find('.certificate-title').html(Adapt.achievements.courseTitle);
          this.$('.certificate-container').find('.certificate-name').html(Adapt.achievements.userName);
          this.$('.certificate-container').find('.certificate-date').html(Adapt.achievements.datePassed);
        },

        reviewAssessment: function(event) {
            if (event) event.preventDefault();
            var id = $(event.currentTarget).data("id");
            Adapt.trigger('achievements:reviewAssessment', id);
        },

        printCertificate: function(event) {
            if (event) event.preventDefault();
            Adapt.trigger('achievements:printCertificate');
        }

    });

    return CertificateDrawerView;
})
