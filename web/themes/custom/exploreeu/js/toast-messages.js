(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.exploreeuToastMessages = {
    attach(context) {
      once(
        'exploreeu-toast',
        '[data-drupal-messages] .message',
        context
      ).forEach(function (message) {

        // Keep the toast visible for 6 seconds.
        setTimeout(function () {
          message.classList.add('toast-hide');

          // Remove it after the fade animation.
          setTimeout(function () {
            message.remove();
          }, 400);

        }, 6000);

      });
    }
  };

})(Drupal, once);
