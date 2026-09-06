<?php

namespace Drupal\exploreeu_chatbot\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;


class ChatbotController {

  public function chat(Request $request): JsonResponse {
    $client_ip = $request->getClientIp() ?? 'unknown';
    $rate_limit_key = 'exploreeu_chatbot:' . hash('sha256', $client_ip);

    $flood = \Drupal::service('flood');

    if (!$flood->isAllowed('exploreeu_chatbot_request', 10, 60, $rate_limit_key)) {
      return new JsonResponse([
        'success' => FALSE,
        'error' => 'You are sending messages too quickly. Please wait a moment and try again.',
      ], 429);
    }

    $data = json_decode($request->getContent(), TRUE);

    $message = trim($data['message'] ?? '');

    $history = $data['history'] ?? [];
 
    if (!is_array($history)) {
      $history = [];
    }

    if ($message === '') {
      return new JsonResponse([
        'success' => FALSE,
        'error' => 'Message is required.',
      ], 400);
    }

    if (mb_strlen($message) > 2000) {
      return new JsonResponse([
        'success' => FALSE,
        'error' => 'Message is too long. Please keep it under 2000 characters.',
      ], 400);
    }

    $flood->register(
      'exploreeu_chatbot_request',
      60,
      $rate_limit_key
    );

    $api_key = getenv('GEMINI_API_KEY');

    if (!$api_key) {
      return new JsonResponse([
        'success' => FALSE,
        'error' => 'Gemini API key is not configured.',
      ], 500);
    }

    $system_prompt = <<<TEXT
You are ExploreEU Assistant, a friendly travel assistant for students,
Erasmus participants, university students, and budget travelers exploring Europe.

Help users with:
- European destinations and cities
- Travel planning and itineraries
- Budget travel advice
- Train, bus, and flight planning
- Attractions and food suggestions
- Erasmus and student travel tips

Keep answers practical, concise, and easy to understand.
If you are uncertain about current prices, schedules, visa rules, or other
time-sensitive information, clearly tell the user that they should verify
the latest information from an official source.
TEXT;

    $contents = [];

      foreach ($history as $item) {
        $role = $item['role'] ?? '';
        $text = trim($item['text'] ?? '');

        if (!in_array($role, ['user', 'model'], TRUE) || $text === '') {
          continue;
        }

        $contents[] = [
          'role' => $role,
          'parts' => [
            [
              'text' => $text,
            ],
          ],
        ];
      }

    $payload = [
      'system_instruction' => [
        'parts' => [
          [
            'text' => $system_prompt,
          ],
        ],
      ],
      'contents' => $contents,
      'generationConfig' => [
        'maxOutputTokens' => 800,
      ],
    ];

    try {
      $client = \Drupal::httpClient();

      $response = $client->post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
        [
          'headers' => [
            'x-goog-api-key' => $api_key,
            'Content-Type' => 'application/json',
          ],
          'json' => $payload,
          'timeout' => 30,
        ]
      );

      $result = json_decode($response->getBody()->getContents(), TRUE);

      $reply = $result['candidates'][0]['content']['parts'][0]['text'] ?? NULL;

      if (!$reply) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => 'Gemini returned an empty response.',
        ], 502);
      }

      return new JsonResponse([
        'success' => TRUE,
        'reply' => $reply,
      ]);
    }
        catch (ConnectException $e) {
      \Drupal::logger('exploreeu_chatbot')->error(
        'Gemini connection error: @message',
        ['@message' => $e->getMessage()]
      );

      return new JsonResponse([
        'success' => FALSE,
        'error' => 'The travel assistant took too long to respond. Please try again.',
      ], 504);
    }
    catch (RequestException $e) {
      $status_code = $e->hasResponse()
        ? $e->getResponse()->getStatusCode()
        : 500;

      \Drupal::logger('exploreeu_chatbot')->error(
        'Gemini API error @status: @message',
        [
          '@status' => $status_code,
          '@message' => $e->getMessage(),
        ]
      );

      if ($status_code === 429) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => 'The assistant is receiving too many requests. Please try again shortly.',
        ], 429);
      }

      if ($status_code === 503) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => 'The AI service is temporarily busy. Please try again in a moment.',
        ], 503);
      }

      return new JsonResponse([
        'success' => FALSE,
        'error' => 'The travel assistant is temporarily unavailable.',
      ], 500);
    }
    catch (\Throwable $e) {
      \Drupal::logger('exploreeu_chatbot')->error(
        'Unexpected chatbot error: @message',
        ['@message' => $e->getMessage()]
      );

      return new JsonResponse([
        'success' => FALSE,
        'error' => 'An unexpected error occurred. Please try again.',
      ], 500);
    }

  }

}
