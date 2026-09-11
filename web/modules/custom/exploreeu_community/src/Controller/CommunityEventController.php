<?php

namespace Drupal\exploreeu_community\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;

class CommunityEventController extends ControllerBase {

  public function addToCalendar(NodeInterface $node): RedirectResponse {

    if ($node->bundle() !== 'community_event') {
      throw $this->createNotFoundException();
    }

    $current_user = $this->currentUser();

    if ($current_user->isAnonymous()) {
      $this->messenger()->addError(
        $this->t('You must be logged in to add events to your calendar.')
      );

      return new RedirectResponse('/user/login');
    }

    $existing = \Drupal::entityQuery('node')
      ->condition('type', 'calendar_event')
      ->condition('uid', $current_user->id())
      ->condition('field_community_event.target_id', $node->id())
      ->accessCheck(TRUE)
      ->range(0, 1)
      ->execute();

    if (!empty($existing)) {
      $this->messenger()->addWarning(
        $this->t('This event is already in your calendar.')
      );

      return new RedirectResponse($node->toUrl()->toString());
    }

    $start_date = $node->get('field_event_dates')->value;
    $end_date = $node->get('field_event_dates')->end_value;
    $location = $node->get('field_event_location')->value;

    $description = '';
    if (!$node->get('field_event_description')->isEmpty()) {
      $description = strip_tags(
        $node->get('field_event_description')->value
      );
    }

    $values = [
      'type' => 'calendar_event',
      'title' => $node->label(),
      'uid' => $current_user->id(),

      'field_event_dates' => [
        'value' => $start_date,
        'end_value' => $end_date,
      ],

      'field_event_location' => $location,

      'field_event_notes' => [
        'value' => $description,
        'format' => 'plain_text',
      ],

      'field_community_event' => [
        'target_id' => $node->id(),
      ],

      'status' => 1,
    ];

    $calendar_event = Node::create($values);
    $calendar_event->save();

    $this->messenger()->addStatus(
      $this->t('Event added to your calendar.')
    );

    return new RedirectResponse($node->toUrl()->toString());
  }

}
