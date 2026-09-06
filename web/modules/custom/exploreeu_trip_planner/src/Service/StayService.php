<?php

namespace Drupal\exploreeu_trip_planner\Service;

use Drupal\Core\Http\ClientFactory;

class StayService {

  /**
   * HTTP client.
   */
  protected $httpClient;

  /**
   * Creates the stay service.
   */
  public function __construct(ClientFactory $http_client_factory) {
    $this->httpClient = $http_client_factory->fromOptions([
      'timeout' => 20,
    ]);
  }

  /**
   * Searches accommodation using Google Hotels through SerpApi.
   */
  public function searchHotels(
    string $city,
    string $check_in,
    string $check_out,
    int $adults = 1
  ): array {

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
          'engine' => 'google_hotels',
          'q' => 'Hotels in ' . $city,
          'check_in_date' => $check_in,
          'check_out_date' => $check_out,
          'adults' => max(1, $adults),
          'currency' => 'EUR',
          'hl' => 'en',
          'gl' => 'us',
          'api_key' => $api_key,
        ],
      ]
    );

    $data = json_decode(
      $response->getBody()->getContents(),
      TRUE
    );

    if (!empty($data['error'])) {
      throw new \RuntimeException(
        $data['error']
      );
    }

    $results = [];

    foreach ($data['properties'] ?? [] as $property) {

      $results[] = [

        'name' =>
          $property['name'] ?? '',

        'type' =>
          $property['type'] ?? '',

        'description' =>
          $property['description'] ?? '',

        'rating' =>
          $property['overall_rating'] ?? NULL,

        'reviews' =>
          $property['reviews'] ?? NULL,

        'price_per_night' =>
          $property['rate_per_night']['lowest'] ?? '',

        'total_price' =>
          $property['total_rate']['lowest'] ?? '',

        'thumbnail' =>
          $property['images'][0]['thumbnail'] ?? '',

        'latitude' =>
          $property['gps_coordinates']['latitude'] ?? NULL,

        'longitude' =>
          $property['gps_coordinates']['longitude'] ?? NULL,

        'amenities' =>
          $property['amenities'] ?? [],

        'property_token' =>
          $property['property_token'] ?? '',

      ];

    }

    return $results;
  }

}
