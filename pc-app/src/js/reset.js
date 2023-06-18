/*global ipcRenderer*/

document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  
  const resetHeader = document.getElementById('reset-header');
  resetHeader.textContent = `Reset ${username}`;

  document.getElementById('reset-form').addEventListener('submit', (event) => { // eslint-disable-line no-unused-vars
    event.preventDefault();
    const jwt = document.getElementById("jwt").value;
    const password = document.getElementById("password").value;
    ipcRenderer.send('reset:submit', {username, jwt, password});
  });
  

  document.querySelector('.back-button').addEventListener('click', (_event) => { // eslint-disable-line no-unused-vars
    window.location.href = `userlist.html`;
  });
});

ipcRenderer.on('reset:success', (_options) => {
  window.location.href = `userlist.html`;
});

ipcRenderer.on('reset:failure', (options) => {
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