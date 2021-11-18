import { settings } from './settings.js';

let userName;

class Chat {
  constructor() {
    const thisChat = this;
    thisChat.getElements();
    thisChat.initAction();
    thisChat.initSocket();
  }

  getElements() {
    const thisChat = this;

    thisChat.dom = {};
    thisChat.dom.loginForm = document.querySelector(settings.welcomeForm);
    thisChat.dom.messagesSection = document.querySelector(settings.messagesSection);
    thisChat.dom.messagesList = document.getElementById(settings.messagesSectionList);
    thisChat.dom.addMessagesForm = document.querySelector(settings.addMessagesForm);
    thisChat.dom.userNameInput = document.getElementById(settings.userName);
    thisChat.dom.messageContentInput = document.getElementById(settings.messageContent);
  };

  initAction() {
    const thisChat = this;

    const loginForm = thisChat.dom.loginForm;
    const messagesSection = thisChat.dom.messagesSection;
    const messagesList = thisChat.dom.messagesList;
    const messageContentInput = thisChat.dom.messageContentInput;
    const socket = io();

    function addMessage(author, content) {
      const message = document.createElement('li');

      message.classList.add('message');
      message.classList.add('message--received');

      if (author === userName) {
        message.classList.add('message--self');
      }
      message.innerHTML = `
        <h3 class="message__author">${userName === author ? 'You' : author}</h3>
         <div class=
         ${author === 'Chat Bot' ?
          "message__content--bot" : "message__content"}>
           ${content}
         </div>`;

      messagesList.appendChild(message);
    }

    socket.on('message', ({ author, content }) => addMessage(author, content));
    socket.on('chatBotInfo', ({ author, content }) => addMessage(author, content));
    socket.on('out', ({ author, content }) => addMessage(author, content));

    loginForm.addEventListener('submit', function login(e) {
      e.preventDefault();

      const user = thisChat.dom.userNameInput.value;

      if (user === '') {
        alert('Niepoprawne dane...');
      } else {
        userName = user;
        loginForm.classList.remove('show');
        messagesSection.classList.add('show');
        socket.emit('join', { author: userName });
        socket.emit('chatBotInfo', { author: 'Chat Bot', content: `${userName} has joined the conversation!` });
      }
    });

    messagesSection.addEventListener('submit', function sendMessage(e) {
      e.preventDefault();

      let messageContent = messageContentInput.value;

      if (messageContentInput.value === '') {
        alert('Pusta wiadomosc...');
      } else {
        addMessage(userName, messageContentInput.value);
        socket.emit('message', { author: userName, content: messageContent });
        messageContentInput.value = '';
      }
    });
  }

}

const app = new Chat();
console.log(app);