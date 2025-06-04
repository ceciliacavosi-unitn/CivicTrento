const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'data', 'utenze.json');

function aggiungiOModificaUtenza({ idUtente, utenza, codicePOD, fornitore, consenso }) {
  let utenze = [];
  if (fs.existsSync(filePath)) {
    utenze = JSON.parse(fs.readFileSync(filePath));
  }

  const index = utenze.findIndex(u => u.idUtente === idUtente && u.utenza === utenza);
  if (index >= 0) {
    utenze[index] = { idUtente, utenza, codicePOD, fornitore, consenso };
  } else {
    utenze.push({ idUtente, utenza, codicePOD, fornitore, consenso });
  }

  fs.writeFileSync(filePath, JSON.stringify(utenze, null, 2));
  console.log("Utenza salvata con successo.");
}

module.exports = { aggiungiOModificaUtenza };
