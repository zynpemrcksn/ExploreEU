<?php

namespace Drupal\exploreeu_trip_planner\Service;

use Drupal\Core\Http\ClientFactory;

class TransportService {

  /**
   * HTTP client.
   */
  protected $httpClient;

  /**
   * Creates the transport service.
   */
  public function __construct(ClientFactory $http_client_factory) {
    $this->httpClient = $http_client_factory->fromOptions([
      'timeout' => 20,
    ]);
  }


  /**
   * Finds airports for a city using Google Flights Autocomplete.
   */
  public function getAirports(string $city): array {

    $api_key = getenv('SERPAPI_KEY');

    if (!$api_key) {
      throw new \RuntimeException(
        'SERPAPI_KEY environment variable is not configured.'
      );
    }

    $response = $this->httpClient->get(
      'https://serpapi.com/search.json',
      [
        'query' => [
          'engine' => 'google_flights_autocomplete',
          'q' => $city,
          'hl' => 'en',
          'api_key' => $api_key,
        ],
      ]
    );

    $data = json_decode(
      $response->getBody()->getContents(),
      TRUE
    );

    if (empty($data['suggestions'])) {
      return [];
    }

    /*
     * Öncelikle tam şehir sonucunu bulmaya çalış.
     */
    $selected_suggestion = NULL;

    foreach ($data['suggestions'] as $suggestion) {

      if (
        ($suggestion['type'] ?? '') === 'city' &&
        strcasecmp(
          trim($suggestion['name'] ?? ''),
          trim($city)
        ) === 0
      ) {
        $selected_suggestion = $suggestion;
        break;
      }
    }

    /*
     * Tam eşleşme yoksa ilk city sonucunu kullan.
     */
    if (!$selected_suggestion) {

      foreach ($data['suggestions'] as $suggestion) {

        if (($suggestion['type'] ?? '') === 'city') {
          $selected_suggestion = $suggestion;
          break;
        }
      }
    }

    if (
      !$selected_suggestion ||
      empty($selected_suggestion['airports'])
    ) {
      return [];
    }

    $airports = [];

    foreach ($selected_suggestion['airports'] as $airport) {

      if (empty($airport['id'])) {
        continue;
      }

      $name = $airport['name'] ?? '';

      /*
       * Google Flights bazı şehirlerde tren istasyonlarını da
       * sonuç listesine dahil edebiliyor.
       *
       * Flight search için yalnızca gerçek havaalanlarını tutuyoruz.
       */

      $airports[] = [
        'id' => $airport['id'],
        'name' => $name,
        'city' => $airport['city'] ?? '',
        'distance' => $airport['distance'] ?? '',
      ];
    }

    return $airports;
  }


  /**
   * Searches Google Flights through SerpApi.
   *
   * Departure and arrival are city names.
   */
  public function searchFlights(
    string $departure_city,
    string $arrival_city,
    string $date,
    int $adults = 1
  ): array {

    $api_key = getenv('SERPAPI_KEY');

    if (!$api_key) {
      throw new \RuntimeException(
        'SERPAPI_KEY environment variable is not configured.'
      );
    }

    /*
     * Find every relevant airport for both cities.
     */
    $departure_airports =
      $this->getAirports($departure_city);

    $arrival_airports =
      $this->getAirports($arrival_city);

    if (empty($departure_airports)) {
      throw new \RuntimeException(
        'No departure airports found for ' . $departure_city
      );
    }

    if (empty($arrival_airports)) {
      throw new \RuntimeException(
        'No arrival airports found for ' . $arrival_city
      );
    }

    /*
     * Convert airport arrays to comma separated IATA codes.
     */
    $departure_ids = implode(
      ',',
      array_column($departure_airports, 'id')
    );

    $arrival_ids = implode(
      ',',
      array_column($arrival_airports, 'id')
    );

    /*
     * Search all airport combinations in one Google Flights query.
     */
    $response = $this->httpClient->get(
      'https://serpapi.com/search.json',
      [
        'query' => [
          'engine' => 'google_flights',
          'departure_id' => $departure_ids,
          'arrival_id' => $arrival_ids,
          'outbound_date' => $date,
          'type' => 2,
          'adults' => max(1, $adults),
          'currency' => 'EUR',
          'hl' => 'en',
          'api_key' => $api_key,
        ],
      ]
    );

    $data = json_decode(
      $response->getBody()->getContents(),
      TRUE
    );

    $results = [];

    /*
     * Google Flights separates results into
     * best_flights and other_flights.
     */
    $flight_groups = array_merge(
      $data['best_flights'] ?? [],
      $data['other_flights'] ?? []
    );

    foreach ($flight_groups as $group) {

      if (empty($group['flights'])) {
        continue;
      }

      /*
       * A result can contain multiple flight legs.
       * We use the first departure and final arrival.
       */
      $first_flight =
        reset($group['flights']);

      $last_flight =
        end($group['flights']);

      $results[] = [

        'airline' =>
          $first_flight['airline'] ?? '',

        'airline_logo' =>
          $first_flight['airline_logo'] ?? '',

        'flight_number' =>
          $first_flight['flight_number'] ?? '',

        'departure_airport' =>
          $first_flight['departure_airport']['id'] ?? '',

        'departure_airport_name' =>
          $first_flight['departure_airport']['name'] ?? '',

        'departure_time' =>
          $first_flight['departure_airport']['time'] ?? '',

        'arrival_airport' =>
          $last_flight['arrival_airport']['id'] ?? '',

        'arrival_airport_name' =>
          $last_flight['arrival_airport']['name'] ?? '',

        'arrival_time' =>
          $last_flight['arrival_airport']['time'] ?? '',

        'duration' =>
          $group['total_duration'] ?? 0,

        'stops' =>
          count($group['layovers'] ?? []),

        'price' =>
          $group['price'] ?? NULL,

        'currency' =>
          'EUR',

        'travel_class' =>
          $first_flight['travel_class'] ?? '',

        'booking_token' =>
          $group['booking_token'] ?? '',

      ];
    }

    return array_slice(
      $results,
      0,
      10
    );
  }


  /**
   * Searches train journeys through
   * SerpApi Google Maps Directions.
   */
  public function searchTrains(
    string $departure_city,
    string $arrival_city,
    string $date
  ): array {

    $api_key = getenv('SERPAPI_KEY');

    if (!$api_key) {
      throw new \RuntimeException(
        'SERPAPI_KEY environment variable is not configured.'
      );
    }

    $departure_timestamp = strtotime(
      $date . ' 12:00:00'
    );

    if (!$departure_timestamp) {
      throw new \RuntimeException(
        'Invalid train departure date.'
      );
    }

    $response = $this->httpClient->get(
      'https://serpapi.com/search.json',
      [
        'query' => [
          'engine' => 'google_maps_directions',
          'start_addr' => $departure_city,
          'end_addr' => $arrival_city,
          'travel_mode' => 3,
          'prefer' => 'train',
          'time' => 'depart_at:' . $departure_timestamp,
          'hl' => 'en',
          'api_key' => $api_key,
        ],
      ]
    );

    $data = json_decode(
      $response->getBody()->getContents(),
      TRUE
    );

    if (empty($data['directions'])) {
      return [];
    }

    $results = [];

    foreach ($data['directions'] as $direction) {

      if (empty($direction['trips'])) {
        continue;
      }

      $train_segments = [];

      foreach ($direction['trips'] as $trip) {

        /*
         * Walking gibi bölümleri almıyoruz.
         */
        if (($trip['travel_mode'] ?? '') !== 'Transit') {
          continue;
        }

        $title = $trip['title'] ?? '';
        $icon = $trip['icon'] ?? '';

        /*
         * Bus / metro / tram gibi şehir içi
         * ulaşım araçlarını dışarıda bırak.
         */
        $is_local_transport =
          stripos($icon, 'metro') !== FALSE ||
          stripos($icon, 'bus') !== FALSE ||
          stripos($icon, 'tram') !== FALSE ||
          stripos($icon, 'subway') !== FALSE;

        if ($is_local_transport) {
          continue;
        }

        /*
         * Demiryolu segmentini tespit et.
         */
        $is_train =
          stripos($icon, 'rail') !== FALSE ||
          stripos($icon, 'rodalies') !== FALSE ||
          stripos($title, 'TGV') !== FALSE ||
          stripos($title, 'AVE') !== FALSE ||
          stripos($title, 'ICE') !== FALSE ||
          stripos($title, 'Eurostar') !== FALSE ||
          stripos($title, 'Intercity') !== FALSE ||
          !empty($trip['service_run_by']);

        if (!$is_train) {
          continue;
        }

        $train_segments[] = [

          'title' =>
            $title,

          'duration' =>
            $trip['formatted_duration'] ?? '',

          'start_station' =>
            $trip['start_stop']['name'] ?? '',

          'departure_time' =>
            $trip['start_stop']['time'] ?? '',

          'end_station' =>
            $trip['end_stop']['name'] ?? '',

          'arrival_time' =>
            $trip['end_stop']['time'] ?? '',

          'operator' =>
            $trip['service_run_by']['name'] ?? '',

          'operator_link' =>
            $trip['service_run_by']['link'] ?? '',

        ];
      }

      if (empty($train_segments)) {
        continue;
      }

      $first_train =
        reset($train_segments);

      $last_train =
        end($train_segments);

      $results[] = [

        'start_time' =>
          $direction['start_time'] ?? '',

        'end_time' =>
          $direction['end_time'] ?? '',

        'duration' =>
          $direction['formatted_duration'] ?? '',

        'distance' =>
          $direction['formatted_distance'] ?? '',

        'price' =>
          $direction['cost'] ?? NULL,

        'currency' =>
          $direction['currency'] ?? NULL,

        'start_station' =>
          $first_train['start_station'] ?? '',

        'end_station' =>
          $last_train['end_station'] ?? '',

        'departure_time' =>
          $first_train['departure_time'] ?? '',

        'arrival_time' =>
          $last_train['arrival_time'] ?? '',

        'operator' =>
          $first_train['operator'] ?? '',

        'operator_link' =>
          $first_train['operator_link'] ?? '',

        'train_name' =>
          $first_train['title'] ?? '',

        'train_segments' =>
          $train_segments,

        'transfers' =>
          max(
            0,
            count($train_segments) - 1
          ),

      ];
    }

    return array_slice(
      $results,
      0,
      8
    );
  }


  /**
   * Finds coordinates for a city using
   * Open-Meteo Geocoding API.
   */
  private function getCityCoordinates(
    string $city
  ): ?array {

    $response = $this->httpClient->get(
      'https://geocoding-api.open-meteo.com/v1/search',
      [
        'query' => [
          'name' => $city,
          'count' => 1,
          'language' => 'en',
          'format' => 'json',
        ],
      ]
    );

    $data = json_decode(
      $response->getBody()->getContents(),
      TRUE
    );

    if (empty($data['results'][0])) {
      return NULL;
    }

    return [
      'latitude' =>
        (float) $data['results'][0]['latitude'],

      'longitude' =>
        (float) $data['results'][0]['longitude'],
    ];
  }


  /**
   * Searches intercity bus journeys through
   * SerpApi Google Maps Directions.
   */
  public function searchBuses(
    string $departure_city,
    string $arrival_city,
    string $date
  ): array {

    $api_key = getenv('SERPAPI_KEY');

    if (!$api_key) {
      throw new \RuntimeException(
        'SERPAPI_KEY environment variable is not configured.'
      );
    }

    /*
     * Find coordinates first.
     *
     * This prevents Google Maps from resolving
     * cities such as Barcelona to the wrong country.
     */
    $departure_location =
      $this->getCityCoordinates($departure_city);

    $arrival_location =
      $this->getCityCoordinates($arrival_city);

    if (!$departure_location) {
      throw new \RuntimeException(
        'Departure city could not be found.'
      );
    }

    if (!$arrival_location) {
      throw new \RuntimeException(
        'Arrival city could not be found.'
      );
    }

    /*
     * Convert coordinates to:
     *
     * latitude,longitude
     */
    $start_coords =
      $departure_location['latitude'] .
      ',' .
      $departure_location['longitude'];

    $end_coords =
      $arrival_location['latitude'] .
      ',' .
      $arrival_location['longitude'];

    /*
     * Transit results are time dependent.
     */
    $departure_timestamp =
      strtotime(
        $date . ' 12:00:00'
      );

    if (!$departure_timestamp) {
      throw new \RuntimeException(
        'Invalid bus departure date.'
      );
    }

    /*
     * Search Google Maps transit results
     * and prefer bus journeys.
     */
    $response = $this->httpClient->get(
      'https://serpapi.com/search.json',
      [
        'query' => [
          'engine' => 'google_maps_directions',
          'start_coords' => $start_coords,
          'end_coords' => $end_coords,
          'travel_mode' => 3,
          'prefer' => 'bus',
          'time' =>
            'depart_at:' . $departure_timestamp,
          'hl' => 'en',
          'api_key' => $api_key,
        ],
      ]
    );

    $data = json_decode(
      $response->getBody()->getContents(),
      TRUE
    );

    if (empty($data['directions'])) {
      return [];
    }

    $results = [];

    foreach ($data['directions'] as $direction) {

      if (empty($direction['trips'])) {
        continue;
      }

      $bus_segments = [];

      foreach ($direction['trips'] as $trip) {

        /*
         * Ignore walking sections.
         */
        if (($trip['travel_mode'] ?? '') !== 'Transit') {
          continue;
        }

        $icon =
          $trip['icon'] ?? '';

        /*
         * Only bus segments.
         */
        if (stripos($icon, 'bus') === FALSE) {
          continue;
        }

        $operator =
          $trip['service_run_by']['name'] ?? '';

        $title =
          $trip['title'] ?? '';

        /*
         * Remove obvious local public transport.
         *
         * We want intercity buses such as:
         *
         * FlixBus
         * BlaBlaCar Bus
         * Gipsyy
         * ALSA
         * etc.
         */
        $is_local_operator =
          stripos(
            $operator,
            'Transports Metropolitans'
          ) !== FALSE ||
          stripos(
            $operator,
            'Île-de-France'
          ) !== FALSE ||
          stripos(
            $operator,
            'Ile-de-France'
          ) !== FALSE ||
          stripos(
            $operator,
            'Seine Orly'
          ) !== FALSE ||
          stripos(
            $operator,
            'Bord de Marne'
          ) !== FALSE;

        if ($is_local_operator) {
          continue;
        }

        /*
         * Ignore short local bus rides.
         *
         * Intercity bus segments normally last
         * at least one hour.
         */
        $duration_seconds =
          (int) ($trip['duration'] ?? 0);

        if ($duration_seconds < 3600) {
          continue;
        }

        $bus_segments[] = [

          'title' =>
            $title,

          'duration' =>
            $trip['formatted_duration'] ?? '',

          'start_stop' =>
            $trip['start_stop']['name'] ?? '',

          'departure_time' =>
            $trip['start_stop']['time'] ?? '',

          'end_stop' =>
            $trip['end_stop']['name'] ?? '',

          'arrival_time' =>
            $trip['end_stop']['time'] ?? '',

          'operator' =>
            $operator,

          'operator_link' =>
            $trip['service_run_by']['link'] ?? '',

        ];
      }

      if (empty($bus_segments)) {
        continue;
      }

      /*
       * First intercity bus segment.
       */
      $first_bus =
        reset($bus_segments);

      /*
       * Final intercity bus segment.
       */
      $last_bus =
        end($bus_segments);

      $results[] = [

        'start_time' =>
          $direction['start_time'] ?? '',

        'end_time' =>
          $direction['end_time'] ?? '',

        'duration' =>
          $direction['formatted_duration'] ?? '',

        'distance' =>
          $direction['formatted_distance'] ?? '',

        /*
         * Fare is optional.
         */
        'price' =>
          $direction['cost'] ?? NULL,

        'currency' =>
          $direction['currency'] ?? NULL,

        'start_stop' =>
          $first_bus['start_stop'] ?? '',

        'end_stop' =>
          $last_bus['end_stop'] ?? '',

        'departure_time' =>
          $first_bus['departure_time'] ?? '',

        'arrival_time' =>
          $last_bus['arrival_time'] ?? '',

        'operator' =>
          $first_bus['operator'] ?? '',

        'operator_link' =>
          $first_bus['operator_link'] ?? '',

        'bus_name' =>
          $first_bus['title'] ?? '',

        'bus_segments' =>
          $bus_segments,

        'transfers' =>
          max(
            0,
            count($bus_segments) - 1
          ),

      ];
    }

    return array_slice(
      $results,
      0,
      8
    );
  }

}
