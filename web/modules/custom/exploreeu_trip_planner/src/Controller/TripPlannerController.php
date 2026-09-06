<?php

namespace Drupal\exploreeu_trip_planner\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\exploreeu_trip_planner\Service\StayService;
use Drupal\exploreeu_trip_planner\Service\TransportService;
use Drupal\exploreeu_trip_planner\Service\WeatherService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class TripPlannerController extends ControllerBase {

  protected WeatherService $weatherService;

  protected TransportService $transportService;

  protected StayService $stayService;

  public function __construct(
    WeatherService $weather_service,
    TransportService $transport_service,
    StayService $stay_service
  ) {
    $this->weatherService = $weather_service;
    $this->transportService = $transport_service;
    $this->stayService = $stay_service;
  }

  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('exploreeu_trip_planner.weather'),
      $container->get('exploreeu_trip_planner.transport'),
      $container->get('exploreeu_trip_planner.stay')
    );
  }

  public function page(): array {
    return [
      '#theme' => 'trip_planner',
      '#attached' => [
        'library' => [
          'exploreeu_trip_planner/trip_planner',
        ],
      ],
    ];
  }

  /**
   * Weather endpoint.
   */
  public function weather(Request $request): JsonResponse {

    $destination = trim((string) $request->query->get('destination'));
    $start_date = trim((string) $request->query->get('start_date'));
    $end_date = trim((string) $request->query->get('end_date'));

    if (!$destination || !$start_date || !$end_date) {
      return new JsonResponse([
        'success' => FALSE,
        'message' => 'Destination and travel dates are required.',
      ], 400);
    }

    $location = $this->weatherService->getCoordinates($destination);

    if (!$location) {
      return new JsonResponse([
        'success' => FALSE,
        'message' => 'Destination could not be found.',
      ], 404);
    }

    $forecast = $this->weatherService->getForecast(
      (float) $location['latitude'],
      (float) $location['longitude'],
      $start_date,
      $end_date
    );

    return new JsonResponse([
      'success' => TRUE,
      'location' => $location,
      'forecast' => $forecast,
    ]);
  }

  /**
   * Flight search endpoint.
   */
  public function flights(Request $request): JsonResponse {

    $departure = trim(
      (string) $request->query->get('departure')
    );

    $arrival = trim(
      (string) $request->query->get('arrival')
    );

    $date = trim(
      (string) $request->query->get('date')
    );

    $adults = (int) $request->query->get('adults', 1);

    if (!$departure || !$arrival || !$date) {
      return new JsonResponse([
        'success' => FALSE,
        'message' => 'Departure, arrival and date are required.',
      ], 400);
    }

    if ($adults < 1) {
      $adults = 1;
    }

    try {

      $flights = $this->transportService->searchFlights(
        $departure,
        $arrival,
        $date,
        $adults
      );

      return new JsonResponse([
        'success' => TRUE,
        'departure' => $departure,
        'arrival' => $arrival,
        'date' => $date,
        'adults' => $adults,
        'flights' => $flights,
      ]);

    }
    catch (\Throwable $e) {

      \Drupal::logger('exploreeu_trip_planner')->error(
        'Flight search failed: @message',
        [
          '@message' => $e->getMessage(),
        ]
      );

      return new JsonResponse([
        'success' => FALSE,
        'message' => 'Flight search could not be completed.',
      ], 500);
    }
  }

  /**
   * Train search endpoint.
   */
  public function trains(Request $request): JsonResponse {

    $departure = trim(
      (string) $request->query->get('departure')
    );

    $arrival = trim(
      (string) $request->query->get('arrival')
    );

    $date = trim(
      (string) $request->query->get('date')
    );

    if (!$departure || !$arrival || !$date) {
      return new JsonResponse([
        'success' => FALSE,
        'message' => 'Departure, arrival and date are required.',
      ], 400);
    }

    try {

      $trains = $this->transportService->searchTrains(
        $departure,
        $arrival,
        $date
      );

      return new JsonResponse([
        'success' => TRUE,
        'departure' => $departure,
        'arrival' => $arrival,
        'date' => $date,
        'trains' => $trains,
      ]);

    }
    catch (\Throwable $e) {

      \Drupal::logger('exploreeu_trip_planner')->error(
        'Train search failed: @message',
        [
          '@message' => $e->getMessage(),
        ]
      );

      return new JsonResponse([
        'success' => FALSE,
        'message' => 'Train search could not be completed.',
      ], 500);
    }
  }

  /**
   * Bus search endpoint.
   */
  public function buses(Request $request): JsonResponse {

    $departure = trim(
      (string) $request->query->get('departure')
    );

    $arrival = trim(
      (string) $request->query->get('arrival')
    );

    $date = trim(
      (string) $request->query->get('date')
    );

    if (!$departure || !$arrival || !$date) {
      return new JsonResponse([
        'success' => FALSE,
        'message' => 'Departure, arrival and date are required.',
      ], 400);
    }

    try {

      $buses = $this->transportService->searchBuses(
        $departure,
        $arrival,
        $date
      );

      return new JsonResponse([
        'success' => TRUE,
        'departure' => $departure,
        'arrival' => $arrival,
        'date' => $date,
        'buses' => $buses,
      ]);

    }
    catch (\Throwable $e) {

      \Drupal::logger('exploreeu_trip_planner')->error(
        'Bus search failed: @message',
        [
          '@message' => $e->getMessage(),
        ]
      );

      return new JsonResponse([
        'success' => FALSE,
        'message' => 'Bus search could not be completed.',
      ], 500);
    }
  }

  /**
   * Hotel search endpoint.
   */
  public function hotels(Request $request): JsonResponse {

    $city = trim(
      (string) $request->query->get('city')
    );

    $check_in = trim(
      (string) $request->query->get('check_in')
    );

    $check_out = trim(
      (string) $request->query->get('check_out')
    );

    $adults = (int) $request->query->get(
      'adults',
      1
    );

    if (!$city || !$check_in || !$check_out) {
      return new JsonResponse([
        'success' => FALSE,
        'message' =>
          'City, check-in and check-out dates are required.',
      ], 400);
    }

    if ($adults < 1) {
      $adults = 1;
    }

    try {

      $location =
        $this->weatherService->getCoordinates(
          $city
        );

      $hotel_destination =
        $city;

      if ($location) {

        $hotel_destination =
          $location['name'];

        if (!empty($location['country'])) {

          $hotel_destination .=
            ', ' . $location['country'];

        }
      }

      $hotels =
        $this->stayService->searchHotels(
          $hotel_destination,
          $check_in,
          $check_out,
          $adults
        );

      return new JsonResponse([
        'success' => TRUE,
        'city' => $city,
        'resolved_city' => $hotel_destination,
        'check_in' => $check_in,
        'check_out' => $check_out,
        'adults' => $adults,
        'hotels' => $hotels,
      ]);

    }
    catch (\Throwable $e) {

      \Drupal::logger(
        'exploreeu_trip_planner'
      )->error(
        'Hotel search failed: @message',
        [
          '@message' => $e->getMessage(),
        ]
      );

      return new JsonResponse([
        'success' => FALSE,
        'message' =>
          'Hotel search could not be completed.',
      ], 500);
    }
  }
  /**
   * Add a planned trip to the calendar.
   */
  public function addToCalendar(Request $request): JsonResponse {

    try {

      $data = json_decode(
        $request->getContent(),
        TRUE
      );

      if (!is_array($data)) {
        return new JsonResponse([
          'success' => FALSE,
          'message' => 'Invalid request data.',
        ], 400);
      }

      $events =
        $data['events'] ?? [];


      if (
        !is_array($events) ||
        empty($events)
      ) {

        return new JsonResponse([
          'success' => FALSE,
          'message' =>
            'No calendar events were provided.',
        ], 400);

      }

      $site_timezone =
        new \DateTimeZone(
          date_default_timezone_get()
        );

      $utc_timezone =
        new \DateTimeZone('UTC');


      /*
       * Find the "Trip" term from
       * the Event Types vocabulary.
       */
      $terms =
        $this->entityTypeManager()
          ->getStorage('taxonomy_term')
          ->loadByProperties([
            'vid' => 'event_types',
            'name' => 'Trip',
          ]);

      $trip_term =
        reset($terms);


      /*
       * Create one Calendar Event
       * for every transport leg.
       */
      $event_ids = [];


      foreach (
        $events as $event_data
      ) {

        if (!is_array($event_data)) {
          continue;
        }


        $title =
          trim(
            (string) (
              $event_data['title'] ?? ''
            )
          );

        $start =
          trim(
            (string) (
              $event_data['start'] ?? ''
            )
          );

        $end =
          trim(
            (string) (
              $event_data['end'] ?? ''
            )
          );

        $location =
          trim(
            (string) (
              $event_data['location'] ?? ''
            )
          );

        $notes =
          trim(
            (string) (
              $event_data['notes'] ?? ''
            )
          );


        /*
         * Skip invalid transport events.
         */
        if (
          !$title ||
          !$start ||
          !$end
        ) {

          continue;

        }


        /*
         * The browser sends local European
         * date/time values.
         *
         * Drupal datetime fields are stored
         * internally in UTC.
         */
        $start_datetime =
          new \DateTime(
            $start,
            $site_timezone
          );

        $end_datetime =
          new \DateTime(
            $end,
            $site_timezone
          );


        $start_datetime->setTimezone(
          $utc_timezone
        );

        $end_datetime->setTimezone(
          $utc_timezone
        );


        $start_utc =
          $start_datetime->format(
            'Y-m-d\TH:i:s'
          );

        $end_utc =
          $end_datetime->format(
            'Y-m-d\TH:i:s'
          );


        $values = [

          'type' =>
            'calendar_event',

          'title' =>
            $title,

          'field_event_dates' => [
            'value' =>
              $start_utc,

            'end_value' =>
              $end_utc,
          ],

          'field_event_location' =>
            $location,

          'field_event_notes' => [
            'value' =>
              $notes,

            'format' =>
              'plain_text',
          ],

          'status' =>
            1,

        ];


        if ($trip_term) {

          $values['field_event_type'] = [
            'target_id' =>
              $trip_term->id(),
          ];

        }


        $event =
          Node::create(
            $values
          );

        $event->save();


        $event_ids[] =
          $event->id();

      }


      if (empty($event_ids)) {

        return new JsonResponse([
          'success' => FALSE,
          'message' =>
            'No valid calendar events could be created.',
        ], 400);

      }


      return new JsonResponse([
        'success' => TRUE,
        'message' =>
          count($event_ids) === 1
            ? 'Trip added to calendar.'
            : 'Trip legs added to calendar.',
        'event_ids' =>
          $event_ids,
      ]);

    }

    catch (\Throwable $e) {

      \Drupal::logger('exploreeu_trip_planner')->error(
        'Calendar event creation failed: @message',
        [
          '@message' => $e->getMessage(),
        ]
      );

      return new JsonResponse([
        'success' => FALSE,
        'message' => 'The trip could not be added to the calendar.',
      ], 500);

    }

  }

}

