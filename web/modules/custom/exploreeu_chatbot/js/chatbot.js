(function (Drupal, once) {
  Drupal.behaviors.exploreeuChatbot = {
    attach(context) {
      const chatbot = once(
        'exploreeu-chatbot',
        '#exploreeu-chatbot',
        context
      );

      chatbot.forEach((wrapper) => {
        const toggle = wrapper.querySelector('#exploreeu-chatbot-toggle');
        const panel = wrapper.querySelector('#exploreeu-chatbot-panel');
        const close = wrapper.querySelector('#exploreeu-chatbot-close');
        const form = wrapper.querySelector('#exploreeu-chatbot-form');
        const clearButton =
          wrapper.querySelector('#exploreeu-chatbot-clear');
        const input = wrapper.querySelector('#exploreeu-chatbot-input');
        const messages = wrapper.querySelector('#exploreeu-chatbot-messages');
        const sendButton = wrapper.querySelector('.exploreeu-chatbot__send');
        const savedConversation =
          sessionStorage.getItem('exploreeuChatbotConversation');

        const conversation = savedConversation
          ? JSON.parse(savedConversation)
          : [];

        const saveConversation = () => {
          sessionStorage.setItem(
            'exploreeuChatbotConversation',
            JSON.stringify(conversation)
          );
        };

        const scrollToBottom = () => {
          messages.scrollTop = messages.scrollHeight;
        };

        
        const escapeHtml = (text) => {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;    
        };

        const formatBotMessage = (text) => {
          let html = escapeHtml(text);

          html = html
            .replace(/^### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^## (.+)$/gm, '<h3>$1</h3>')
            .replace(/^# (.+)$/gm, '<h2>$1</h2>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^\* (.+)$/gm, '<li>$1</li>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/\n/g, '<br>');

          html = html.replace(
            /(?:<li>.*?<\/li>(?:<br>)?)+/gs,
            (match) => `<ul>${match.replace(/<br>/g, '')}</ul>`
          );

          return html;
        };

        const addMessage = (text, type) => {
          const message = document.createElement('div');

          message.className =
            `exploreeu-chatbot__message exploreeu-chatbot__message--${type}`;

          if (type === 'bot') {
            message.innerHTML = formatBotMessage(text);
          }
          else {
            message.textContent = text;
          }

          messages.appendChild(message);
          scrollToBottom();

          return message;       
        };

        if (conversation.length > 0) {
          messages.innerHTML = '';

          conversation.forEach((item) => {
            const type = item.role === 'model' ? 'bot' : 'user';
            addMessage(item.text, type);
          });
        }
        toggle.addEventListener('click', () => {
          panel.hidden = false;
          input.focus();
          scrollToBottom();
        });

        close.addEventListener('click', () => {
          panel.hidden = true;
        });

        clearButton.addEventListener('click', () => {
          conversation.length = 0;

          sessionStorage.removeItem(
            'exploreeuChatbotConversation'
          );

          messages.innerHTML = '';

          addMessage(
            'Hi! 👋 I’m the ExploreEU Assistant. Ask me about destinations, itineraries, budget travel, transport, food, or Erasmus travel.',
            'bot'
          );
        });

        form.addEventListener('submit', async (event) => {
          event.preventDefault();

          const message = input.value.trim();

          if (!message) {
            return;
          }

          addMessage(message, 'user');

          conversation.push({
            role: 'user',
            text: message,
          });

          saveConversation();

          input.value = '';
          input.style.height = 'auto';

          sendButton.disabled = true;
          input.disabled = true;

          const typing = addMessage(
            'ExploreEU Assistant is typing...',
            'bot'
          );

          typing.classList.add('exploreeu-chatbot__typing');

          try {
            const response = await fetch('/api/exploreeu-chatbot', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                message: message,
                history: conversation,
              }),
            });

            const data = await response.json();

            typing.remove();

            if (!response.ok || !data.success) {
              addMessage(
                data.error ||
                  'Sorry, I could not answer right now. Please try again.',
                'bot'
              );

              return;
            }

            conversation.push({
              role: 'model',
              text: data.reply,
            });

            saveConversation();

            addMessage(data.reply, 'bot');
          }
          catch (error) {
            typing.remove();

            addMessage(
              'Sorry, the travel assistant is temporarily unavailable.',
              'bot'
            );
          }
          finally {
            sendButton.disabled = false;
            input.disabled = false;
            input.focus();
          }
        });

        input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
          }
        });

        input.addEventListener('input', () => {
          input.style.height = 'auto';

          input.style.height =
            `${Math.min(input.scrollHeight, 120)}px`;
        });
      });
    },
  };
})(Drupal, once);
