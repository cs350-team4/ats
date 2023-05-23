// To use Html5QrcodeScanner (more info below)
let client_tok = ""
async function onScanSuccess(decodedText, decodedResult) {
  // handle the scanned code as you like, for example:
  const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9." + decodedText;
  client_tok = jwt;
  await html5QrcodeScanner.clear();
  console.log(jwt);
  const data = {"game_id": 2, "password": "pwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpw", "client_token": jwt};
  const res = await fetch("http://localhost:8000/games/start", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.log(res.statusText);
  } else {
    console.log("started game");
  }
  let gameDiv = document.getElementById("game");
  gameDiv.style.visibility = "visible";
}

function onScanFailure(error) {
  // handle scan failure, usually better to ignore and keep scanning.
  // for example:
  console.warn(`Code scan error = ${error}`);
}

let html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  { fps: 10, qrbox: {width: 250, height: 250} },
  /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);


const endGameBut = document.getElementById("submit");

endGameBut.addEventListener("click", async (_e) => {
  let score = parseInt(document.getElementById("score").value);
  const data = {
  "game_id": 2, "password": "pwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpw",
    "client_token": client_tok,
    "score": score
  };

  const res = await fetch("http://localhost:8000/games/end", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.log(res.statusText);
  } else {
    console.log("ended game");
  }

  let gameDiv = document.getElementById("game");
  gameDiv.style.visibility = "hidden";
  html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: {width: 250, height: 250} },
    /* verbose= */ false);
  html5QrcodeScanner.render(onScanSuccess, onScanFailure);
})
