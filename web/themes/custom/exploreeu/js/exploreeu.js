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

/* ==================================================
   EXPERIENCES CITY FILTER - CUSTOM DROPDOWN
================================================== */

(function (Drupal) {
  Drupal.behaviors.experiencesCityDropdown = {
    attach: function (context) {

      const selects = context.querySelectorAll
        ? context.querySelectorAll(
            '.experiences-page .view-filters select[name="field_city_target_id"], ' +
            '.experiences-filter-sidebar select[name="field_city_target_id"]'
          )
        : [];

      selects.forEach(function (select) {

        // Aynı select için dropdown'u ikinci kez oluşturma.
        if (select.dataset.customDropdownReady === 'true') {
          return;
        }

        select.dataset.customDropdownReady = 'true';

        // Ana wrapper.
        const wrapper = document.createElement('div');
        wrapper.className = 'experience-city-dropdown';

        // Açma / kapama butonu.
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'experience-city-dropdown__button';
        button.setAttribute('aria-expanded', 'false');

        const selectedOption =
          select.options[select.selectedIndex];

        const buttonText = document.createElement('span');
        buttonText.className = 'experience-city-dropdown__selected';
        buttonText.textContent = selectedOption
          ? selectedOption.textContent
          : 'All Cities';

        const arrow = document.createElement('span');
        arrow.className = 'experience-city-dropdown__arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '▾';

        button.appendChild(buttonText);
        button.appendChild(arrow);

        // Açılır liste.
        const list = document.createElement('div');
        list.className = 'experience-city-dropdown__menu';
        list.hidden = true;

        Array.from(select.options).forEach(function (option) {

          const item = document.createElement('div');

          item.className = 'experience-city-dropdown__option';
          item.setAttribute('role', 'option');
          item.setAttribute('tabindex', '0');
          item.dataset.value = option.value;

          // "- Any -" yerine daha temiz bir ifade.
          item.textContent =
            option.value === 'All'
              ? 'All Cities'
              : option.textContent;

          if (option.selected) {
            item.classList.add('is-selected');
          }

          item.addEventListener('click', function () {

            select.value = option.value;

            // Drupal / Views değişikliği algılayabilsin.
            select.dispatchEvent(
              new Event('change', {
                bubbles: true
              })
            );

            buttonText.textContent =
              option.value === 'All'
                ? 'All Cities'
                : option.textContent;

            list.querySelectorAll(
              '.experience-city-dropdown__option'
            ).forEach(function (otherItem) {
              otherItem.classList.remove('is-selected');
            });

            item.classList.add('is-selected');

            list.hidden = true;
            wrapper.classList.remove('is-open');
            button.setAttribute('aria-expanded', 'false');
          });

          list.appendChild(item);
        });

        button.addEventListener('click', function () {

          const isOpen = wrapper.classList.toggle('is-open');

          list.hidden = !isOpen;

          button.setAttribute(
            'aria-expanded',
            isOpen ? 'true' : 'false'
          );
        });

        // Native select'i wrapper içine al.
        select.parentNode.insertBefore(wrapper, select);

        wrapper.appendChild(button);
        wrapper.appendChild(list);
        wrapper.appendChild(select);

        select.classList.add(
          'experience-city-dropdown__native'
        );
      });

      // Dropdown dışında tıklanınca kapat.
      if (!document.body.dataset.experienceDropdownListener) {

        document.body.dataset.experienceDropdownListener = 'true';

        document.addEventListener('click', function (event) {

          document.querySelectorAll(
            '.experience-city-dropdown.is-open'
          ).forEach(function (dropdown) {

            if (!dropdown.contains(event.target)) {

              dropdown.classList.remove('is-open');

              const menu = dropdown.querySelector(
                '.experience-city-dropdown__menu'
              );

              const button = dropdown.querySelector(
                '.experience-city-dropdown__button'
              );

              if (menu) {
                menu.hidden = true;
              }

              if (button) {
                button.setAttribute(
                  'aria-expanded',
                  'false'
                );
              }
            }
          });
        });

        document.addEventListener('keydown', function (event) {

          if (event.key !== 'Escape') {
            return;
          }

          document.querySelectorAll(
            '.experience-city-dropdown.is-open'
          ).forEach(function (dropdown) {

            dropdown.classList.remove('is-open');

            const menu = dropdown.querySelector(
              '.experience-city-dropdown__menu'
            );

            const button = dropdown.querySelector(
              '.experience-city-dropdown__button'
            );

            if (menu) {
              menu.hidden = true;
            }

            if (button) {
              button.setAttribute(
                'aria-expanded',
                'false'
              );
            }
          });
        });
      }
    }
  };
})(Drupal);
