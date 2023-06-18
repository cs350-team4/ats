const { app, BrowserWindow, Menu, ipcMain} = require('electron');
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
let mainWindow;
let publicKey;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Create userlist window
const createUserlistWindow = () => {

  // Set
  Menu.setApplicationMenu(menu)

  // Set settings
  updateSettings();
  
  mainWindow = new BrowserWindow({
    title: 'Login',
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'js/preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'userlist.html'));

  // Open devtools if in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.maximize();
};

// Send all users to renderer
ipcMain.on('userlist:get', (_err, _options) => {
  const database = readDatabase();
  mainWindow.webContents.send('userlist:done', database);
});

// Handle login
ipcMain.on('login:submit', (_err, options) => {
  const {success, option} = loginUser(options.username, options.password);
  if (success) {
    mainWindow.loadURL(uiEndpoint);
    mainWindow.webContents.once('did-finish-load', () => {
      injectJWT(option);
    });
  } else {
    mainWindow.webContents.send('login:failure', option);
  }
});

// Handle reset
ipcMain.on('reset:submit', (_err, options) => {
  jwt.verify(options.jwt, publicKey, (err, decoded) => {
    if (err) {
      mainWindow.webContents.send('register:failure', 'JWT verification failed');
      return;
    } 
    if (options.username !== decoded.name) {
      mainWindow.webContents.send('register:failure', 'JWT does not belong to this user');
      return;
    }
    err = resetUser(decoded.name, options.jwt, options.password);
    if (!err) {
      mainWindow.webContents.send('register:success');
    } else {
      mainWindow.webContents.send('register:failure', err);
    }
  });
});

// Handle register
ipcMain.on('register:submit', (_err, options) => {
  jwt.verify(options.jwt, publicKey, (err, decoded) => {
    if (err) {
      mainWindow.webContents.send('register:failure', 'JWT verification failed');
      return;
    }
    err = addUser(decoded.name, options.jwt, options.password);
    if (!err) {
      mainWindow.webContents.send('register:success');
    } else {
      mainWindow.webContents.send('register:failure', err);
    }
  });
});

// Send settings to renderer
ipcMain.on('settings:get', (_err, _options) => {
  const settings = readSettings();
  mainWindow.webContents.send('settings:done', settings);
});

// Handle settings change
ipcMain.on('settings:submit', (_err, options) => {
  try {

    writeSettings({
      "publicKeyEndpoint": options.publicKeyEndpoint,
      "uiEndpoint": options.uiEndpoint
    });
    updateSettings();
  } catch (error) {
    mainWindow.webContents.send('settings:failure', error);
  }
});

// Read the users.json file
const readDatabase = () => {
  
  // Create Database if doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'users.json'))) {
    writeDatabase({
      "users": []
    });
  }
  
  try {
    const database = fs.readFileSync(path.join(__dirname, 'users.json'));
    return JSON.parse(database);
  } catch (error) {
    console.error('Error while reading the database: ', error);
    return { users: [] };
  }
}

// Write to the users.json file
const writeDatabase = (database) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Error while writing to the database: ', error);
  }
}

// Read the settings.json file
const readSettings = () => {
  
  // Create Settings if doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'settings.json'))) {
    writeSettings({ 
      "publicKeyEndpoint": "", 
      "uiEndpoint": "" 
    });
  }
  
  try {
    const settings = fs.readFileSync(path.join(__dirname, 'settings.json'));
    return JSON.parse(settings);
  } catch (error) {
    console.error('Error while reading settings: ', error);
    return { settings: [] };
  }
}

// Write the settings.json file
const writeSettings = (settings) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error while writing settings: ', error);
  }
}

// Write the settings.json file
const updateSettings = () => {
  const settings = readSettings();

  publicKeyEndpoint = settings.publicKeyEndpoint;
  uiEndpoint = settings.uiEndpoint;

  axios.get(publicKeyEndpoint).then(response => {
    publicKey = response.data.publicKey;
    mainWindow.webContents.send('settings:success');
  }).catch(_err => {
    mainWindow.webContents.send('settings:failure', 'could not retrieve public key');
  });
}

// Add a new user
const addUser = (username, jwt, password) => {
  const database = readDatabase();
  
  // Check if the username already exists
  const userExists = database.users.some((user) => user.username === username);
  if (userExists) {
    return 'user already exists';
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
    return {success: false, option: 'invalid username'};
  }

  // Generate key from password and salt
  const key = crypto.scryptSync(password, user.salt, 32);

  // Decrypt jwt
  const {success, option} = decrypt(user.jwt, user.iv, user.authTag, key);

  // Check if the password is correct
  if (!success) {
    return {success: false, option: 'invalid password'};
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
    return {success: false, option: 'invalid username'};
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

const injectJWT = (jwtToken) => {
  const script = `
    const checkExist = setInterval(function() {
      const textarea = document.querySelector('form textarea');
      if (textarea) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          nativeInputValueSetter.call(textarea, '${jwtToken}');
          const ev2 = new Event('input', { bubbles: true});
          textarea.dispatchEvent(ev2);
          const submitButton = document.querySelector('form button[type="submit"]');
          if (submitButton) {
            submitButton.click();
            clearInterval(checkExist);
          }
      }
    }, 10);
  `;
  mainWindow.webContents.executeJavaScript(script);
};

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
    return { success: true, option: decrypted};
  } catch (error) {
    return { success: false, option: error};
  }
};

const menu = Menu.buildFromTemplate([
  {
    label: 'Exit to Main Menu',
      click: () => {
        mainWindow.loadFile(path.join(__dirname, 'userlist.html'));
      }
  }
]);

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
