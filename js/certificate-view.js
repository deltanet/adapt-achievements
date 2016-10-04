define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');

    var CertificateView = Backbone.View.extend({

        className: 'certificate',

        initialize: function() {
            this.listenTo(Adapt, 'remove', this.remove);
            this.render();
        },

        events: {
            "click .print-button":"printCertificate",
            "click .close-button":"closeCertificate"
        },

        render: function() {
            var data = this.model.toJSON();
            var template = Handlebars.templates["certificateView"];
            this.$el.html(template(data)).prependTo('body');

            $('.certificate').addClass('display-none');

            this.insertImage();

            return this;
        },

        insertImage: function() {
          this.$('.certificate-header img').attr('src', Adapt.course.get('_achievements')._certificate._header);
          this.$('.certificate-body img').attr('src', Adapt.course.get('_achievements')._certificate._body);
          this.$('.certificate-footer img').attr('src', Adapt.course.get('_achievements')._certificate._footer);

          this.$('.certificate-footer').imageready(_.bind(function() {
              this.populateCertificate();
          }, this));
        },

        populateCertificate: function() {
          $('.certificate').find('.certificate-title').html(Adapt.achievements.courseTitle);
          $('.certificate').find('.certificate-name').html(Adapt.achievements.userName);
          $('.certificate').find('.certificate-date').html(Adapt.achievements.datePassed);
        },

        printCertificate: function(event) {
            if (event) event.preventDefault();
            Adapt.trigger('achievements:printCertificate');
        },

        closeCertificate: function(event) {
            if (event) event.preventDefault();
            Adapt.trigger('achievements:closeCertificate');
        }

    });

    return CertificateView;

});
