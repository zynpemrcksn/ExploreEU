<?php

namespace Drupal\exploreeu_community\Form;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\CloseModalDialogCommand;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;

class CommunityLeaveForm extends ConfirmFormBase {

  protected ?NodeInterface $community = NULL;

  public function getFormId(): string {
    return 'exploreeu_community_leave_form';
  }

  public function buildForm(
    array $form,
    FormStateInterface $form_state,
    ?NodeInterface $community = NULL
  ): array {
    if (!$community || $community->bundle() !== 'community') {
      throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException();
    }

    $this->community = $community;
    $form_state->set('community_nid', (int) $community->id());

    $form = parent::buildForm($form, $form_state);

    $form['actions']['submit']['#ajax'] = [
      'callback' => '::ajaxSubmit',
    ];

    return $form;
  }

  public function getQuestion(): string {
    return $this->t(
      'Are you sure you want to leave @community?',
      [
        '@community' => $this->community?->label() ?? 'this community',
      ]
    );
  }

  public function getConfirmText(): string {
    return $this->t('Leave Community');
  }

  public function getCancelUrl(): Url {
    if ($this->community) {
      return $this->community->toUrl();
    }

    return Url::fromRoute('<front>');
  }

  public function submitForm(
    array &$form,
    FormStateInterface $form_state
  ): void {
    $current_user = \Drupal::currentUser();

    if ($current_user->isAnonymous()) {
      $this->messenger()->addError(
        $this->t('You must be logged in to leave a community.')
      );
      return;
    }

    $community_nid = (int) $form_state->get('community_nid');

    $deleted = \Drupal::database()
      ->delete('exploreeu_community_membership')
      ->condition('uid', (int) $current_user->id())
      ->condition('community_nid', $community_nid)
      ->execute();

    if ($deleted) {
      $form_state->set('membership_deleted', TRUE);

      $this->messenger()->addStatus(
        $this->t('You have left the community.')
      );
    }
    else {
      $this->messenger()->addWarning(
        $this->t('You are not a member of this community.')
      );
    }

    $form_state->setRedirect(
      'entity.node.canonical',
      ['node' => $community_nid]
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

    if ($form_state->get('membership_deleted')) {
      $community_nid = (int) $form_state->get('community_nid');

      $join_url = Url::fromRoute(
        'exploreeu_community.join',
        ['community' => $community_nid]
      )->toString();

      $join_action = sprintf(
        '<div id="community-membership-action">
          <a
            href="%s"
            class="community-join-button use-ajax"
            data-dialog-type="modal"
            data-dialog-options=\'{"width":760}\'
          >
            Join Community
          </a>
        </div>',
        $join_url
      );

      $response->addCommand(
        new ReplaceCommand(
          '#community-membership-action',
          $join_action
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
