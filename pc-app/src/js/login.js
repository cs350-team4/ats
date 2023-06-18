/*global ipcRenderer*/

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

document.addEventListener('DOMContentLoaded', function() {
  const loginHeader = document.getElementById('login-header');
  loginHeader.textContent = `Login as ${username}`;

  document.getElementById('login-form').addEventListener('submit', (event) => { // eslint-disable-line no-unused-vars
    event.preventDefault();
    const password = document.getElementById("password").value;
    ipcRenderer.send('login:submit', {username, password});
  });

  document.querySelector('.back-button').addEventListener('click', (_event) => { // eslint-disable-line no-unused-vars
    window.location.href = `userlist.html`;
  });
});

ipcRenderer.on('login:failure', (options) => {
  nullMessage();
  setTimeout(() => { sendError(`Failure: ${options}`); }, 100);
});

const sendError = (error) => {
  const message = document.getElementById("message");
  message.style.color = '#ff0000';
  message.textContent = error;
}

const nullMessage = () => {
  const message = document.getElementById("message");
  message.textContent = null;
}