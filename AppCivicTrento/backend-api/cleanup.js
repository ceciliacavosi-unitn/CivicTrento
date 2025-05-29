const fs = require('fs');
const path = require('path');

// === VERSIONE FILE JSON ATTIVA ===
const utentiPath = path.join(__dirname, 'data', 'utenti.json');
const MILLISECONDI_IN_5_ANNI = 1000 * 60 * 60 * 24 * 365 * 5;

function cleanupDaFile() {
  if (!fs.existsSync(utentiPath)) {
    console.error('File utenti.json non trovato.');
    return;
  }

  const contenuto = fs.readFileSync(utentiPath, 'utf-8');
  const utenti = contenuto ? JSON.parse(contenuto) : [];
  const ora = new Date();

  const attivi = [];
  let eliminati = 0;

  for (const utente of utenti) {
    if (!utente.ultimaAttivita) {
      attivi.push(utente);
      continue;
    }

    const ultima = new Date(utente.ultimaAttivita);
    if (ora - ultima < MILLISECONDI_IN_5_ANNI) {
      attivi.push(utente);
    } else {
      eliminati++;
      console.log(`Eliminato: ${utente.email}`);
    }
  }

  fs.writeFileSync(utentiPath, JSON.stringify(attivi, null, 2));
  console.log(`Cleanup file JSON completato. Eliminati: ${eliminati}`);
}

cleanupDaFile();


// === VERSIONE MONGOOSE (commentata per ora) ===
/*
const mongoose = require('./mongodb'); // Connessione già gestita nel file
const Utente = mongoose.model('Utente');

async function cleanupMongo() {
  const ora = new Date();
  const utentiInattivi = await Utente.find({
    ultimaAttivita: { $lt: new Date(ora - MILLISECONDI_IN_5_ANNI) }
  });

  for (const utente of utentiInattivi) {
    await Utente.deleteOne({ _id: utente._id });
    console.log(`Eliminato utente: ${utente.email}`);
    // Qui potresti eliminare anche storico, premi, ecc.
  }

  console.log(`Cleanup MongoDB completato. Eliminati: ${utentiInattivi.length}`);
  process.exit();
}

// cleanupMongo(); // decommenta quando usi MongoDB
*/
