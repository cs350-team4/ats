const { app, BrowserWindow, Menu, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

//process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === "darwin";
const algorithm = 'aes-256-ctr';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let loginWindow;

// Create userlist window
const createUserlistWindow = () => {

  // Implement menu
  //const loginMenu = Menu.buildFromTemplate(menu);
  //Menu.setApplicationMenu(mainMenu);
  
  loginWindow = new BrowserWindow({
    title: 'Login',
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'js/preload.js'),
    },
  });

  loginWindow.loadFile(path.join(__dirname, 'userlist.html'));

  // Open devtools if in dev env
  if (isDev) {
    loginWindow.webContents.openDevTools();
  }
};

// Menu template
/*
const menu  = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      {
        label: 'About',
        click: createAboutWindow
      }
    ]
  }] : []),
  {
    role: 'fileMenu'
  },
  ...(!isMac ? [{
    label: 'Help',
    submenu: [{
      label: 'About',
      click: createAboutWindow
    }]
  }] : [])
]
*/

// Send all users to renderer
ipcMain.on('userlist:get', (e, options) => {
  database = readDatabase();
  loginWindow.webContents.send('userlist:done', database);
});

// Handle loggin
ipcMain.on('login:submit', (e, options) => {
  const {success, option} = loginUser(options.username, options.password);
  if (success) {
    loginWindow.webContents.send('login:success');
    console.log(option);
  } else {
    loginWindow.webContents.send('login:failure', option);
  }
});

// Handle reset
ipcMain.on('reset:submit', (e, options) => {
  const err = resetUser(options.username, options.jwt, options.password);
  if (!err) {
    loginWindow.webContents.send('reset:success');
  } else {
    loginWindow.webContents.send('reset:failure', err);
  }
});

// Handle register
ipcMain.on('register:submit', (e, options) => {
  const err = addUser(options.username, options.jwt, options.password);
  if (!err) {
    loginWindow.webContents.send('register:success');
  } else {
    loginWindow.webContents.send('register:failure', err);
  }
});

// Read the JSON file
const readDatabase = () => {
  try {
    const database = fs.readFileSync(path.join(__dirname, 'users.json'));
    return JSON.parse(database);
  } catch (error) {
    console.error('Error reading the database: ', error);
    return { users: [] };
  }
}

// Write to the JSON file
const writeDatabase = (database) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Error writing to the database: ', error);
  }
}

// Add a new user
const addUser = (username, jwt, password) => {
  const database = readDatabase();
  
  // Check if the username already exists
  const userExists = database.users.some((user) => user.username === username);
  if (userExists) {
    return 'User already exists';
  }

  // Hash the password
  hashed = bcrypt.hashSync(password, 10)

  // Extract salt from hashed password
  salt = hashed.split('$')[3].substr(0, 22);

  // Generate key from password and salt
  key = crypto.scryptSync(password, salt, 32);

  // Encrypt jwt
  jwt = encrypt(jwt, key);

  // Add the new user
  const newUser = { username, jwt, 'password': hashed };
  database.users.push(newUser);

  // Write the updated database to the JSON file
  writeDatabase(database);
  return null;
}

// Login an existing user
const loginUser = (username, password) => {
  const database = readDatabase();
  
  // Find the user in the database
  const user = database.users.find(
    (user) => user.username === username
  );

  // Check if the user exists
  if (!user) {
    return {success: false, option: 'Invalid username'};
  }

  // Check if the password is correct
  if (!bcrypt.compareSync(password, user.password)) {
    return {success: false, option: 'Invalid password'};
  }

  // Extract salt from the stored password
  salt = user.password.split('$')[3].substr(0, 22)

  // Generate key from password and salt
  key = crypto.scryptSync(password, salt, 32);

  // Decrypt jwt
  jwt = decrypt(user.jwt, key);
  
  return {success: true, option: jwt};
}

const resetUser = (username, jwt, password) => {
  const database = readDatabase();

  // Find the user in the database
  const user = database.users.find(
    (user) => user.username === username
  );

  // Check if the user exists
  if (!user) {
    return {success: false, option: 'Invalid username'};
  }

  // Hash the password
  hashed = bcrypt.hashSync(password, 10)

  // Extract salt from hashed password
  salt = hashed.split('$')[3].substr(0, 22);

  // Generate key from password and salt
  key = crypto.scryptSync(password, salt, 32);

  // Encrypt jwt
  jwt = encrypt(jwt, key);

  // Reset the user
  user.jwt = jwt;
  user.password = hashed;

  // Write the updated database to the JSON file
  writeDatabase(database);
  return null;
}

// Encrypt text using key
function encrypt(text, key) {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt text using key
function decrypt(text, key) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// App is ready
app.on('ready', createUserlistWindow);

app.on('window-all-closed', () => {
  if (isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});