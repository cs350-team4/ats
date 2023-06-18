/*global ipcRenderer*/

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('register-form').addEventListener('submit', (event) => { // eslint-disable-line no-unused-vars
    event.preventDefault();
    const jwt = document.getElementById("jwt").value;
    const password = document.getElementById("password").value;
    ipcRenderer.send('register:submit', {jwt, password});
  });

  document.querySelector('.back-button').addEventListener('click', (_event) => { // eslint-disable-line no-unused-vars
    window.location.href = `userlist.html`;
  });
});

ipcRenderer.on('register:success', (_options) => {
  window.location.href = `userlist.html`;
});

ipcRenderer.on('register:failure', (options) => {
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