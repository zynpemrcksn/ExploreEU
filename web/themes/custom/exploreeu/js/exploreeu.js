(function (Drupal, once) {
  Drupal.behaviors.exploreEuPreviewToolbar = {
    attach(context) {
      once('exploreeu-preview-toolbar', '.node-preview-container', context)
        .forEach(function (previewToolbar) {
          const header = document.querySelector('.header');

          if (header) {
            header.insertAdjacentElement('afterend', previewToolbar);
          }
        });
    }
  };
})(Drupal, once);
