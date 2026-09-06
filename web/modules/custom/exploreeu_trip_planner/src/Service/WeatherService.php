<?php

namespace Drupal\exploreeu_trip_planner\Service;

use Drupal\Core\Http\ClientFactory;

class WeatherService {

  protected $httpClient;

  public function __construct(ClientFactory $http_client_factory) {
    $this->httpClient = $http_client_factory->fromOptions([
      'timeout' => 10,
    ]);
  }

  /**
   * Finds coordinates for a destination name.
   */
  public function getCoordinates(string $destination): ?array {

    $response = $this->httpClient->get(
      'https://geocoding-api.open-meteo.com/v1/search',
      [
        'query' => [
          'name' => $destination,
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

    $location = $data['results'][0];

    return [
      'name' => $location['name'],
      'country' => $location['country'] ?? '',
      'latitude' => $location['latitude'],
      'longitude' => $location['longitude'],
      'timezone' => $location['timezone'] ?? 'auto',
    ];
  }

  /**
   * Gets daily weather forecast for a date range.
   */
  public function getForecast(
    float $latitude,
    float $longitude,
    string $start_date,
    string $end_date
  ): array {
    
    $response = $this->httpClient->get(
      'https://api.open-meteo.com/v1/forecast',
       [
         'query' => [
           'latitude' => $latitude,
           'longitude' => $longitude,
           'start_date' => $start_date,
           'end_date' => $end_date,

           'daily' => implode(',', [
             'temperature_2m_max',
             'temperature_2m_min',
             'precipitation_probability_max',
            ]),

            'hourly' => implode(',', [
              'weather_code',
              'cloud_cover',
              'precipitation_probability',
            ]),

            'timezone' => 'auto',
          ],
        ]
      );

      $data = json_decode(
        $response->getBody()->getContents(),
        TRUE
      );

      if (empty($data['daily']['time'])) {
        return [];
      }

      $forecast = [];

      foreach ($data['daily']['time'] as $index => $date) {

      /*
       * Öğlen 12:00'daki saatlik hava durumunu bul.
       */
        $target_time = $date . 'T12:00';

        $hour_index = array_search(
          $target_time,
          $data['hourly']['time'] ?? [],
          TRUE
        );

        $weather_code = NULL;
        $cloud_cover = NULL;
        $hourly_rain_probability = NULL;

        if ($hour_index !== FALSE) {
          $weather_code =
            $data['hourly']['weather_code'][$hour_index] ?? NULL;

          $cloud_cover =
            $data['hourly']['cloud_cover'][$hour_index] ?? NULL;

          $hourly_rain_probability =
            $data['hourly']['precipitation_probability'][$hour_index] ?? NULL;
        }

        $forecast[] = [
          'date' => $date,

           /*
            * Artık günlük en şiddetli kod yerine
            * öğlen 12:00 hava kodunu kullanıyoruz.
            */
            'weather_code' => $weather_code,

            'cloud_cover' => $cloud_cover,

            'temperature_max' =>
              $data['daily']['temperature_2m_max'][$index] ?? NULL,

            'temperature_min' =>
              $data['daily']['temperature_2m_min'][$index] ?? NULL,

            'rain_probability' =>
              $data['daily']['precipitation_probability_max'][$index] ?? NULL,

            'midday_rain_probability' =>
              $hourly_rain_probability,
        ];
      }

      return $forecast;
    }
}
