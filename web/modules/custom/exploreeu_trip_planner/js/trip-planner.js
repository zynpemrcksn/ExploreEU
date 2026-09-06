(function (Drupal, once) {

  Drupal.behaviors.exploreeuTripPlanner = {
    attach(context) {

      once('exploreeu-trip-planner', '.trip-planner', context).forEach((planner) => {

        /* =====================================================
           ELEMENTS
           ===================================================== */

        const continueButton =
          planner.querySelector('#trip-planner-continue');

        const backButton =
          planner.querySelector('#trip-planner-back');

        const transportButton =
          planner.querySelector('#trip-planner-transport');

        const transportBackButton =
          planner.querySelector('#trip-transport-back');
   
        const stayButton =
          planner.querySelector('#trip-planner-stay');

        const stayBackButton =
          planner.querySelector('#trip-stay-back');

        const stayContinueButton =
          planner.querySelector('#trip-stay-continue');

        const summaryPanel =
          planner.querySelector('#trip-summary-panel');

        const summaryContainer =
          planner.querySelector('#trip-summary');

        const summaryBackButton =
          planner.querySelector('#trip-summary-back');

        const summaryCalendarButton =
          planner.querySelector('#trip-summary-calendar');

        const stayDestinationsContainer =
          planner.querySelector('#trip-stay-destinations');   
 
        const panels =
          planner.querySelectorAll('.trip-planner__panel');

        const steps =
          planner.querySelectorAll('.trip-planner__step');

        /* MULTI ROUTE */
  
        const tripRoutesContainer = document.getElementById('trip-routes');
        const addRouteButton = document.getElementById('trip-add-route');

        const tripTypeInputs = document.querySelectorAll(
          'input[name="trip-type"]'
        );

        /* DEVELOPMENT MODE */

        const devTools = document.getElementById('trip-dev-tools');
        const devSkipTransportButton = document.getElementById(
          'trip-dev-skip-transport'
        );

        const DEV_MODE = true;

        if (DEV_MODE && devTools) {
          devTools.hidden = false;
        }

        /* TRIP STATE */

        let tripType = 'one-way';

        let tripLegs = [];

        let staySelections = [];

        const stayResultsCache =
          new Map();

        /* STEP 1 FORM */

        const origin =
          planner.querySelector('#trip-origin');

        const destination =
          planner.querySelector('#trip-destination');

        const startDate =
          planner.querySelector('#trip-start-date');

        const endDate =
          planner.querySelector('#trip-end-date');

        const travellers =
          planner.querySelector('#trip-travellers');


        /* WEATHER */

        const weatherDestination =
          planner.querySelector('#weather-destination');

        const weatherDates =
          planner.querySelector('#weather-dates');

        const weatherDuration =
          planner.querySelector('#weather-duration');

        const weatherPlaceholder =
          planner.querySelector(
            '.trip-planner__weather-placeholder'
          );


        /* TRIP OVERVIEW */

        const tripOverview =
          planner.querySelector('#trip-overview');

        const overviewDestination =
          planner.querySelector('#overview-destination');

        const overviewDates =
          planner.querySelector('#overview-dates');

        const overviewTravellers =
          planner.querySelector('#overview-travellers');

        const overviewTransport =
          planner.querySelector('#overview-transport');

        const overviewWeather =
          planner.querySelector('#overview-weather');

        const overviewStay =
          planner.querySelector('#overview-stay');


        /* TRANSPORT */

        const transportOrigin =
          planner.querySelector('#transport-origin');

        const transportDestination =
          planner.querySelector('#transport-destination');

        const transportOptions =
          planner.querySelectorAll('.trip-planner__transport-option');

        const selectedTransport =
          planner.querySelector('#trip-selected-transport');

        const transportLegsContainer =
          document.getElementById('trip-transport-legs');

        if (!continueButton) {
          return;
        }


        /* =====================================================
           WEATHER ICONS
           ===================================================== */

        function getWeatherInfo(code) {

          const icons = {

            sun: `
              <svg viewBox="0 0 64 64" aria-hidden="true">

                <circle
                  cx="32"
                  cy="32"
                  r="11"
                  fill="#f4b942">
                </circle>

                <g
                  stroke="#f4b942"
                  stroke-width="4"
                  stroke-linecap="round">

                  <line x1="32" y1="6" x2="32" y2="14"></line>
                  <line x1="32" y1="50" x2="32" y2="58"></line>

                  <line x1="6" y1="32" x2="14" y2="32"></line>
                  <line x1="50" y1="32" x2="58" y2="32"></line>

                  <line x1="13" y1="13" x2="19" y2="19"></line>
                  <line x1="45" y1="45" x2="51" y2="51"></line>

                  <line x1="45" y1="19" x2="51" y2="13"></line>
                  <line x1="13" y1="51" x2="19" y2="45"></line>

                </g>

              </svg>
            `,


            cloud: `
              <svg viewBox="0 0 64 64" aria-hidden="true">

                <path
                  d="
                    M18 47h29
                    c7 0 12-5 12-11
                    s-5-11-12-11
                    h-2
                    C43 17 37 13 30 13
                    c-9 0-16 7-17 16
                    C7 30 4 34 4 39
                    c0 5 5 8 14 8z
                  "
                  fill="#aebdc2">
                </path>

              </svg>
            `,


            partlyCloudy: `
              <svg viewBox="0 0 64 64" aria-hidden="true">

                <circle
                  cx="22"
                  cy="21"
                  r="10"
                  fill="#f4b942">
                </circle>

                <g
                  stroke="#f4b942"
                  stroke-width="3"
                  stroke-linecap="round">

                  <line x1="22" y1="5" x2="22" y2="9"></line>
                  <line x1="7" y1="21" x2="11" y2="21"></line>
                  <line x1="33" y1="10" x2="30" y2="13"></line>

                </g>

                <path
                  d="
                    M18 49h29
                    c7 0 12-5 12-11
                    s-5-11-12-11
                    h-2
                    C43 20 37 17 31 17
                    c-9 0-15 7-16 15
                    C8 33 5 37 5 41
                    c0 5 5 8 13 8z
                  "
                  fill="#b9c7cb">
                </path>

              </svg>
            `,


            rain: `
              <svg viewBox="0 0 64 64" aria-hidden="true">

                <path
                  d="
                    M16 38h32
                    c6 0 10-4 10-10
                    s-4-10-10-10
                    h-3
                    C42 11 37 8 30 8
                    c-8 0-14 6-15 14
                    C8 23 5 27 5 32
                    c0 4 4 6 11 6z
                  "
                  fill="#9eafb5">
                </path>

                <g
                  stroke="#3b94d9"
                  stroke-width="4"
                  stroke-linecap="round">

                  <line x1="20" y1="45" x2="17" y2="53"></line>
                  <line x1="33" y1="45" x2="30" y2="53"></line>
                  <line x1="46" y1="45" x2="43" y2="53"></line>

                </g>

              </svg>
            `,


            drizzle: `
              <svg viewBox="0 0 64 64" aria-hidden="true">

                <path
                  d="
                    M16 38h32
                    c6 0 10-4 10-10
                    s-4-10-10-10
                    h-3
                    C42 11 37 8 30 8
                    c-8 0-14 6-15 14
                    C8 23 5 27 5 32
                    c0 4 4 6 11 6z
                  "
                  fill="#aebdc2">
                </path>

                <g fill="#5aa9df">

                  <circle cx="20" cy="49" r="2"></circle>
                  <circle cx="32" cy="53" r="2"></circle>
                  <circle cx="44" cy="49" r="2"></circle>

                </g>

              </svg>
            `,


            thunder: `
              <svg viewBox="0 0 64 64" aria-hidden="true">

                <path
                  d="
                    M16 36h32
                    c6 0 10-4 10-10
                    s-4-10-10-10
                    h-3
                    C42 10 37 7 30 7
                    c-8 0-14 6-15 13
                    C8 21 5 25 5 30
                    c0 4 4 6 11 6z
                  "
                  fill="#788b94">
                </path>

                <polygon
                  points="31,38 43,38 36,48 42,48 27,61 31,50 24,50"
                  fill="#f4b942">
                </polygon>

              </svg>
            `,


            snow: `
              <svg viewBox="0 0 64 64" aria-hidden="true">

                <path
                  d="
                    M16 37h32
                    c6 0 10-4 10-10
                    s-4-10-10-10
                    h-3
                    C42 10 37 8 30 8
                    c-8 0-14 6-15 14
                    C8 23 5 27 5 31
                    c0 4 4 6 11 6z
                  "
                  fill="#b7c6cb">
                </path>

                <g fill="#69b7e6">

                  <circle cx="20" cy="48" r="3"></circle>
                  <circle cx="32" cy="53" r="3"></circle>
                  <circle cx="44" cy="48" r="3"></circle>

                </g>

              </svg>
            `,


            fog: `
              <svg viewBox="0 0 64 64" aria-hidden="true">

                <path
                  d="
                    M17 31h30
                    c6 0 10-4 10-9
                    s-4-9-10-9
                    h-3
                    C41 8 36 6 30 6
                    c-8 0-14 5-15 12
                    C8 19 5 23 5 27
                    c0 3 4 4 12 4z
                  "
                  fill="#b7c6cb">
                </path>

                <g
                  stroke="#9aaeb4"
                  stroke-width="3"
                  stroke-linecap="round">

                  <line x1="10" y1="40" x2="54" y2="40"></line>
                  <line x1="15" y1="48" x2="49" y2="48"></line>
                  <line x1="20" y1="56" x2="44" y2="56"></line>

                </g>

              </svg>
            `
          };


          if (code === 0) {
            return {
              icon: icons.sun,
              label: 'Clear sky'
            };
          }

          if (code === 1) {
            return {
              icon: icons.sun,
              label: 'Mainly clear'
            };
          }

          if (code === 2) {
            return {
              icon: icons.partlyCloudy,
              label: 'Partly cloudy'
            };
          }

          if (code === 3) {
            return {
              icon: icons.cloud,
              label: 'Overcast'
            };
          }

          if ([45, 48].includes(code)) {
            return {
              icon: icons.fog,
              label: 'Fog'
            };
          }

          if ([51, 53, 55, 56, 57].includes(code)) {
            return {
              icon: icons.drizzle,
              label: 'Drizzle'
            };
          }

          if (
            [61, 63, 65, 66, 67, 80, 81, 82].includes(code)
          ) {
            return {
              icon: icons.rain,
              label: 'Rain'
            };
          }

          if (
            [71, 73, 75, 77, 85, 86].includes(code)
          ) {
            return {
              icon: icons.snow,
              label: 'Snow'
            };
          }

          if ([95, 96, 99].includes(code)) {
            return {
              icon: icons.thunder,
              label: 'Thunderstorm'
            };
          }

          return {
            icon: icons.cloud,
            label: 'Weather'
          };
        }


        /* =====================================================
           WEATHER RENDER
           ===================================================== */

        function renderWeatherForecast(
          forecast,
          targetContainer = weatherPlaceholder
        ) {

          if (!forecast.length) {

            targetContainer.innerHTML = `
              <div class="trip-planner__weather-icon">
               🌦️
              </div>

              <div>
                <h3>
                  Forecast unavailable
                </h3>

                <p>
                  Weather information is not available
                  for these dates yet.
                </p>
              </div>
            `;

            return;
          }

          const dateFormatter =
            new Intl.DateTimeFormat('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            });


          const cards = forecast.map((day) => {

            const weather =
              getWeatherInfo(day.weather_code);

            const date =
              new Date(day.date + 'T00:00:00');


            return `
              <article class="trip-planner__forecast-card">

                <span class="trip-planner__forecast-date">
                  ${dateFormatter.format(date)}
                </span>

                <div class="trip-planner__forecast-icon">
                  ${weather.icon}
                </div>

                <strong class="trip-planner__forecast-condition">
                  ${weather.label}
                </strong>

                <div class="trip-planner__forecast-temperature">

                  ${Math.round(day.temperature_max)}°

                  <span>
                    ${Math.round(day.temperature_min)}°
                  </span>

                </div>

                <div class="trip-planner__forecast-rain">
                  💧 ${day.rain_probability ?? 0}% rain
                </div>

              </article>
            `;

          }).join('');


          targetContainer.innerHTML = `
            <div class="trip-planner__forecast-grid">
              ${cards}
            </div>
          `;
        }

        /* =====================================================
           WEATHER DATA

           Fetch weather data for one city without deciding
           where it will be rendered.
           ===================================================== */

        async function fetchWeatherData(
          destinationName,
          start,
          end
        ) {

          const params = new URLSearchParams({
            destination: destinationName,
            start_date: start,
            end_date: end
          });


          const response = await fetch(
            `/plan-your-trip/weather?${params.toString()}`,
            {
              headers: {
                'Accept': 'application/json'
              }
            }
          );


          const data =
            await response.json();


          if (!response.ok || !data.success) {

            throw new Error(
              data.message ||
              'Weather could not be loaded.'
            );

          }


          return data;
        }

        /* ==========================================================
           LOAD TRIP WEATHER

           Load weather for every destination in the trip.
           ========================================================== */

        async function loadTripWeather() {

          const stays =
            buildCityStays();


          if (!stays.length) {

            weatherPlaceholder.innerHTML = `
              <div class="trip-planner__weather-icon">
                🌦️
              </div>

              <div>
                <h3>
                  No destinations available
                </h3>

                <p>
                  Add your journey details to see the weather forecast.
                </p>
              </div>
            `;

            return;
          }


          /*
           * Show loading state first.
           */
          weatherPlaceholder.innerHTML = `

            <div class="trip-planner__weather-loading">

              <div class="trip-planner__weather-icon">
                ⏳
              </div>

              <div>

                <h3>
                  Loading trip weather...
                </h3>

                <p>
                  Checking the forecast for your destinations.
                </p>

              </div>

            </div>

          `;


          const weatherSections = [];


          for (const stay of stays) {

            try {

              const data =
                await fetchWeatherData(
                  stay.city,
                  stay.start,
                  stay.end
                );


              const locationName =
                data.location.country
                  ? `${data.location.name}, ${data.location.country}`
                  : data.location.name;


              weatherSections.push({
                success: true,
                city: locationName,
                start: stay.start,
                end: stay.end,
                forecast: data.forecast
              });

            }
            catch (error) {

              console.error(
                `Weather error for ${stay.city}:`,
                error
              );


              weatherSections.push({
                success: false,
                city: stay.city,
                start: stay.start,
                end: stay.end,
                forecast: []
              });

            }

          }

          /* ==========================================================
             WEATHER OVERVIEW

             Keep the sidebar summary compact even for long trips.
             ========================================================== */

          if (overviewWeather) {

            const successfulSections =
              weatherSections.filter(
                (section) =>
                  section.success &&
                  Array.isArray(section.forecast) &&
                  section.forecast.length
              );


            const temperatures = [];


            successfulSections.forEach((section) => {

              section.forecast.forEach((day) => {

                if (
                  day.temperature_min !== null &&
                  day.temperature_min !== undefined
                ) {
                  temperatures.push(
                    Number(day.temperature_min)
                  );
                }


                if (
                  day.temperature_max !== null &&
                  day.temperature_max !== undefined
                ) {
                  temperatures.push(
                    Number(day.temperature_max)
                  );
                }
 
              });

            });


            if (temperatures.length) {

              const minimum =
                Math.round(
                  Math.min(...temperatures)
                );

              const maximum =
                Math.round(
                  Math.max(...temperatures)
                );


              if (stays.length === 1) {

                overviewWeather.textContent =
                  `${stays[0].city} · ${minimum}–${maximum}°C`;

              }
              else {

                overviewWeather.textContent =
                  `${stays.length} destinations · ${minimum}–${maximum}°C`;

              }

            }
            else {

              overviewWeather.textContent =
                'Forecast unavailable';

            }

          }


          const formatter =
            new Intl.DateTimeFormat(
              'en-GB',
              {
                day: 'numeric',
                month: 'short'
              }
            );


          weatherPlaceholder.innerHTML = '';


          weatherSections.forEach((section) => {

            const sectionElement =
              document.createElement('section');


            sectionElement.className =
              'trip-planner__city-weather';


            const start =
              new Date(
                section.start + 'T00:00:00'
              );


            const end =
              new Date(
                section.end + 'T00:00:00'
              );


            sectionElement.innerHTML = `

              <div class="trip-planner__city-weather-heading">

                <div>

                  <span>
                    DESTINATION
                  </span>

                  <h3>
                    ${section.city}
                  </h3>

                </div>


                <strong>
                  ${formatter.format(start)}
                  →
                  ${formatter.format(end)}
                </strong>

              </div>


              <div
                class="trip-planner__city-weather-forecast"
              >
              </div>

            `;


            weatherPlaceholder.appendChild(
              sectionElement
            );


            const forecastContainer =
              sectionElement.querySelector(
                '.trip-planner__city-weather-forecast'
              );


            if (section.success) {

              renderWeatherForecast(
                section.forecast,
                forecastContainer
              );

            }
            else {
 
              forecastContainer.innerHTML = `
                <div class="trip-planner__weather-icon">
                  ⚠️
                </div>
 
                <p>
                  Forecast unavailable for this destination.
                </p>
              `;

            }

          });

        }


        /* =====================================================
           WEATHER API
           ===================================================== */

        async function loadWeather(
          destinationName,
          start,
          end
        ) {

          weatherPlaceholder.innerHTML = `
            <div class="trip-planner__weather-icon">
              ⏳
            </div>

            <div>
              <h3>
                Loading forecast...
              </h3>

              <p>
                Checking the weather for ${destinationName}.
              </p>
            </div>
          `;


          const params = new URLSearchParams({
            destination: destinationName,
            start_date: start,
            end_date: end
          });


          try {

            const response = await fetch(
              `/plan-your-trip/weather?${params.toString()}`,
              {
                headers: {
                  'Accept': 'application/json'
                }
              }
            );


            const data =
              await response.json();


            if (!response.ok || !data.success) {
              throw new Error(
                data.message ||
                'Weather could not be loaded.'
              );
            }


            const fullLocation =
              data.location.country
                ? `${data.location.name}, ${data.location.country}`
                : data.location.name;


            weatherDestination.textContent =
              fullLocation;

            overviewDestination.textContent =
              fullLocation;


            renderWeatherForecast(
              data.forecast
            );

          }
          catch (error) {

            console.error(
              'Trip Planner Weather Error:',
              error
            );


            weatherPlaceholder.innerHTML = `
              <div class="trip-planner__weather-icon">
                ⚠️
              </div>

              <div>
                <h3>
                  Weather unavailable
                </h3>

                <p>
                  We could not load the forecast right now.
                  Please try again.
                </p>
              </div>
            `;
          }

        }


        /* =====================================================
           FLIGHT HELPERS
           ===================================================== */

        function formatDuration(minutes) {

          const hours =
            Math.floor(minutes / 60);

          const mins =
            minutes % 60;


          if (mins === 0) {
            return `${hours}h`;
          }


          return `${hours}h ${mins}m`;
        }


        function formatTime(dateTime) {

          if (!dateTime) {
            return '';
          }


          const parts =
            dateTime.split(' ');


          return parts[1] || dateTime;
        }
      
        /* ==========================================================
           TRIP ROUTES

           Read all route rows from the form and store them
           in the tripLegs array.
           ========================================================== */

        function collectTripLegs() {

          const routeRows = tripRoutesContainer.querySelectorAll(
            '.trip-planner__route-row'
          );

          tripLegs = Array.from(routeRows).map((row, index) => {

            const originInput = row.querySelector(
              '.trip-planner__leg-origin'
            );

            const destinationInput = row.querySelector(
              '.trip-planner__leg-destination'
            );

            const dateInput = row.querySelector(
              '.trip-planner__leg-date'
            );

            const newOrigin =
              originInput?.value.trim() || '';

            const newDestination =
              destinationInput?.value.trim() || '';

            const newDate =
              dateInput?.value || '';


            /*
             * Preserve transport selection when the route
             * itself has not changed.
             */
            const existingLeg =
              tripLegs[index];


            const routeUnchanged =
              existingLeg &&
              existingLeg.origin === newOrigin &&
              existingLeg.destination === newDestination &&
              existingLeg.date === newDate;


            return {
              index,
              origin: newOrigin,
              destination: newDestination,
              date: newDate,
              transportType: 
                routeUnchanged
                  ? existingLeg.transportType
                  : null,
              selectedTransport: 
                routeUnchanged
                  ? existingLeg.selectedTransport
                  : null
            };

          });

          return tripLegs;
        }

        /* ==========================================================
           BUILD CITY STAYS

           Convert trip legs into city stay periods.
           ========================================================== */

        function buildCityStays() {

          collectTripLegs();


          const stays = [];


          if (!tripLegs.length) {
            return stays;
          }


          tripLegs.forEach((leg, index) => {

            /*
             * Destination of each leg is the city
             * the traveller arrives in.
             */
            const city =
              leg.destination;

            if (!city || !leg.date) {
              return;
            }

            /* In a round trip, the final leg returns
             * to the original departure city.
             * That city is not a travel stay.
             */
            if (
              tripType === 'round-trip' &&
              index === tripLegs.length - 1
            ) {
              return;
            }


            /*
             * Stay starts on the travel date of this leg.
             */
            const stayStart =
              leg.date;


            /*
             * Stay ends when the next leg begins.
             *
             * For the final destination we use
             * the overall Trip end date.
             */
            let stayEnd = '';


            const nextLeg =
              tripLegs[index + 1];


            if (nextLeg && nextLeg.date) {

              stayEnd =
                nextLeg.date;

            }
            else {

              stayEnd =
                endDate?.value || '';

            }


            if (!stayEnd) {
              return;
            }


            stays.push({
              city,
              start: stayStart,
              end: stayEnd,
              legIndex: index
            });

          });


          return stays;
        }

        /* ==========================================================
           STAY STATE

           Convert city stay periods into selectable accommodation state.
           ========================================================== */

        function buildStaySelections() {

          const stays =
            buildCityStays();

          staySelections =
            stays.map((stay, index) => {

              const existing =
                staySelections.find(
                  (item) =>
                    item.city === stay.city &&
                    item.start === stay.start &&
                    item.end === stay.end
                  );

              const start =
                new Date(
                  stay.start + 'T00:00:00'
                );

              const end =
                new Date(
                  stay.end + 'T00:00:00'
                );

              const millisecondsPerDay =
                1000 * 60 * 60 * 24;

              const nights =
                Math.max(
                  0,
                  Math.round(
                    (end - start) /
                    millisecondsPerDay
                  )
                );

              return {
                index,
                city: stay.city,
                start: stay.start,
                end: stay.end,
                legIndex: stay.legIndex,
                nights,
                selectedStay:
                  nights > 0
                    ? existing?.selectedStay || null
                    : null
              };

            });

          return staySelections;
        }
        
        /* ==========================================================
           STAY OVERVIEW

           Render the selected accommodation for every destination.
           ========================================================== */

        function renderStayOverview() {

          if (!overviewStay) {
            return;
          }


          if (!staySelections.length) {

            overviewStay.innerHTML = `
              <strong>
                Not selected
              </strong>
            `;

            return;
          }


          const items =
            staySelections.map((stay) => {

              const selected =
                stay.selectedStay;


              if (!selected) {

                return `
                  <div class="trip-planner__overview-stay-item">

                    <strong>
                      ${stay.city}
                    </strong>

                    <strong>
                      Not selected
                    </strong>

                  </div>
                `;

              }


              const price =
                selected.total_price
                  ? ` · ${selected.total_price} total`
                  : '';


              return `
                <div class="trip-planner__overview-stay-item">

                  <strong>
                    ${stay.city}
                  </strong>

                  <span>
                    ${selected.name || 'Accommodation'}${price}
                  </span>

                </div>
              `;

            });


          overviewStay.innerHTML =
            items.join('');

        }

        /* ==========================================================
           STAY RENDERER
           ========================================================== */

        function renderStayDestinations() {

          if (!stayDestinationsContainer) {
            return;
          }

          buildStaySelections();

          if (!staySelections.length) {

            stayDestinationsContainer.innerHTML = `
              <div class="trip-planner__stay-empty">
                <h3>No accommodation needed</h3>
                <p>
                  No overnight destinations were found for this trip.
                </p>
              </div>
            `;

            return;
          }

          const formatter =
            new Intl.DateTimeFormat(
              'en-GB',
              {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }
            );


          stayDestinationsContainer.innerHTML =
            staySelections.map((stay, index) => {

              const start =
                new Date(
                  stay.start + 'T00:00:00'
                );

              const end =
                new Date(
                  stay.end + 'T00:00:00'
                );


              const nights =
                stay.nights;

              return `
                <article
                  class="trip-planner__stay-card"
                  data-stay-index="${index}"
                >
               
                  <button
                    type="button"
                    class="trip-planner__stay-toggle"
                    data-stay-toggle="${index}"
                    ${nights === 0 ? 'disabled' : ''}
                  >

                    <div class="trip-planner__stay-toggle-main">

                      <span class="trip-planner__stay-label">
                        STAY ${index + 1}
                      </span>

                      <h3>
                        ${stay.city}
                      </h3>

                      <span class="trip-planner__stay-toggle-dates">
                        ${formatter.format(start)}
                        →
                        ${formatter.format(end)}
                      </span>

                    </div>

                    <div class="trip-planner__stay-toggle-meta">

                      <span class="trip-planner__stay-nights">
                        ${
                          nights === 0
                            ? 'Day stop'
                            : `${nights} ${nights === 1 ? 'night' : 'nights'}`
                        }
                      </span>

                      ${
                        nights > 0
                          ? `
                            <span
                              class="trip-planner__stay-chevron"
                              aria-hidden="true"
                            >
                              ▼
                            </span>
                          `
                          : ''
                      }

                    </div>

                  </button>


                  ${
                    nights === 0
                      ? `
                        <div class="trip-planner__stay-no-overnight">
                          No overnight stay. Accommodation is not required.
                        </div>
                      `
                      : `
                        <div
                          class="trip-planner__stay-accordion"
                          data-stay-accordion="${index}"
                          hidden
                        >

                          <div
                            class="trip-planner__stay-results"
                            data-stay-results="${index}"
                          >
                            <div class="trip-planner__stay-loading">

                              <span>
                               ⏳
                              </span>

                              <div>
                                <strong>
                                  Accommodation not loaded yet
                                </strong>

                                <p>
                                  Open this stay to search accommodation in ${stay.city}.
                                </p>
                              </div>

                            </div>
                          </div>

                        </div>
                      `
                  }

                </article>
              `;

            }).join('');

        }

        /* ==========================================================
           STAY API

           Fetch accommodation for one destination.
           ========================================================== */

        async function fetchStayData(
          city,
          checkIn,
          checkOut
        ) {

          const adults =
            Math.max(
              1,
              parseInt(travellers.value, 10) || 1
            );


          const cacheKey =
            [
              city.toLowerCase(),
              checkIn,
              checkOut,
              adults
            ].join('|');


          /*
           * Do not spend another SerpApi search
           * for an identical Stay request.
           */
          if (stayResultsCache.has(cacheKey)) {

            return stayResultsCache.get(
              cacheKey
            );

          }


          const params =
            new URLSearchParams({

              city,

              check_in: checkIn,

              check_out: checkOut,

              adults: String(adults)

            });


          const response =
            await fetch(
              `/plan-your-trip/hotels?${params.toString()}`,
              {
                headers: {
                  'Accept': 'application/json'
                }
              }
            );


          const data =
            await response.json();


          if (!response.ok || !data.success) {

            throw new Error(
              data.message ||
              'Accommodation search failed.'
            );

          }


          /*
           * Cache the successful result.
           */
          stayResultsCache.set(
            cacheKey,
            data
          );


          return data;
        }

        /* ==========================================================
           STAY RESULTS
           ========================================================== */

        function renderStayResults(
          hotels,
          stayIndex,
          resultsContainer
        ) {

          if (!resultsContainer) {
            return;
          }


          if (!Array.isArray(hotels) || !hotels.length) {

            resultsContainer.innerHTML = `
              <div class="trip-planner__stay-message">

                <h3>
                  No stays found
                </h3>

                <p>
                  We could not find accommodation
                  for this destination.
                </p>

              </div>
            `;

          return;
        }


        /*
         * Keep the first results manageable.
         * We can add "Show more" later.
         */
        const visibleHotels =
          hotels.slice(0, 6);

        const selectedStay =
          staySelections[stayIndex]
            ?.selectedStay;


        const isSelected =
          selectedStay &&
          (
            (
              selectedStay.property_token &&
              selectedStay.property_token ===
                hotel.property_token
            ) ||
            (
              !selectedStay.property_token &&
              selectedStay.name === hotel.name
            )
          );

        resultsContainer.innerHTML =
          visibleHotels.map(
            (hotel, hotelIndex) => {

              const rating =
                hotel.rating
                  ? `★ ${hotel.rating}`
                  : 'No rating';


              const reviews =
                hotel.reviews
                  ? `${Number(
                      hotel.reviews
                    ).toLocaleString()} reviews`
                  : '';


              const type =
                hotel.type
                  ? hotel.type
                      .replace(/\b\w/g, (letter) =>
                        letter.toUpperCase()
                      )
                  : 'Accommodation';


              const amenities =
                Array.isArray(hotel.amenities)
                  ? hotel.amenities.slice(0, 4)
                  : [];


              const image =
                hotel.thumbnail
                  ? `
                    <img
                      src="${hotel.thumbnail}"
                      alt=""
                      loading="lazy"
                    >
                  `
                  : `
                    <div class="trip-planner__stay-result-no-image">
                      🏨
                    </div>
                  `;

              /* Hotel Search */

              const hotelSearchUrl =
                'https://www.google.com/travel/search?' +
                new URLSearchParams({
                  q: `${hotel.name || 'Hotel'} ${staySelections[stayIndex]?.city || ''}`
                }).toString();

              return `
                <article
                  class="trip-planner__stay-result${isSelected ? ' is-selected' : ''}"
                  data-stay-index="${stayIndex}"
                  data-hotel-index="${hotelIndex}"
                >

                  <div class="trip-planner__stay-result-image">
                    ${image}
                  </div>


                  <div class="trip-planner__stay-result-content">

                    <div class="trip-planner__stay-result-heading">

                      <div>

                        <span class="trip-planner__stay-result-type">
                          ${type}
                        </span>

                        <h4>
                          ${hotel.name || 'Accommodation'}
                        </h4>

                      </div>


                      <div class="trip-planner__stay-result-rating">

                        <strong>
                          ${rating}
                        </strong>

                        ${
                          reviews
                            ? `<small>${reviews}</small>`
                            : ''
                        }

                      </div>

                    </div>


                    ${
                      hotel.description
                        ? `
                          <p class="trip-planner__stay-result-description">
                            ${hotel.description}
                          </p>
                        `
                      : ''
                    }


                    ${
                      amenities.length
                        ? `
                          <div class="trip-planner__stay-amenities">

                            ${amenities.map(
                              (amenity) => `
                                <span>
                                  ${amenity}
                                </span>
                              `
                            ).join('')}

                          </div>
                        `
                        : ''
                    }


                    <div class="trip-planner__stay-result-footer">

                      <div class="trip-planner__stay-price">

                        <strong>
                          ${hotel.price_per_night || 'Price unavailable'}
                        </strong>

                        ${
                          hotel.price_per_night
                            ? '<small>per night</small>'
                            : ''
                        }

                        ${
                          hotel.total_price
                            ? `
                              <span>
                                ${hotel.total_price} total
                              </span>
                            `
                            : ''
                        }

                      </div>

                      <div class="trip-planner__stay-actions">

                        <button
                          type="button"
                          class="trip-planner__stay-select${isSelected ? ' is-selected' : ''}"
                          data-stay-index="${stayIndex}"
                          data-hotel-index="${hotelIndex}"
                        >
                          ${isSelected ? '✓ Selected' : 'Select stay'}
                        </button>

                        <a
                          class="trip-planner__stay-view"
                          href="${hotelSearchUrl}"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View hotel ↗
                        </a>

                      </div>

                    </div>

                  </div>

                </article>
              `;

            }
          ).join('');


          /*
           * Store the exact hotels rendered for this city.
           * Selection listeners will use this array.
           */
          staySelections[stayIndex].hotels =
            visibleHotels;

        }

        /* ==========================================================
           LOAD STAY RESULTS
           ========================================================== */

        async function loadStayResults(
          stayIndex,
          resultsContainer
        ) {

          const stay =
            staySelections[stayIndex];


          if (!stay || !resultsContainer) {
            return;
          }


          try {

            const data =
              await fetchStayData(
                stay.city,
                stay.start,
                stay.end
              );


            renderStayResults(
              data.hotels,
              stayIndex,
              resultsContainer
            );

          }
          catch (error) {

            console.error(
              `Trip Planner Stay Error - ${stay.city}:`,
              error
            );


            resultsContainer.innerHTML = `
              <div class="trip-planner__stay-message">

                <h3>
                  Stays unavailable
                </h3>

                <p>
                  We could not load accommodation
                  for ${stay.city}.
                  Please try again.
                </p>

              </div>
            `;

          }

        }

        /* ==========================================================
           OPEN STAY STEP
           ========================================================== */

        function openStayStep() {

          collectTripLegs();

          renderStayDestinations();

          renderStayOverview();

          panels.forEach((panel) => {
            panel.hidden = true;
          });

          if (panels[3]) {
            panels[3].hidden = false;
          }

          steps.forEach((step) => {
            step.classList.remove('is-active');
          });

          if (steps[3]) {
            steps[3].classList.add('is-active');
          }

          planner.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

        }

        /* ==========================================================
           TRIP SUMMARY
           ========================================================== */

        function renderTripSummary() {

          if (!summaryContainer) {
            return;
          }


          collectTripLegs();
          buildStaySelections();


          if (!tripLegs.length) {

            summaryContainer.innerHTML = `
              <div class="trip-planner__summary-empty">
                Trip information is not available.
              </div>
            `;

            return;
          }


          const formatter =
            new Intl.DateTimeFormat(
              'en-GB',
              {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }
            );


          const firstLeg =
            tripLegs[0];


          const journeyStart =
            new Date(
              firstLeg.date + 'T00:00:00'
            );


          const journeyEnd =
            new Date(
              endDate.value + 'T00:00:00'
            );


          const travellerText =
            travellers.options[
              travellers.selectedIndex
            ]?.text || `${travellers.value} traveller`;


          const weatherText =
            overviewWeather?.textContent.trim() ||
            'Forecast unavailable';

          const itineraryItems =
            tripLegs.map((leg, index) => {

              const transport =
                leg.selectedTransport;


              let transportText =
                'Transport not selected';


              if (transport) {

                if (leg.transportType === 'flight') {

                  transportText =
                    `✈ ${transport.airline || 'Flight'}`;

                }
                else if (leg.transportType === 'train') {

                  transportText =
                    `🚆 ${transport.operator || 'Train'}`;

                }
                else if (leg.transportType === 'bus') {

                  transportText =
                    `🚌 ${transport.operator || 'Bus'}`;

                }

              }


              const stay =
                staySelections.find(
                  (item) =>
                    item.legIndex === index
                );


              let stayHtml = '';


              if (stay) {

                const selectedStay =
                  stay.selectedStay;


                stayHtml = `
                  <div class="trip-planner__summary-stay">

                    <span class="trip-planner__summary-type">
                      Stay in ${stay.city}
                    </span>

                    ${
                      selectedStay
                        ? `
                          <strong>
                            ${selectedStay.name || 'Accommodation'}
                          </strong>

                          <small>
                            ${
                              selectedStay.total_price
                                ? `${selectedStay.total_price} total`
                                : 'Price unavailable'
                            }
                          </small>
                        `
                      : `
                        <strong>
                          Stay not selected
                        </strong>
                      `
                    }

                  </div>
                `;

              }


              return `
                <article class="trip-planner__summary-item">

                  <div class="trip-planner__summary-route">

                    <span class="trip-planner__summary-type">
                      Route ${index + 1}
                    </span>

                    <strong>
                      ${leg.origin} → ${leg.destination}
                    </strong>

                    <small>
                      ${
                        formatter.format(
                          new Date(
                            leg.date + 'T00:00:00'
                          )
                        )
                      }
                    </small>

                    <small>
                      ${transportText}
                    </small>

                  </div>

                  ${stayHtml}

                </article>
              `;

            }).join('');


          summaryContainer.innerHTML = `

            <section class="trip-planner__summary-overview">

              <div>
                <small>
                  Journey
                </small>

                <strong>
                  ${firstLeg.origin}
                  →
                  ${tripLegs[tripLegs.length - 1].destination}
                </strong>
              </div>


              <div>
                <small>
                  Travel dates
                </small>

                <strong>
                  ${formatter.format(journeyStart)}
                  →
                  ${formatter.format(journeyEnd)}
                </strong>
              </div>

 
              <div>
                <small>
                  Travellers
                </small>

                <strong>
                  ${travellerText}
                </strong>
              </div>

              <div>
                <small>
                  Weather
                </small>

                <strong>
                  ${weatherText}
                </strong>
              </div>

            </section>


            <section class="trip-planner__summary-itinerary">
 
              <div class="trip-planner__summary-heading">

                <span>
                  ITINERARY
                </span>

                <h3>
                  Your journey
                </h3>

              </div>


              <div class="trip-planner__summary-list">
                ${itineraryItems}
              </div>

            </section>
 
          `;

        }

        /* ==========================================================
           OPEN SUMMARY STEP
           ========================================================== */

        function openSummaryStep() {

          renderTripSummary();


          panels.forEach((panel) => {
            panel.hidden = true;
          });


          if (summaryPanel) {
            summaryPanel.hidden = false;
          }

          if (tripOverview) {
            tripOverview.hidden = true;
          }

          steps.forEach((step) => {
            step.classList.remove('is-active');
          });


          if (steps[4]) {
            steps[4].classList.add('is-active');
          }


          planner.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

        }

        /* Yeni Route Oluşturma Fonksiyonu */

        function createRouteRow(index, originValue = '') {

          const article = document.createElement('article');

          article.className = 'trip-planner__route-row';

          article.dataset.legIndex = index;


          article.innerHTML = `

            <div class="trip-planner__route-heading">

              <div>

                <span>
                  ROUTE ${index + 1}
                </span>

                <strong>
                  Journey ${index + 1}
                </strong>

              </div>


              <button
                type="button"
                class="trip-planner__route-remove"
                aria-label="Remove route"
              >
                Remove
              </button>

            </div>


            <div class="trip-planner__route-fields">

              <div class="trip-planner__field">

                <label>
                  From
                </label>

                <input
                  type="text"
                  class="trip-planner__leg-origin"
                  placeholder="e.g. Paris"
                  autocomplete="off"
                >

              </div>


              <div class="trip-planner__route-arrow">
                →
              </div>


              <div class="trip-planner__field">

                <label>
                  To
                </label>

                <input
                  type="text"
                  class="trip-planner__leg-destination"
                  placeholder="e.g. Amsterdam"
                  autocomplete="off"
                >

              </div>


              <div class="trip-planner__field">

                <label>
                  Travel date
                </label>

                <input
                  type="date"
                  class="trip-planner__leg-date"
                >

              </div>

            </div>

          `;


          const originInput = article.querySelector(
            '.trip-planner__leg-origin'
          );

          originInput.value = originValue;

 
          const removeButton = article.querySelector(
            '.trip-planner__route-remove'
          );


          removeButton.addEventListener('click', () => {

            article.remove();

            updateRouteRows();

          });


          return article;
        }

        /* Route Numaralarını Güncelle */

        function updateRouteRows() {

          const rows = tripRoutesContainer.querySelectorAll(
            '.trip-planner__route-row'
          );


          rows.forEach((row, index) => {

            row.dataset.legIndex = index;


            const routeLabel = row.querySelector(
              '.trip-planner__route-heading span'
            );

            const routeTitle = row.querySelector(
              '.trip-planner__route-heading strong'
            );


            if (routeLabel) {
              routeLabel.textContent = `ROUTE ${index + 1}`;
            }


            if (routeTitle) {

              routeTitle.textContent =
              index === 0
                ? 'First journey'
                : `Journey ${index + 1}`;

            }


            const removeButton = row.querySelector(
              '.trip-planner__route-remove'
            );

            if (removeButton) {
              removeButton.hidden = index === 0;
            }

          });


          collectTripLegs();
        }

        /* ==========================================================
           RENDER TRANSPORT LEGS

           Create one transport selection block for every trip leg.
           ========================================================== */

        function renderTransportLegs() {

          if (!transportLegsContainer) {
            return;
          }


          collectTripLegs();


          if (!tripLegs.length) {

            transportLegsContainer.innerHTML = `
              <div class="trip-planner__transport-empty">
                <p>
                  No routes available.
                </p>
              </div>
            `;

            return;
          }


          const dateFormatter =
            new Intl.DateTimeFormat(
              'en-GB',
              {
                day: 'numeric',
                month: 'short'
              }
            );


          transportLegsContainer.innerHTML =
            tripLegs.map((leg, index) => {

              const date =
                new Date(
                  leg.date + 'T00:00:00'
                );


              return `

                <section
                  class="trip-planner__transport-leg"
                  data-leg-index="${index}"
                >

                  <div class="trip-planner__transport-leg-heading">

                    <div>

                      <span>
                        ROUTE ${index + 1}
                      </span>

                      <h3>
                        ${leg.origin}
                        →
                        ${leg.destination}
                      </h3>

                    </div>


                    <strong>
                      ${dateFormatter.format(date)}
                    </strong>

                  </div>


                  <div class="trip-planner__transport-options">

                    <button
                      type="button"
                      class="trip-planner__transport-option"
                      data-leg-index="${index}"
                      data-transport="flight"
                    >

                      <span class="trip-planner__transport-icon">
                        ✈
                      </span>

                      <strong>
                        Flight
                      </strong>

                      <small>
                        Search available flights
                      </small>

                    </button>


                    <button
                      type="button"
                      class="trip-planner__transport-option"
                      data-leg-index="${index}"
                      data-transport="train"
                    >

                      <span class="trip-planner__transport-icon">
                        🚆
                      </span>

                      <strong>
                        Train
                      </strong>

                      <small>
                        Check train connections
                      </small>

                    </button>


                    <button
                      type="button"
                      class="trip-planner__transport-option"
                      data-leg-index="${index}"
                      data-transport="bus"
                    >

                      <span class="trip-planner__transport-icon">
                        🚌
                      </span>

                      <strong>
                        Bus
                      </strong>

                      <small>
                        Find coach and bus routes
                      </small>

                    </button>

                  </div>


                  <div
                    class="trip-planner__transport-results"
                    data-transport-results="${index}"
                    hidden
                  >
                  </div>

                </section>

              `;

            }).join('');

        }

        /* ==========================================================
           ROUND TRIP RETURN ROUTE

           Ensure the final route always returns to the
           starting city when Round trip is selected.
           ========================================================== */

        function ensureRoundTripReturnRoute() {

          if (
            tripType !== 'round-trip' ||
            !tripRoutesContainer
          ) {
            return;
          }


          const rows =
            tripRoutesContainer.querySelectorAll(
              '.trip-planner__route-row'
            );


          if (!rows.length) {
            return;
          }


          const firstRow =
            rows[0];

          const firstOriginInput =
            firstRow.querySelector(
              '.trip-planner__leg-origin'
            );


          const startCity =
            firstOriginInput?.value.trim() || '';


          if (!startCity) {
            return;
          }


          let currentRows =
            Array.from(
              tripRoutesContainer.querySelectorAll(
                '.trip-planner__route-row'
              )
            );


          /*
           * Round trip needs at least two routes:
           *
           * A → B
           * B → A
           */
          if (currentRows.length === 1) {

            const firstDestination =
              currentRows[0].querySelector(
                '.trip-planner__leg-destination'
              )?.value.trim() || '';


            const returnRow =
              createRouteRow(
                1,
                firstDestination
              );


            returnRow.classList.add(
              'trip-planner__route-row--return'
            );


            const returnDestination =
              returnRow.querySelector(
                '.trip-planner__leg-destination'
              );


            if (returnDestination) {
              returnDestination.value = startCity;
            }


            tripRoutesContainer.appendChild(
              returnRow
            );

          }


          currentRows =
            Array.from(
              tripRoutesContainer.querySelectorAll(
                '.trip-planner__route-row'
              )
            );


          const lastRow =
            currentRows[currentRows.length - 1];


          lastRow.classList.add(
            'trip-planner__route-row--return'
          );


          const previousRow =
            currentRows[currentRows.length - 2];


          const previousDestination =
            previousRow?.querySelector(
              '.trip-planner__leg-destination'
            )?.value.trim() || '';


          const returnOrigin =
            lastRow.querySelector(
            '.trip-planner__leg-origin'
          );

          const returnDestination =
            lastRow.querySelector(
            '.trip-planner__leg-destination'
          );


          if (returnOrigin) {
            returnOrigin.value = previousDestination;
          }


          if (returnDestination) {
            returnDestination.value = startCity;
          }


          updateRouteRows();
        }
        
        /* ==========================================================
           ADD ROUTE
           ========================================================== */

        if (
          addRouteButton &&
          tripRoutesContainer
        ) {

          addRouteButton.addEventListener(
            'click',
            () => {

              const rows =
                Array.from(
                  tripRoutesContainer.querySelectorAll(
                    '.trip-planner__route-row'
                  )
                );


              /* ----------------------------------------------
                 ROUND TRIP

                 Insert the new route BEFORE the final
                 return route.
                 ---------------------------------------------- */

              if (tripType === 'round-trip') {

                ensureRoundTripReturnRoute();


                const currentRows =
                  Array.from(
                    tripRoutesContainer.querySelectorAll(
                      '.trip-planner__route-row'
                    )
                  );


                const returnRow =
                  currentRows[currentRows.length - 1];


                const previousRow =
                  currentRows[currentRows.length - 2];


                const previousDestination =
                  previousRow
                    ?.querySelector(
                      '.trip-planner__leg-destination'
                    )
                    ?.value.trim() || '';


                const newRow =
                  createRouteRow(
                    currentRows.length - 1,
                    previousDestination
                  );


                tripRoutesContainer.insertBefore(
                  newRow,
                  returnRow
                );


                ensureRoundTripReturnRoute();

                updateRouteRows();

                return;
              }


              /* ----------------------------------------------
                 MULTI-CITY

                 Add normally at the end.
                 ---------------------------------------------- */

              const lastRow =
                rows[rows.length - 1];


              let nextOrigin = '';


              if (lastRow) {

                const lastDestination =
                  lastRow.querySelector(
                    '.trip-planner__leg-destination'
                  );


                nextOrigin =
                  lastDestination?.value.trim() || '';

              }


              const newRow =
                createRouteRow(
                  rows.length,
                  nextOrigin
                );


              tripRoutesContainer.appendChild(
                newRow
              );


              updateRouteRows();

            }
          );

        }

        /* ==========================================================
           KEEP ROUND TRIP RETURN CITY IN SYNC
           ========================================================== */

        if (tripRoutesContainer) {

          tripRoutesContainer.addEventListener(
            'input',
            (event) => {

              if (tripType !== 'round-trip') {
                return;
              }


              if (
                event.target.matches(
                  '.trip-planner__leg-origin, ' +
                  '.trip-planner__leg-destination'
                )
              ) {

                ensureRoundTripReturnRoute();

              }

            }
          );

        }

        /* ==========================================================
           TRIP TYPE
           One way / Round trip / Multi-city
           ========================================================== */

        tripTypeInputs.forEach((input) => {

          input.addEventListener('change', () => {

            if (!input.checked) {
              return;
            }


            tripType = input.value;


            /* Update active card */

            document
              .querySelectorAll('.trip-planner__trip-type')
              .forEach((item) => {

                item.classList.remove('is-active');

              });


            input
              .closest('.trip-planner__trip-type')
              ?.classList.add('is-active');


            /* ----------------------------------------------
               ONE WAY
               ---------------------------------------------- */
            if (tripType === 'one-way') {

              if (addRouteButton) {
                addRouteButton.hidden = true;
              }


              if (tripRoutesContainer) {

                const rows =
                  tripRoutesContainer.querySelectorAll(
                    '.trip-planner__route-row'
                  );


                rows.forEach((row, index) => {

                  if (index > 0) {
                    row.remove();
                  }

                });

              }


              updateRouteRows();

              return;
            }

            /* ----------------------------------------------
               ROUND TRIP
               ---------------------------------------------- */

            if (tripType === 'round-trip') {

              if (addRouteButton) {
                addRouteButton.hidden = false;
              }

              ensureRoundTripReturnRoute();

              return;
            }


            /* ----------------------------------------------
               MULTI-CITY
               ---------------------------------------------- */

            if (tripType === 'multi-city') {

              if (addRouteButton) {
                addRouteButton.hidden = false;
              }

              /*
               * Remove return-route marker when switching
               * from Round trip to Multi-city.
               */
              tripRoutesContainer
                ?.querySelectorAll(
                  '.trip-planner__route-row--return'
                )
                .forEach((row) => {
                  row.classList.remove(
                    'trip-planner__route-row--return'
                  );
                });


              updateRouteRows();

            }

          });

        });

        /* DEV MODE ile Transport'u API harcamadan geç */


        if (DEV_MODE && devSkipTransportButton) {

          devSkipTransportButton.addEventListener('click', () => {

            /*
             * Burada hiçbir Flight / Train / Bus loader çağrılmıyor.
             * Dolayısıyla SerpApi request yapılmaz.
             */

            console.log(
              'DEV MODE: Transport skipped.'
            );


            /*
             * Stay panelini bağladığımızda burada
             * openStayStep() çağıracağız.
             *
             * Şimdilik transport seçimini bypass ettiğimizi
             * işaretliyoruz.
             */

            window.tripPlannerDevTransportSkipped = true;

            openStayStep();

          });

        }

        /* ==========================================================
           INITIAL ROUTE STATE
           ========================================================== */

        updateRouteRows();

        /* Initial trip type UI */

        if (tripType === 'one-way' && addRouteButton) {
          addRouteButton.hidden = true;
        }

        /* ==========================================================
           TRANSPORT OVERVIEW

           Render the selected transport for every trip leg.
           ========================================================== */

        function renderTransportOverview() {

          if (!overviewTransport) {
            return;
          }


          if (!tripLegs.length) {

            overviewTransport.innerHTML = `
              <strong>
                Not selected
              </strong>
            `;
            return;
          }

          const transportNames = {
            flight: 'Flight',
            train: 'Train',
            bus: 'Bus'
          };


          const items = tripLegs.map(
            (leg, index) => {

              const selected =
                leg.selectedTransport;


              /*
               * Transport type selected, but no concrete journey selected yet.
               */
              if (!selected) {

                const transportName =
                  transportNames[leg.transportType] ||
                  'Not selected';

                return `
                  <div class="trip-planner__overview-transport-leg">

                    <span class="trip-planner__overview-transport-route">
                      Route ${index + 1}
                    </span>

                    <strong>
                      ${leg.origin} → ${leg.destination}
                    </strong>

                    <strong>
                      ${transportName}
                    </strong>
                  </div>
                `;
              }


              /* FLIGHT */

              if (leg.transportType === 'flight') {

                return `
                  <div class="trip-planner__overview-transport-leg">

                    <span class="trip-planner__overview-transport-route">
                      Route ${index + 1}
                    </span>

                    <strong>
                      ${leg.origin} → ${leg.destination}
                    </strong>

                    <small>
                      ✈  ${selected.airline || 'Flight'}
                    </small>

                    <small>
                      ${selected.departure_airport || ''}
                      →
                      ${selected.arrival_airport || ''}
                    </small>

                    <small>
                      ${formatTime(selected.departure_time)}
                      →
                      ${formatTime(selected.arrival_time)}
                    </small>

                  </div>
                `;
              }


              /* TRAIN */

              if (leg.transportType === 'train') {

                return `
                  <div class="trip-planner__overview-transport-leg">

                    <span class="trip-planner__overview-transport-route">
                      Route ${index + 1}
                    </span>

                    <strong>
                      ${leg.origin} → ${leg.destination}
                    </strong>

                    <small>
                     🚆 ${selected.operator || 'Train'}
                    </small>

                    <small>
                      ${selected.departure_time || ''}
                      →
                      ${selected.arrival_time || ''}
                    </small>

                  </div>
                `;
              }


              /* BUS */

              if (leg.transportType === 'bus') {

                return `
                  <div class="trip-planner__overview-transport-leg">

                    <span class="trip-planner__overview-transport-route">
                      Route ${index + 1}
                    </span>

                    <strong>
                      ${leg.origin} → ${leg.destination}
                    </strong>

                    <small>
                      🚌 ${selected.operator || 'Bus'}
                    </small>

                    <small>
                      ${selected.departure_time || ''}
                      →
                      ${selected.arrival_time || ''}
                    </small>

                  </div>
                `;
              }


              return '';

            }
          );


          overviewTransport.innerHTML =
            items.join('');

        }


        /* =====================================================
           FLIGHT RESULTS
           ===================================================== */

        function renderFlights(
            flights,
            legIndex,
            resultsContainer
        ) {

          if (!flights.length) {

            resultsContainer.hidden =
              false;


            resultsContainer.innerHTML = `
              <div class="trip-planner__flight-message">

                <h3>
                  No flights found
                </h3>

                <p>
                  No flight results were found
                  for the selected route and date.
                </p>

              </div>
            `;

            return;
          }


          const cards =
            flights.map((flight, index) => {

              const stopsText =
                flight.stops === 0
                  ? 'Direct'
                  : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`;


              return `
                <article
                  class="trip-planner__flight-card"
                  data-flight-index="${index}"
                >

                  <div class="trip-planner__flight-airline">

                    ${
                      flight.airline_logo
                        ? `
                          <img
                            src="${flight.airline_logo}"
                            alt=""
                            class="trip-planner__flight-logo"
                          >
                        `
                        : ''
                    }

                    <div>

                      <strong>
                        ${flight.airline}
                      </strong>

                      <span>
                        ${flight.flight_number}
                      </span>

                    </div>

                  </div>


                  <div class="trip-planner__flight-route">

                    <div class="trip-planner__flight-point">

                      <strong>
                        ${formatTime(flight.departure_time)}
                      </strong>

                      <span>
                        ${flight.departure_airport}
                      </span>

                    </div>


                    <div class="trip-planner__flight-middle">

                      <span>
                        ${formatDuration(flight.duration)}
                      </span>

                      <div class="trip-planner__flight-line"></div>

                      <small>
                        ${stopsText}
                      </small>

                    </div>


                    <div class="trip-planner__flight-point">

                      <strong>
                        ${formatTime(flight.arrival_time)}
                      </strong>

                      <span>
                        ${flight.arrival_airport}
                      </span>

                    </div>

                  </div>


                  <div class="trip-planner__flight-meta">

                    <span>
                      ${flight.travel_class}
                    </span>

                    <strong class="trip-planner__flight-price">
                      €${flight.price}
                    </strong>

                  </div>


                  <button
                    type="button"
                    class="trip-planner__flight-select"
                    data-flight-index="${index}"
                  >
                    Select flight
                  </button>

                </article>
              `;

            }).join('');


          resultsContainer.hidden =
            false;


          resultsContainer.innerHTML = `
            <div class="trip-planner__flight-results-heading">

              <span>
                FLIGHT RESULTS
              </span>

              <h3>
                Available flights
              </h3>

              <p>
                Flight results from Google Flights.
              </p>

            </div>

            <div class="trip-planner__flight-list">
              ${cards}
            </div>
          `;
          
          /*
           * Flight selection
           */
           const flightSelectButtons =
             resultsContainer.querySelectorAll(
               '.trip-planner__flight-select'
             );

           flightSelectButtons.forEach((button) => {

             button.addEventListener('click', () => {

               const index =
                 Number(button.dataset.flightIndex);

               const selectedFlight =
                 flights[index];

               if (!selectedFlight) {
                 return;
               }

               tripLegs[legIndex].transportType =
                 'flight';

               tripLegs[legIndex].selectedTransport =
                 selectedFlight;

               console.log('Selected flight data:', selectedFlight);

               renderTransportOverview();

               /*
                * Eski seçimi kaldır.
                */
               resultsContainer
                 .querySelectorAll('.trip-planner__flight-card')
                 .forEach((card) => {
                   card.classList.remove('is-selected');
                 });


               /*
                * Seçilen kartı aktif yap.
                */
               const selectedCard =
                 button.closest('.trip-planner__flight-card');

               if (selectedCard) {
                 selectedCard.classList.add('is-selected');
               }


               /*
                * Buton yazılarını sıfırla.
                */
               flightSelectButtons.forEach((item) => {
                 item.textContent = 'Select flight';
               });

               button.textContent = 'Selected ✓';

             });

           });

        }

        function renderTrains(
            trains,
            legIndex,
            resultsContainer
        ) {

          if (!trains.length) {
            resultsContainer.hidden = false;

            resultsContainer.innerHTML = `
              <div class="trip-planner__flight-message">
                <h3>No train journeys found</h3>
                <p>
                  No train results were found for the selected route and date.
                </p>
              </div>
            `;

            return;
          }

          const cards = trains.map((train, index) => {

            const transfersText =
              train.transfers === 0
                ? 'Direct'
                : `${train.transfers} transfer${train.transfers > 1 ? 's' : ''}`;

            const priceHtml =
              train.price !== null &&
              train.price !== undefined
                ? `
                  <strong class="trip-planner__train-price">
                    ${train.currency === 'EUR' ? '€' : ''}
                    ${train.price}
                  </strong>
                `
              : `
                <div class="trip-planner__train-price-unavailable">

                  <span>
                    Price unavailable
                  </span>

                  ${
                    train.operator_link
                      ? `
                        <a
                          href="${train.operator_link}"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="trip-planner__train-ticket-link"
                        >
                          View tickets ↗
                        </a>
                      `
                      : ''
                  }

                </div>
              `;

            return `
              <article
                class="trip-planner__train-card"
                data-train-index="${index}"
              >

                <div class="trip-planner__train-operator">
                  <strong>${train.operator || 'Train service'}</strong>
                  <span>${train.train_name || ''}</span>
                </div>

                <div class="trip-planner__train-route">

                  <div class="trip-planner__train-point">
                    <strong>${train.departure_time}</strong>
                    <span>${train.start_station}</span>
                  </div>

                  <div class="trip-planner__train-middle">
                    <span>${train.duration}</span>
                    <div class="trip-planner__train-line"></div>
                    <small>${transfersText}</small>
                  </div>

                  <div class="trip-planner__train-point">
                    <strong>${train.arrival_time}</strong>
                    <span>${train.end_station}</span>
                  </div>

                </div>

                <div class="trip-planner__train-meta">

                  <span>
                    ${train.distance || ''}
                  </span>

                  ${priceHtml}
 
                </div>

                <button
                  type="button"
                  class="trip-planner__train-select"
                  data-train-index="${index}"
                >
                  Select train
                </button>

              </article>
            `;
          }).join('');

          resultsContainer.hidden = false;

          resultsContainer.innerHTML = `
            <div class="trip-planner__flight-results-heading">
              <span>TRAIN RESULTS</span>
              <h3>Available train journeys</h3>
              <p>
                Train routes for your selected journey.
              </p>
            </div>

            <div class="trip-planner__train-list">
              ${cards}
            </div>
          `;

          const trainSelectButtons =
            resultsContainer.querySelectorAll(
              '.trip-planner__train-select'
            );

          trainSelectButtons.forEach((button) => {

            button.addEventListener('click', () => {

              const index =
                Number(button.dataset.trainIndex);

              const selectedTrain =
                trains[index];

              if (!selectedTrain) {
                return;
              }

              tripLegs[legIndex].transportType =
                'train';

              tripLegs[legIndex].selectedTransport =
                selectedTrain;

              console.log('Selected train data:', selectedTrain);

              renderTransportOverview();

              resultsContainer
                .querySelectorAll('.trip-planner__train-card')
                .forEach((card) => {
                  card.classList.remove('is-selected');
                });

              const selectedCard =
                button.closest('.trip-planner__train-card');

              if (selectedCard) {
                selectedCard.classList.add('is-selected');
              }

              trainSelectButtons.forEach((item) => {
                item.textContent = 'Select train';
              });

              button.textContent = 'Selected ✓';

            });

          });
        }

        function renderBuses(
            buses,
            legIndex,
            resultsContainer
        ) {

          if (!buses.length) {

            resultsContainer.hidden = false;

            resultsContainer.innerHTML = `
              <div class="trip-planner__flight-message">

                <h3>No bus journeys found</h3>

                <p>
                  No intercity bus results were found
                  for the selected route and date.
                </p>

              </div>
            `;

            return;
          }


          const cards = buses.map((bus, index) => {

            const transfersText =
              bus.transfers === 0
                ? 'Direct'
                : `${bus.transfers} transfer${bus.transfers > 1 ? 's' : ''}`;


            const priceHtml =
              bus.price !== null &&
              bus.price !== undefined
                ? `
                  <strong class="trip-planner__bus-price">
                    ${bus.currency === 'EUR' ? '€' : ''}
                    ${bus.price}
                  </strong>
                `
                : `
                  <div class="trip-planner__bus-price-unavailable">

                    <span>
                      Price unavailable
                    </span>

                    ${
                      bus.operator_link
                        ? `
                          <a
                            href="${bus.operator_link}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="trip-planner__bus-ticket-link"
                          >
                            View tickets ↗
                          </a>
                        `
                      : ''
                    }

                  </div>
                `;
 

            return `
              <article
                class="trip-planner__bus-card"
                data-bus-index="${index}"
              >

                <div class="trip-planner__bus-operator">

                  <strong>
                    ${bus.operator || 'Bus service'}
                  </strong>

                  <span>
                    ${bus.bus_name || ''}
                  </span>

                </div>


                <div class="trip-planner__bus-route">

                  <div class="trip-planner__bus-point">

                    <strong>
                      ${bus.departure_time}
                    </strong>

                    <span>
                      ${bus.start_stop}
                    </span>

                  </div>


                  <div class="trip-planner__bus-middle">

                    <span>
                      ${bus.duration}
                    </span>

                    <div class="trip-planner__bus-line"></div>

                    <small>
                      ${transfersText}
                    </small>

                  </div>


                  <div class="trip-planner__bus-point">

                    <strong>
                      ${bus.arrival_time}
                    </strong>

                    <span>
                      ${bus.end_stop}
                    </span>

                  </div>

                </div>


                <div class="trip-planner__bus-meta">

                  <span>
                    ${bus.distance || ''}
                  </span>

                  ${priceHtml}

                </div>


                <button
                  type="button"
                  class="trip-planner__bus-select"
                  data-bus-index="${index}"
                >
                  Select bus
                </button>

              </article>
            `;
 
          }).join('');


          resultsContainer.hidden = false;

          resultsContainer.innerHTML = `

            <div class="trip-planner__flight-results-heading">

              <span>
                BUS RESULTS
              </span>

              <h3>
                Available bus journeys
              </h3>

              <p>
                Intercity bus routes for your selected journey.
              </p>

            </div>


            <div class="trip-planner__bus-list">
              ${cards}
            </div>

          `;


          const busSelectButtons =
            resultsContainer.querySelectorAll(
              '.trip-planner__bus-select'
            );


          busSelectButtons.forEach((button) => {

            button.addEventListener('click', () => {

              const index =
                Number(button.dataset.busIndex);

              const selectedBus =
                buses[index];

              if (!selectedBus) {
                return;
              }

              tripLegs[legIndex].transportType =
                'bus';

              tripLegs[legIndex].selectedTransport =
                selectedBus;

              console.log('Selected bus data:', selectedBus);

              renderTransportOverview();

              resultsContainer
                .querySelectorAll('.trip-planner__bus-card')
                .forEach((card) => {

                  card.classList.remove('is-selected');

                });


              const selectedCard =
                button.closest('.trip-planner__bus-card');

              if (selectedCard) {
                selectedCard.classList.add('is-selected');
              }


              busSelectButtons.forEach((item) => {

                item.textContent = 'Select bus';

              });


              button.textContent = 'Selected ✓';

            });

          });

        }


        async function loadTrains(
          legIndex,
          resultsContainer
        ) {

          const leg =
            tripLegs[legIndex];


          if (!leg || !resultsContainer) {
            return;
          }


          resultsContainer.hidden = false;


          resultsContainer.innerHTML = `
            <div class="trip-planner__flight-loading">

              <h3>
                Searching trains...
              </h3>

              <p>
                Checking available train journeys
                from ${leg.origin}
                to ${leg.destination}.
              </p>

            </div>
          `;


          const params =
            new URLSearchParams({

              departure: leg.origin,

              arrival: leg.destination,

              date: leg.date

            });


          try {

            const response =
              await fetch(
                `/plan-your-trip/trains?${params.toString()}`,
                {
                  headers: {
                    'Accept': 'application/json'
                  }
                }
              );


            const data =
              await response.json();


            if (!response.ok || !data.success) {

              throw new Error(
                data.message ||
                'Train search failed.'
              );

            }


            renderTrains(
              data.trains,
              legIndex,
              resultsContainer
            );

          }
          catch (error) {

            console.error(
              `Trip Planner Train Error - Route ${legIndex + 1}:`,
              error
            );


            resultsContainer.innerHTML = `
              <div class="trip-planner__flight-message">

                <h3>
                  Trains unavailable
                </h3>

                <p>
                  We could not load train results
                  for ${leg.origin} → ${leg.destination}.
                  Please try again.
                </p>

              </div>
            `;

          }

        }

        async function loadBuses(
          legIndex,
          resultsContainer
        ) {

          const leg =
            tripLegs[legIndex];


          if (!leg || !resultsContainer) {
            return;
          }


          resultsContainer.hidden = false;


          resultsContainer.innerHTML = `
            <div class="trip-planner__flight-loading">

              <h3>
                Searching buses...
              </h3>

              <p>
                Checking available intercity bus journeys
                from ${leg.origin}
                to ${leg.destination}.
              </p>

            </div>
          `;


          const params =
            new URLSearchParams({

              departure: leg.origin,

              arrival: leg.destination,

              date: leg.date

            });


          try {

            const response =
              await fetch(
                `/plan-your-trip/buses?${params.toString()}`,
                {
                  headers: {
                    'Accept': 'application/json'
                  }
                }
              );

            const data =
              await response.json();


            if (!response.ok || !data.success) {

              throw new Error(
                data.message ||
                'Bus search failed.'
              );

            }


            renderBuses(
              data.buses,
              legIndex,
              resultsContainer
            );

          }
          catch (error) {

            console.error(
              `Trip Planner Bus Error - Route ${legIndex + 1}:`,
              error
            );


            resultsContainer.innerHTML = `
              <div class="trip-planner__flight-message">

                <h3>
                  Buses unavailable
                </h3>

                <p>
                  We could not load bus results
                  for ${leg.origin} → ${leg.destination}.
                  Please try again.
                </p>

              </div>
            `;

          }

        }


        /* =====================================================
           FLIGHT API
           ===================================================== */

        async function loadFlights(
          legIndex,
          resultsContainer
        ) {

          const leg =
            tripLegs[legIndex];


          if (!leg || !resultsContainer) {
            return;
          }


          resultsContainer.hidden = false;


          resultsContainer.innerHTML = `
            <div class="trip-planner__flight-loading">

              <h3>
                Searching flights...
              </h3>

              <p>
                Checking available flights
                from ${leg.origin}
                to ${leg.destination}.
              </p>

            </div>
          `;


          const params =
            new URLSearchParams({

              departure: leg.origin,

              arrival: leg.destination,

              date: leg.date,

              adults: travellers.value

            });


          try {

            const response =
              await fetch(
                `/plan-your-trip/flights?${params.toString()}`,
                {
                  headers: {
                    'Accept': 'application/json'
                  }
                }
              );


            const data =
              await response.json();


            if (!response.ok || !data.success) {

              throw new Error(
                data.message ||
                'Flight search failed.'
              );

            }


            renderFlights(
              data.flights,
              legIndex,
              resultsContainer
            );

          }
          catch (error) {

            console.error(
              `Trip Planner Flight Error - Route ${legIndex + 1}:`,
              error
            );


            resultsContainer.innerHTML = `
              <div class="trip-planner__flight-message">

                <h3>
                  Flights unavailable
                </h3>

                <p>
                  We could not load flight results
                  for ${leg.origin} → ${leg.destination}.
                  Please try again.
                </p>

              </div>
            `;

          }

        }

        /* =====================================================
           STEP 1 → STEP 2

	   Validate all trip legs and prepare weather
           information for the complete journey.
           ===================================================== */

          continueButton.addEventListener(
            'click',
            () => {

               /*
                * Read the latest route values from the form.
                */
               collectTripLegs();


               /*
                * At least one route must exist.
                */
               if (!tripLegs.length) {

                 alert(
                   'Please add at least one route.'
                 );

                 return;
               }


               /*
                * Every route must contain: From To Travel date
                */
               const incompleteLeg =
                 tripLegs.find((leg) => {

                   return (
                     !leg.origin ||
                     !leg.destination ||
                     !leg.date
                   );

                 });


               if (incompleteLeg) {

                 alert(
                   'Please complete all route details.'
                 );

                 return;
               }

 
               /* Overall trip end date is still required.
                * We use it for: final destination weather, stay calculation, total trip duration
                */
               if (!endDate.value) {

                 alert(
                  'Please select the trip end date.'
                 );

                 return;
               }


               /* Route dates must be chronological. */
               for (
                 let index = 1;
                 index < tripLegs.length;
                 index++
               ) {

                 const previousDate =
                   new Date(
                     tripLegs[index - 1].date +
                     'T00:00:00'
                   );

                 const currentDate =
                   new Date(
                     tripLegs[index].date +
                     'T00:00:00'
                   );


                 if (currentDate < previousDate) {
  
                   alert(
                     `Route ${index + 1} cannot be before Route ${index}.`
                   );

                   return;
                 }

               }


               /* Overall trip start = first route's travel date. */
          
               const firstLeg =
                 tripLegs[0];

               const lastLeg =
                 tripLegs[
                 tripLegs.length - 1
               ];


               const start =
                 new Date(
                   firstLeg.date +
                   'T00:00:00'
                 );


               const end =
                 new Date(
                   endDate.value +
                   'T00:00:00'
                 );


               const lastTravelDate =
                 new Date(
                   lastLeg.date +
                   'T00:00:00'
                 );


               /* Trip end date cannot be before the final route. */
               if (end < lastTravelDate) {

                 alert(
                   'Trip end date cannot be before your final route date.'
                 );

                 return;
               }


               /* Calculate total trip duration. */
               const millisecondsPerDay =
                 1000 * 60 * 60 * 24;


               const days =
                 Math.round(
                   (end - start) /
                   millisecondsPerDay
                 ) + 1;


               const formatter =
                 new Intl.DateTimeFormat(
                   'en-GB',
                   {
                     day: 'numeric',
                     month: 'short',
                     year: 'numeric'
                   }
                 );


               /* Build city stay periods. */
               const stays =
                 buildCityStays();


               /* First and final city of the complete journey. */
               const journeyOrigin =
                 firstLeg.origin;

               const journeyDestination =
                 lastLeg.destination;


               /* ==================================================
                  WEATHER SUMMARY
                  ================================================== */

               if (tripLegs.length === 1) {

                 weatherDestination.textContent =
                   journeyDestination;

               }
               else {

                 weatherDestination.textContent =
                   `${stays.length} destinations`;

               }


               weatherDates.textContent =
                 formatter.format(start) +
                 ' → ' +
                 formatter.format(end);


               weatherDuration.textContent =
                 days === 1
                   ? '1 day'
                   : `${days} days`;


               /* ==================================================
                  TRIP OVERVIEW
                  ================================================== */

               if (tripLegs.length === 1) {

                 overviewDestination.textContent =
                   journeyDestination;

               }
               else {

                 overviewDestination.textContent =
                   `${journeyOrigin} → ${journeyDestination}`;

               }


               overviewDates.textContent =
                 formatter.format(start) +
                 ' → ' +
                 formatter.format(end);


               overviewTravellers.textContent =
                 travellers.options[
                   travellers.selectedIndex
                 ].text;


               /* ==================================================
                  SWITCH TO WEATHER PANEL
                  ================================================== */

               panels[0].hidden = true;

               panels[1].hidden = false;


               tripOverview.hidden = false;


               steps[0].classList.remove(
                 'is-active'
               );

               steps[1].classList.add(
                 'is-active'
               );


               /* ==================================================
                  LOAD WEATHER FOR ALL DESTINATIONS
                  ================================================== */

               loadTripWeather();


               planner.scrollIntoView({
                 behavior: 'smooth',
                 block: 'start'
               });

            }
          );

        /* =====================================================
           STEP 2 → STEP 1
           ===================================================== */

        if (backButton) {

          backButton.addEventListener(
            'click',
            () => {

              panels[1].hidden = true;

              panels[0].hidden = false;


              tripOverview.hidden = true;


              steps[1].classList.remove(
                'is-active'
              );

              steps[0].classList.add(
                'is-active'
              );


              planner.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });

            }
          );

        }


        /* =====================================================
           STEP 2 → STEP 3
           ===================================================== */

        if (transportButton) {

          transportButton.addEventListener(
            'click',
            () => {

              panels[1].hidden = true;

              panels[2].hidden = false;


              collectTripLegs();

              renderTransportLegs();

              steps[1].classList.remove(
                'is-active'
              );

              steps[2].classList.add(
                'is-active'
              );


              planner.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });

            }
          );

        }


        /* =====================================================
           STEP 3 → STEP 2
           ===================================================== */

        if (transportBackButton) {

          transportBackButton.addEventListener(
            'click',
            () => {

              panels[2].hidden = true;

              panels[1].hidden = false;


              steps[2].classList.remove(
                'is-active'
              );

              steps[1].classList.add(
                'is-active'
              );


              planner.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });

            }
          );

        }

        /* =====================================================
           STEP 3 → STEP 4
           ===================================================== */

        if (stayButton) {

          stayButton.addEventListener(
            'click',
            () => {

              openStayStep();

            }
          );

        }


        /* =====================================================
           STEP 4 → STEP 3
           ===================================================== */

        if (stayBackButton) {

          stayBackButton.addEventListener(
            'click',
            () => {

              panels[3].hidden = true;

              panels[2].hidden = false;

              steps[3].classList.remove(
                'is-active'
              );

              steps[2].classList.add(
                'is-active'
              );

              planner.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });

            }
          );

        }

        /* =====================================================
           STEP 4 → STEP 5
           ===================================================== */

        if (stayContinueButton) {

          stayContinueButton.addEventListener(
            'click',
            () => {

              const missingStay =
                staySelections.find(
                  (stay) =>
                    stay.nights > 0 &&
                    !stay.selectedStay
                );


              if (missingStay) {

                alert(
                  `Please select accommodation for ${missingStay.city}.`
                );

                return;
              }


              openSummaryStep();

            }
          );

        }
        /* =====================================================
           CALENDAR DATE HELPERS
           ===================================================== */

        /* Convert values such as: "10:05 AM" into: "10:05:00" */

        function calendarTimeTo24Hour(timeValue) {

          if (!timeValue) {
            return null;
          }

          const value =
            String(timeValue).trim();

          const match =
            value.match(
              /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
            );

          if (!match) {
            return null;
          }

          let hours =
            Number(match[1]);

          const minutes =
            match[2];

          const period =
            match[3].toUpperCase();


          if (
            period === 'PM' &&
            hours !== 12
          ) {

            hours += 12;

          }


          if (
            period === 'AM' &&
            hours === 12
          ) {

            hours = 0;

          }


          return (
            String(hours).padStart(2, '0') +
            ':' +
            minutes +
            ':00'
          );

        }


        /*
         * Build start/end datetimes
         * for one transport leg.
         */
        function buildCalendarTransportDates(leg) {

          const transport =
            leg?.selectedTransport;


          if (
            !leg?.date ||
            !transport
          ) {

            return null;

          }


          /*
           * FLIGHT Example: 2026-08-28 07:15
           */
          if (
            leg.transportType === 'flight'
          ) {

            if (
              !transport.departure_time ||
              !transport.arrival_time
            ) {

              return null;

            }


            return {

              start:
                transport.departure_time.replace(
                  ' ',
                  'T'
                ) + ':00',

              end:
                transport.arrival_time.replace(
                  ' ',
                  'T'
                ) + ':00'

            };

          }


          /*
           * TRAIN / BUS Example: 10:05 AM
           */
          const departureTime =
            calendarTimeTo24Hour(
              transport.departure_time
            );

          const arrivalTime =
            calendarTimeTo24Hour(
              transport.arrival_time
            );


          if (
            !departureTime ||
            !arrivalTime
          ) {

            return null;

          }


          const start =
            new Date(
              `${leg.date}T${departureTime}`
            );

          let end =
            new Date(
              `${leg.date}T${arrivalTime}`
            );


          /*
           * If arrival is earlier than departure,
           * the journey arrives the following day.
           */
          if (end <= start) {

            end.setDate(
              end.getDate() + 1
            );

          }


          const formatLocalDateTime =
            (date) => {

              const year =
                date.getFullYear();

              const month =
                String(
                  date.getMonth() + 1
                ).padStart(2, '0');

              const day =
                String(
                  date.getDate()
                ).padStart(2, '0');

              const hours =
                String(
                  date.getHours()
                ).padStart(2, '0');

              const minutes =
                String(
                  date.getMinutes()
                ).padStart(2, '0');


              return (
                `${year}-${month}-${day}` +
                `T${hours}:${minutes}:00`
              );

            };


          return {

            start:
              formatLocalDateTime(start),

            end:
              formatLocalDateTime(end)

          };

        }

        /* =====================================================
           ADD TRIP TO CALENDAR
           ===================================================== */

        if (summaryCalendarButton) {

          summaryCalendarButton.addEventListener(
            'click',
            async () => {

              if (!tripLegs.length) {
                alert('Trip information is not available.');
                return;
              }


              const firstLeg =
                tripLegs[0];

              const lastLeg =
                tripLegs[
                  tripLegs.length - 1
                ];


              if (
                !firstLeg?.date ||
                !endDate?.value
              ) {

                alert(
                  'Trip dates are not available.'
                );

                return;
              }


              const journeyTitle =
                `Trip: ${firstLeg.origin} → ${lastLeg.destination}`;


              /*
               * Build readable itinerary notes.
               */
              const notes = [];


              tripLegs.forEach(
                (leg, index) => {

                  notes.push(
                    `Route ${index + 1}: ${leg.origin} → ${leg.destination}`
                  );

                  notes.push(
                    `Date: ${leg.date}`
                  );


                  const transport =
                    leg.selectedTransport;


                  if (transport) {

                    if (
                      leg.transportType === 'flight'
                    ) {

                      notes.push(
                        `Transport: Flight - ${transport.airline || 'Flight'}`
                      );

                      notes.push(
                        `${formatTime(transport.departure_time)} → ${formatTime(transport.arrival_time)}`
                      );

                    }
                    else if (
                      leg.transportType === 'train'
                    ) {

                      notes.push(
                        `Transport: Train - ${transport.operator || 'Train'}`
                      );

                      notes.push(
                        `${transport.departure_time || ''} → ${transport.arrival_time || ''}`
                      );

                    }
                    else if (
                      leg.transportType === 'bus'
                    ) {

                      notes.push(
                        `Transport: Bus - ${transport.operator || 'Bus'}`
                      );

                      notes.push(
                        `${transport.departure_time || ''} → ${transport.arrival_time || ''}`
                      );

                    }

                  }


                  const stay =
                    staySelections.find(
                      (item) =>
                        item.legIndex === index
                    );


                  if (
                    stay &&
                    stay.nights > 0 &&
                    stay.selectedStay
                  ) {

                    notes.push(
                      `Stay in ${stay.city}: ${stay.selectedStay.name || 'Accommodation'}`
                    );

                    if (
                      stay.selectedStay.total_price
                    ) {

                      notes.push(
                        `Stay price: ${stay.selectedStay.total_price}`
                      );

                    }

                  }


                  notes.push('');

                }
              );


              const calendarEvents =
                tripLegs.map(
                  (leg, index) => {

                    const dates =
                      buildCalendarTransportDates(
                        leg
                      );


                    if (!dates) {
                      return null;
                    }


                    const transport =
                      leg.selectedTransport;


                    const eventNotes = [];

                    eventNotes.push(
                      `Route ${index + 1}: ${leg.origin} → ${leg.destination}`
                    );

                    eventNotes.push(
                      `Date: ${leg.date}`
                    );


                    if (
                      leg.transportType === 'flight'
                    ) {

                      eventNotes.push(
                        `Transport: Flight - ${transport.airline || 'Flight'}`
                      );

                      eventNotes.push(
                        `${formatTime(transport.departure_time)} → ${formatTime(transport.arrival_time)}`
                      );

                    }
                    else if (
                      leg.transportType === 'train'
                    ) {

                      eventNotes.push(
                        `Transport: Train - ${transport.operator || 'Train'}`
                      );

                      eventNotes.push(
                        `${transport.departure_time || ''} → ${transport.arrival_time || ''}`
                      );

                    }
                    else if (
                      leg.transportType === 'bus'
                    ) {

                      eventNotes.push(
                        `Transport: Bus - ${transport.operator || 'Bus'}`
                      );

                      eventNotes.push(
                        `${transport.departure_time || ''} → ${transport.arrival_time || ''}`
                      );

                    }


                    const stay =
                      staySelections.find(
                        (item) =>
                          item.legIndex === index
                      );


                    if (
                      stay &&
                      stay.nights > 0 &&
                      stay.selectedStay
                    ) {

                      eventNotes.push(
                        `Stay in ${stay.city}: ${stay.selectedStay.name || 'Accommodation'}`
                      );


                      if (
                        stay.selectedStay.total_price
                      ) {

                        eventNotes.push(
                          `Stay price: ${stay.selectedStay.total_price}`
                        );

                      }

                    }


                    return {

                      title:
                        `Trip: ${leg.origin} → ${leg.destination}`,

                      start:
                        dates.start,

                      end:
                        dates.end,

                      location:
                        `${leg.origin} → ${leg.destination}`,

                      notes:
                        eventNotes.join('\n')

                    };

                  }
                )
                .filter(Boolean);

              const originalText =
                summaryCalendarButton.textContent;


              summaryCalendarButton.disabled =
                true;

              summaryCalendarButton.textContent =
                'Adding to calendar...';


              try {

                const response =
                  await fetch(
                    '/plan-your-trip/add-to-calendar',
                    {
                      method: 'POST',

                      headers: {
                        'Content-Type':
                          'application/json',

                        'Accept':
                          'application/json'
                      },

                      body:
                        JSON.stringify(
                          {
                            events:
                              calendarEvents
                          }
                        )
                    }
                  );


                const data =
                  await response.json();


                if (
                  !response.ok ||
                  !data.success
                ) {

                  throw new Error(
                    data.message ||
                    'Trip could not be added to calendar.'
                  );

                }


                summaryCalendarButton.textContent =
                  '✓ Added to calendar';


                /*
                 * Open the calendar after creation.
                 */
                window.location.href =
                  '/calendar';

              }
              catch (error) {

                console.error(
                  'Add to calendar error:',
                  error
                );


                alert(
                  error.message ||
                  'The trip could not be added to the calendar.'
                );


                summaryCalendarButton.disabled =
                  false;

                summaryCalendarButton.textContent =
                  originalText;

              }

            }
          );

        }

        /* =====================================================
           STEP 5 → STEP 4
           ===================================================== */

        if (summaryBackButton) {

          summaryBackButton.addEventListener(
            'click',
            () => {

              if (summaryPanel) {
                summaryPanel.hidden = true;
              }


              if (panels[3]) {
                panels[3].hidden = false;
              }

              if (tripOverview) {
                tripOverview.hidden = false;
              }

              steps[4]?.classList.remove(
                'is-active'
              );

              steps[3]?.classList.add(
                'is-active'
              );


              planner.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });

            }
          );

        }

        /* ==========================================================
           STAY ACCORDION
           ========================================================== */

        if (stayDestinationsContainer) {

          stayDestinationsContainer.addEventListener(
            'click',
            (event) => {

              const toggle =
                event.target.closest(
                  '.trip-planner__stay-toggle'
                );


              /*
               * Ignore hotel buttons and every other click.
               */
              if (!toggle || toggle.disabled) {
                return;
              }


              const stayIndex =
                Number(
                  toggle.dataset.stayToggle
                );


              if (
                Number.isNaN(stayIndex) ||
                !staySelections[stayIndex]
              ) {
                return;
              }


              const stay =
                staySelections[stayIndex];


              /*
               * Zero-night destinations never open
               * and never request hotels.
               */
              if (stay.nights <= 0) {
                return;
              }


              const accordion =
                stayDestinationsContainer.querySelector(
                  `[data-stay-accordion="${stayIndex}"]`
                );


              if (!accordion) {
                return;
              }


              const isOpening =
                accordion.hidden;


              accordion.hidden =
                !isOpening;


              toggle.classList.toggle(
                'is-open',
                isOpening
              );


              const chevron =
                toggle.querySelector(
                  '.trip-planner__stay-chevron'
                );


              if (chevron) {
                chevron.textContent =
                  isOpening
                    ? '▲'
                    : '▼';
              }


              /*
               * Hotels already loaded:
               * only open/close the accordion.
               */
              if (
                !isOpening ||
                Array.isArray(stay.hotels)
              ) {
                return;
              }


              const resultsContainer =
                accordion.querySelector(
                  `[data-stay-results="${stayIndex}"]`
                );


              if (!resultsContainer) {
                return;
              }


              resultsContainer.innerHTML = `
                <div class="trip-planner__stay-loading">

                  <span>
                    ⏳
                  </span>

                  <div>

                    <strong>
                      Searching stays...
                    </strong>

                    <p>
                      Finding accommodation in ${stay.city}.
                    </p>

                  </div>

                </div>
              `;


              loadStayResults(
                stayIndex,
                resultsContainer
              );

            }
          );

        }


        /* ==========================================================
           STAY SELECTION

           Each destination has its own selected accommodation.
           ========================================================== */

        if (stayDestinationsContainer) {

          stayDestinationsContainer.addEventListener(
            'click',
            (event) => {

              const button =
                event.target.closest(
                  '.trip-planner__stay-select'
                );

              if (!button) {
                return;
              }


              const stayIndex =
                Number(
                  button.dataset.stayIndex
                );

              const hotelIndex =
                Number(
                  button.dataset.hotelIndex
                );


              if (
                Number.isNaN(stayIndex) ||
                Number.isNaN(hotelIndex) ||
                !staySelections[stayIndex]
              ) {
                return;
              }


              const stay =
                staySelections[stayIndex];


              const hotel =
                stay.hotels?.[hotelIndex];

              if (!hotel) {
                return;
              }


              /*
               * Save the concrete accommodation selected for this destination.
               */
              stay.selectedStay =
                hotel;


              /* Find only the current destination card. */
              const stayCard =
                button.closest(
                  '.trip-planner__stay-card'
                );


              if (!stayCard) {
                return;
              }


              /* Remove previous selection only inside this destination. */
              stayCard
                .querySelectorAll(
                  '.trip-planner__stay-result'
                )
                .forEach((item) => {

                  item.classList.remove(
                    'is-selected'
                  );

                });


              stayCard
                .querySelectorAll(
                  '.trip-planner__stay-select'
                )
                .forEach((item) => {

                  item.classList.remove(
                    'is-selected'
                  );

                  item.textContent =
                    'Select stay';

                });


              /* Highlight the selected hotel. */
              const selectedResult =
                button.closest(
                  '.trip-planner__stay-result'
                );


              selectedResult?.classList.add(
                'is-selected'
              );


              button.classList.add(
                'is-selected'
              );

              button.textContent =
                '✓ Selected';

              renderStayOverview();

              console.log(
                'Stay selected:',
                {
                  stayIndex,
                  city: stay.city,
                  hotel: hotel.name,
                  price: hotel.total_price
                }
              );

            }
          );

        }


        /* ==========================================================
           TRANSPORT SELECTION - MULTI ROUTE

           Each trip leg has its own independent transport choice.
           ========================================================== */

        if (transportLegsContainer) {

          transportLegsContainer.addEventListener(
            'click',
            (event) => {

              const option =
                event.target.closest(
                  '.trip-planner__transport-option'
                );


              if (!option) {
                return;
              }


              const legIndex =
                Number(
                  option.dataset.legIndex
                );


              const transportType =
                option.dataset.transport;
 

              if (
                Number.isNaN(legIndex) ||
                !tripLegs[legIndex]
              ) {
                return;
              }


              /* Find only the current route card. */
              const transportLeg =
                option.closest(
                  '.trip-planner__transport-leg'
                );


              if (!transportLeg) {
                return;
              }


              /* Clear selection ONLY inside the current route. */
              transportLeg
                .querySelectorAll(
                  '.trip-planner__transport-option'
                )
                .forEach((item) => {

                  item.classList.remove(
                    'is-selected'
                  );

                });


              /* Select clicked transport. */
              option.classList.add(
                'is-selected'
              );


              /* Save selection in trip state. */
              tripLegs[legIndex].transportType =
                transportType;


              /* A new transport type means the previously selected concrete result
               * is no longer valid. */
              tripLegs[legIndex].selectedTransport =
                null;


              renderTransportOverview();

              console.log(
                'Transport selected:',
                {
                  legIndex,
                  route:
                    `${tripLegs[legIndex].origin} → ${tripLegs[legIndex].destination}`,
                  transportType
                }
              );


              /* Results container belonging only to this route. */
              const resultsContainer =
                transportLeg.querySelector(
                  `[data-transport-results="${legIndex}"]`
                );


              if (!resultsContainer) {
                return;
              }


              resultsContainer.hidden = false;


              /*
               * Load results only for the selected route
               * and selected transport type.
               */

              if (transportType === 'flight') {

                loadFlights(
                  legIndex,
                  resultsContainer
                );

                return;
              }


              if (transportType === 'train') {

                loadTrains(
                  legIndex,
                  resultsContainer
                );

                return;
              }


              if (transportType === 'bus') {

                loadBuses(
                  legIndex,
                  resultsContainer
                );

                return;
              }
            }
          );

        }

      });

    }
  };

})(Drupal, once);
