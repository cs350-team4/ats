const { app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');

//process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === "darwin";
const algorithm = 'aes-256-gcm';

// Public key is hardcoded for testing reasons
let publicKeyEndpoint;
let uiEndpoint;
let loginWindow;
let publicKey;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Create userlist window
const createUserlistWindow = () => {

  // Implement menu
  //const loginMenu = Menu.buildFromTemplate(menu);
  //Menu.setApplicationMenu(loginMenu);

  // Set settings
  updateSettings();
  
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

// Send all users to renderer
ipcMain.on('userlist:get', (_err, _options) => {
  const database = readDatabase();
  loginWindow.webContents.send('userlist:done', database);
});

// Handle login
ipcMain.on('login:submit', (_err, options) => {
  const {success, option} = loginUser(options.username, options.password);
  if (success) {
    loginWindow.webContents.send('login:success');
  } else {
    loginWindow.webContents.send('login:failure', option);
  }
});

// Handle reset
ipcMain.on('reset:submit', (_err, options) => {
  jwt.verify(options.jwt, publicKey, (err, decoded) => {
    if (err) {
      loginWindow.webContents.send('register:failure', 'jwt verification failed');
      return;
    } 
    if (options.username !== decoded.name) {
      loginWindow.webContents.send('register:failure', 'jwt does not belong to this user');
      return;
    }
    err = resetUser(decoded.name, options.jwt, options.password);
    if (!err) {
      loginWindow.webContents.send('register:success');
    } else {
      loginWindow.webContents.send('register:failure', err);
    }
  });
});

// Handle register
ipcMain.on('register:submit', (_err, options) => {
  jwt.verify(options.jwt, publicKey, (err, decoded) => {
    if (err) {
      loginWindow.webContents.send('register:failure', 'jwt verification failed');
      return;
    }
    err = addUser(decoded.name, options.jwt, options.password);
    if (!err) {
      loginWindow.webContents.send('register:success');
    } else {
      loginWindow.webContents.send('register:failure', err);
    }
  });
});

// Send settings to renderer
ipcMain.on('settings:get', (_err, _options) => {
  const settings = readSettings();
  loginWindow.webContents.send('settings:done', settings);
});

// Handle settings change
ipcMain.on('settings:submit', (_err, options) => {
  try {
    const settings = {
      "publicKeyEndpoint": options.publicKeyEndpoint,
      "uiEndpoint": options.uiEndpoint
    };
    writeSettings(settings);
    updateSettings();
    loginWindow.webContents.send('settings:success');
  } catch (error) {
    loginWindow.webContents.send('settings:failure', error);
  }
});

// Read the users.json file
const readDatabase = () => {
  try {
    const database = fs.readFileSync(path.join(__dirname, 'users.json'));
    return JSON.parse(database);
  } catch (error) {
    console.error('Error reading the database: ', error);
    return { users: [] };
  }
}

// Write to the users.json file
const writeDatabase = (database) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Error writing to the database: ', error);
  }
}

// Read the settings.json file
const readSettings = () => {
  try {
    const settings = fs.readFileSync(path.join(__dirname, 'settings.json'));
    return JSON.parse(settings);
  } catch (error) {
    console.error('Error reading settings: ', error);
    return { settings: [] };
  }
}

// Write the settings.json file
const writeSettings = (settings) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error writing settings: ', error);
  }
}

// Write the settings.json file
const updateSettings = () => {
  const settings = readSettings();

  publicKeyEndpoint = settings.publicKeyEndpoint;
  uiEndpoint = settings.uiEndpoint;

  axios.get(publicKeyEndpoint).then(response => {
    publicKey = response.data.publicKey;
  }).catch(_err => {
    loginWindow.webContents.send('pubkey:failure', 'could not retrieve public key');
  });
}

// Add a new user
const addUser = (username, jwt, password) => {
  const database = readDatabase();
  
  // Check if the username already exists
  const userExists = database.users.some((user) => user.username === username);
  if (userExists) {
    return 'User already exists';
  }

  // Generate salt
  const salt = bcrypt.genSaltSync(10);

  // Generate key from password and salt
  const key = crypto.scryptSync(password, salt, 32);

  // Encrypt jwt
  const {encrypted, iv, authTag} = encrypt(jwt, key);

  // Add the new user
  const newUser = { username, jwt: encrypted, iv, authTag, salt };
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

  // Generate key from password and salt
  const key = crypto.scryptSync(password, user.salt, 32);

  // Decrypt jwt
  const {success, option} = decrypt(user.jwt, user.iv, user.authTag, key);

  // Check if the password is correct
  if (!success) {
    return {success: false, option: 'Invalid password'};
  }
  
  return {success: true, option};
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

  // Generate salt
  const salt = bcrypt.genSaltSync(10);

  // Generate key from password and salt
  const key = crypto.scryptSync(password, salt, 32);

  // Encrypt jwt
  const {encrypted, iv, authTag} = encrypt(jwt, key);

  // Update the user
  user.jwt = encrypted;
  user.iv = iv;
  user.authTag = authTag;
  user.salt = salt;

  // Write the updated database to the JSON file
  writeDatabase(database);
  return null;
}

// Encrypt text using key
const encrypt = (text, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {encrypted: (encrypted.toString('hex')), iv: (iv.toString('hex')), authTag: (cipher.getAuthTag().toString('hex'))};
};

// Decrypt text using iv, authTag, and key
const decrypt = (encrypted, iv, authTag, key) => {
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return { success: true, option: decrypted.toString('hex')};
  } catch (error) {
    return { success: false, option: error};
  }
};

// App is ready
app.on('ready', createUserlistWindow);

app.on('window-all-closed', () => {
  if (isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createUserlistWindow();
  }
});