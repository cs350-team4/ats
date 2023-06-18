/*global ipcRenderer*/

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('register-form').addEventListener('submit', (event) => { // eslint-disable-line no-unused-vars
    event.preventDefault();
    const jwt = document.getElementById("jwt").value;
    const password = document.getElementById("password").value;
    ipcRenderer.send('register:submit', {jwt, password});
  });
});

ipcRenderer.on('register:success', (_options) => {
  window.location.href = `userlist.html`;
  console.log("success");
});

ipcRenderer.on('register:failure', (options) => {
  sendError(`Failure: ${options}`);
});

const sendError = (error) => {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = error;
}

document.querySelector('.back-button').addEventListener('click', (_event) => { // eslint-disable-line no-unused-vars
  window.location.href = `userlist.html`;
});