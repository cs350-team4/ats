/*global ipcRenderer*/

document.addEventListener('DOMContentLoaded', function() {
  ipcRenderer.send('settings:get');

  document.getElementById('settings-form').addEventListener('submit', (event) => { // eslint-disable-line no-unused-vars
    event.preventDefault();
    const publicKeyEndpoint = document.getElementById("publicKeyEndpoint").value;
    const uiEndpoint = document.getElementById("uiEndpoint").value;
    ipcRenderer.send('settings:submit', {publicKeyEndpoint, uiEndpoint});
  });

  document.querySelector('.back-button').addEventListener('click', (_event) => { // eslint-disable-line no-unused-vars
    window.location.href = `userlist.html`;
  });
});

ipcRenderer.on('settings:done', (options) => {
  const publicKeyEndpointButton = document.getElementById("publicKeyEndpoint");
  const uiEndpointButton = document.getElementById("uiEndpoint");
  publicKeyEndpointButton.value = options.publicKeyEndpoint;
  uiEndpointButton.value = options.uiEndpoint;
  document.body.style.display = "block";
});


ipcRenderer.on('settings:success', (_options) => {
  nullMessage();
  setTimeout(() => { sendSuccess("Applied"); }, 100);
});

ipcRenderer.on('settings:failure', (options) => {
  nullMessage();
  setTimeout(() => { sendError(`Failure: ${options}`); }, 100);
});

const sendError = (error) => {
  const message = document.getElementById("message");
  message.style.color = '#ff0000';
  message.textContent = error;
}

const sendSuccess = (error) => {
  const message = document.getElementById("message");
  message.style.color = '#008000';
  message.textContent = error;
}

const nullMessage = () => {
  const message = document.getElementById("message");
  message.textContent = null;
}