/*global ipcRenderer*/

document.addEventListener('DOMContentLoaded', function() {
  ipcRenderer.send('userlist:get');

  document.querySelector('.add-user-button').addEventListener('click', (_event) => { // eslint-disable-line no-unused-vars
    window.location.href = `register.html`;
  });
  
  document.querySelector('.settings-button').addEventListener('click', (_event) => { // eslint-disable-line no-unused-vars
    window.location.href = `settings.html`;
  });
});

ipcRenderer.on('userlist:done', (options) => {
  for (const user of options.users) {
    addUser(user.username);

    document.getElementById(`login-${user.username}`).addEventListener('click', (_event) => { // eslint-disable-line no-unused-vars
      window.location.href = `login.html?username=${user.username}`;
    });

    document.getElementById(`reset-${user.username}`).addEventListener('click', (_event) => { // eslint-disable-line no-unused-vars
      window.location.href = `reset.html?username=${user.username}`;
    });
  }
  document.body.style.display = "block";
});

const addUser = (username) => {
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
  loginButton.id = `login-${username}`;
  loginButton.textContent = "Login";

  const resetButton = document.createElement("button");
  resetButton.classList.add("reset");
  resetButton.id = `reset-${username}`;
  resetButton.textContent = "Reset";

  userDiv.appendChild(usernameSpan);
  userDiv.appendChild(userButtonsDiv);

  userButtonsDiv.appendChild(loginButton);
  userButtonsDiv.appendChild(resetButton);

  userList.appendChild(userDiv);
}

ipcRenderer.on('settings:failure', (options) => {
  sendError(`Failure: ${options}`);
});

const sendError = (error) => {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = error;
}