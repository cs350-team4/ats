/*global ipcRenderer*/

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

document.addEventListener('DOMContentLoaded', function() {
  if (document.body.id === 'user-list-body') {
    ipcRenderer.send('userlist:get');
  }
  if (document.body.id === 'login-body') {
    const loginHeader = document.getElementById('login-header');
    loginHeader.textContent = 'Login as ' + username;
  }
  if (document.body.id === 'reset-body') {
    const resetHeader = document.getElementById('reset-header');
    resetHeader.textContent = 'Reset ' + username;
  }
  if (document.body.id === 'settings-body') {
    ipcRenderer.send('settings:get');
  }
});

ipcRenderer.on('userlist:done', (options) => {
  for (const user of options.users) {
    addUser(user.username);
  }
  document.body.style.display = "block";
});

ipcRenderer.on('settings:done', (options) => {
  const publicKeyEndpointButton = document.getElementById("publicKeyEndpoint");
  const uiEndpointButton = document.getElementById("uiEndpoint");
  publicKeyEndpointButton.value = options.publicKeyEndpoint;
  uiEndpointButton.value = options.uiEndpoint;
  document.body.style.display = "block";
});

ipcRenderer.on('pubkey:failure', (options) => {
  console.log('failure: ', options)
});

function addUser(username) {
  const userList = document.querySelector(".user-list");
  
  const userDiv = document.createElement("div");
  userDiv.classList.add("user");

  const usernameSpan = document.createElement("span");
  usernameSpan.classList.add("username");
  usernameSpan.textContent = username;

  const userButtonsDiv = document.createElement("div");
  userButtonsDiv.classList.add("user-buttons");

  const loginButton = document.createElement("button");
  loginButton.classList.add("login");
  loginButton.textContent = "Login";
  loginButton.setAttribute("onclick", `goToLogin('${username}')`);

  const resetButton = document.createElement("button");
  resetButton.classList.add("reset");
  resetButton.textContent = "Reset";
  resetButton.setAttribute("onclick", `goToReset('${username}')`);

  userDiv.appendChild(usernameSpan);
  userDiv.appendChild(userButtonsDiv);

  userButtonsDiv.appendChild(loginButton);
  userButtonsDiv.appendChild(resetButton);

  userList.appendChild(userDiv);
}

function handleLoginSubmit(event) { // eslint-disable-line no-unused-vars
  event.preventDefault();
  const password = document.getElementById("password").value;
  ipcRenderer.send('login:submit', {username, password});
}

ipcRenderer.on('login:success', (_options) => {
  goToInterface();
  console.log("success");
});

ipcRenderer.on('login:failure', (options) => {
  console.log("failure: ", options);
});

function handleResetSubmit(event) { // eslint-disable-line no-unused-vars
  event.preventDefault();
  const jwt = document.getElementById("jwt").value;
  const password = document.getElementById("password").value;
  ipcRenderer.send('reset:submit', {username, jwt, password});
}

ipcRenderer.on('reset:success', (_options) => {
  goToUserlist();
  console.log("success");
});

ipcRenderer.on('reset:failure', (options) => {
  console.log("failure: ", options);
});

function handleRegisterSubmit(event) { // eslint-disable-line no-unused-vars
  event.preventDefault();
  const jwt = document.getElementById("jwt").value;
  const password = document.getElementById("password").value;
  ipcRenderer.send('register:submit', {jwt, password});
}

ipcRenderer.on('register:success', (_options) => {
  goToUserlist();
  console.log("success");
});

ipcRenderer.on('register:failure', (options) => {
  console.log("failure: ", options);
});

function handleSettingsSubmit(event) { // eslint-disable-line no-unused-vars
  event.preventDefault();
  const publicKeyEndpoint = document.getElementById("publicKeyEndpoint").value;
  const uiEndpoint = document.getElementById("uiEndpoint").value;
  ipcRenderer.send('settings:submit', {publicKeyEndpoint, uiEndpoint});
}

ipcRenderer.on('settings:success', (_options) => {
  console.log("success");
});

ipcRenderer.on('settings:failure', (options) => {
  console.log("failure: ", options);
});

function goToUserlist() { // eslint-disable-line no-unused-vars
  window.location.href = 'userlist.html';
}

function goToLogin(username) { // eslint-disable-line no-unused-vars
  window.location.href = `login.html?username=${username}`;
}

function goToReset(username) { // eslint-disable-line no-unused-vars
  window.location.href = `reset.html?username=${username}`;
}

function goToRegister() { // eslint-disable-line no-unused-vars
  window.location.href = `register.html`;
}

function goToSettings() { // eslint-disable-line no-unused-vars
  window.location.href = `settings.html`;
}

function goToInterface() { // eslint-disable-line no-unused-vars
  window.location.href = `interface.html`;
}