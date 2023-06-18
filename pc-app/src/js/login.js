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
});

ipcRenderer.on('login:failure', (options) => {
  sendError(`Failure: ${options}`);
});

const sendError = (error) => {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = error;
}

document.querySelector('.back-button').addEventListener('click', (_event) => { // eslint-disable-line no-unused-vars
  window.location.href = `userlist.html`;
});