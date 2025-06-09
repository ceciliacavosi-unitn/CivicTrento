// gestione_movimento.js
const fs = require('fs');
const path = require('path');
const { calcolaPuntiSpostamento } = require('./gestione_punti');

const utentiPath = path.join(__dirname, 'data', 'utenti_completo.json');

function registraSpostamento(email, distanzaKm) {
  if (!fs.existsSync(utentiPath)) {
    console.error("File utenti_completo.json non trovato.");
    return false;
  }

  try {
    const utenti = JSON.parse(fs.readFileSync(utentiPath, 'utf8'));
    const utente = utenti.find(u => u.email === email);

    if (!utente) {
      console.error("Utente non trovato:", email);
      return false;
    }

    const punti = calcolaPuntiSpostamento(distanzaKm);
    const nuovoSpostamento = {
      azione: `spostamento ${distanzaKm.toFixed(1)} km`,
      data: new Date().toISOString(),
      punti
    };

    utente.storico.push(nuovoSpostamento);
    utente.saldo += punti;

    fs.writeFileSync(utentiPath, JSON.stringify(utenti, null, 2), 'utf8');
    console.log("Spostamento registrato con successo per:", email);
    return true;

  } catch (err) {
    console.error("Errore durante la registrazione dello spostamento:", err);
    return false;
  }
}

module.exports = { registraSpostamento };
