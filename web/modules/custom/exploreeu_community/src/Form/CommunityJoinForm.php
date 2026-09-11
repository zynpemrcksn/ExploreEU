<?php

namespace Drupal\exploreeu_community\Form;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\CloseModalDialogCommand;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;

class CommunityJoinForm extends FormBase {

  public function getFormId(): string {
    return 'exploreeu_community_join_form';
  }

  public function buildForm(
    array $form,
    FormStateInterface $form_state,
    ?NodeInterface $community = NULL
  ): array {
    if (!$community || $community->bundle() !== 'community') {
      throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException();
    }

    $form_state->set('community_nid', (int) $community->id());

    $form['community_name'] = [
      '#type' => 'item',
      '#title' => $this->t('Community'),
      '#markup' => $community->label(),
    ];

    $form['university'] = [
      '#type' => 'textfield',
      '#title' => $this->t('University / School'),
      '#required' => TRUE,
      '#maxlength' => 255,
    ];

    $form['current_city'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Current City'),
      '#required' => TRUE,
      '#maxlength' => 255,
    ];

    $form['student_status'] = [
      '#type' => 'select',
      '#title' => $this->t('Student Status'),
      '#required' => TRUE,
      '#options' => [
        'erasmus' => $this->t('Erasmus Student'),
        'international' => $this->t('International Student'),
        'local' => $this->t('Local Student'),
        'exchange' => $this->t('Exchange Student'),
        'graduate' => $this->t('Graduate Student'),
        'other' => $this->t('Other'),
      ],
      '#empty_option' => $this->t('- Select -'),
    ];

    $form['interests'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Interests'),
      '#required' => TRUE,
      '#options' => [
        'travel' => $this->t('Travel'),
        'local_events' => $this->t('Local Events'),
        'culture' => $this->t('Culture'),
        'food' => $this->t('Food'),
        'meetups' => $this->t('Meetups'),
        'nightlife' => $this->t('Nightlife'),
        'language_exchange' => $this->t('Language Exchange'),
      ],
    ];

    $form['introduction'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Short Introduction'),
      '#description' => $this->t('Tell the community a little about yourself.'),
      '#required' => FALSE,
      '#rows' => 4,
    ];

    $form['actions'] = [
      '#type' => 'actions',
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Join Community'),
      '#button_type' => 'primary',
      '#ajax' => [
        'callback' => '::ajaxSubmit',
      ],
    ];

    return $form;
  }

  public function submitForm(
    array &$form,
    FormStateInterface $form_state
  ): void {
    $current_user = \Drupal::currentUser();

    if ($current_user->isAnonymous()) {
      $this->messenger()->addError(
        $this->t('You must be logged in to join a community.')
      );
      return;
    }

    $uid = (int) $current_user->id();
    $community_nid = (int) $form_state->get('community_nid');

    $database = \Drupal::database();

    $existing_membership = $database
      ->select('exploreeu_community_membership', 'm')
      ->fields('m', ['id'])
      ->condition('uid', $uid)
      ->condition('community_nid', $community_nid)
      ->execute()
      ->fetchField();

    if ($existing_membership) {
      $this->messenger()->addWarning(
        $this->t('You have already joined this community.')
      );
      return;
    }

    $interests = array_filter(
      $form_state->getValue('interests')
    );

    $database
      ->insert('exploreeu_community_membership')
      ->fields([
        'uid' => $uid,
        'community_nid' => $community_nid,
        'university' => trim($form_state->getValue('university')),
        'current_city' => trim($form_state->getValue('current_city')),
        'student_status' => $form_state->getValue('student_status'),
        'interests' => json_encode(array_values($interests)),
        'introduction' => trim($form_state->getValue('introduction')),
        'created' => \Drupal::time()->getRequestTime(),
      ])
      ->execute();

    $form_state->set('membership_created', TRUE);

    $this->messenger()->addStatus(
      $this->t('You have successfully joined the community.')
    );
  }

  public function ajaxSubmit(
    array &$form,
    FormStateInterface $form_state
  ): AjaxResponse|array {
    if ($form_state->hasAnyErrors()) {
      return $form;
    }

    $response = new AjaxResponse();

    if ($form_state->get('membership_created')) {
      $community_nid = (int) $form_state->get('community_nid');

      $leave_url = Url::fromRoute(
        'exploreeu_community.leave',
        ['community' => $community_nid]
      )->toString();

      $leave_action = sprintf(
        '<div id="community-membership-action">
          <a
            href="%s"
            class="community-join-button community-join-button--joined use-ajax"
            data-dialog-type="modal"
            data-dialog-options=\'{"width":520}\'
          >
            ✓ Joined · Leave
          </a>
        </div>',
        $leave_url
      );

      $response->addCommand(
        new ReplaceCommand(
          '#community-membership-action',
          $leave_action
        )
      );

      $member_count = (int) \Drupal::database()
        ->select('exploreeu_community_membership', 'm')
        ->condition('community_nid', $community_nid)
        ->countQuery()
        ->execute()
        ->fetchField();

      $member_label = $member_count === 1
        ? 'Member'
        : 'Members';

      $member_stat = sprintf(
        '<div class="community-stat" id="community-member-stat">
          <span class="community-stat__value">%d</span>
          <span class="community-stat__label">%s</span>
        </div>',
        $member_count,
        $member_label
      );

      $response->addCommand(
        new ReplaceCommand(
          '#community-member-stat',
          $member_stat
        )
      );
    }

    $response->addCommand(
      new CloseModalDialogCommand()
    );

    return $response;
  }

}
