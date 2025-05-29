const fs = require('fs');
const path = require('path');

// === VERSIONE FILE JSON ATTIVA ===
const utentiPath = path.join(__dirname, 'data', 'utenti.json');
const MILLISECONDI_IN_1_ANNO = 1000 * 60 * 60 * 24 * 365;

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
    if (ora - ultima < MILLISECONDI_IN_1_ANNO) {
      attivi.push(utente);
    } else {
      eliminati++;
      console.log(`Eliminato: ${utente.email}`);

      // === Rimozione dati associati ===
      const storicoPath = path.join(__dirname, 'data', 'storico.json');
      const datiCittadinoPath = path.join(__dirname, 'data', 'dati_cittadino.json');
      const tokenPath = path.join(__dirname, 'password_reset_tokens.txt');

      //Rimuove dallo storico
      if (fs.existsSync(storicoPath)) {
        try {
            const storico = JSON.parse(fs.readFileSync(storicoPath, 'utf8'));
            const filtrato = storico.filter(e => e.email !== utente.email);
            fs.writeFileSync(storicoPath, JSON.stringify(filtrato, null, 2));
            console.log(`Rimossi dati storico per ${utente.email}`);
        } catch (err) {
            console.error(`Errore rimozione storico: ${err.message}`);
        }
      }

      //Rimuove da dati_cittadino.json
      if (fs.existsSync(datiCittadinoPath)) {
        try {
            const dati = JSON.parse(fs.readFileSync(datiCittadinoPath, 'utf8'));
            const filtrato = dati.filter(d => d.email !== utente.email);
            fs.writeFileSync(datiCittadinoPath, JSON.stringify(filtrato, null, 2));
            console.log(`Rimossi dati civici per ${utente.email}`);
        } catch (err) {
            console.error(`Errore rimozione dati_cittadino: ${err.message}`);
        }
      }

      // 3. Rimuovi eventuali token di recupero password
      if (fs.existsSync(tokenPath)) {
        try {
            const righe = fs.readFileSync(tokenPath, 'utf8')
            .split('\n')
            .filter(r => !r.startsWith(utente.email + ','));
            fs.writeFileSync(tokenPath, righe.join('\n'));
            console.log(`Rimossi token di recupero per ${utente.email}`);
        } catch (err) {
            console.error(`Errore rimozione token: ${err.message}`);
        }
      }

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
    ultimaAttivita: { $lt: new Date(ora - MILLISECONDI_IN_1_ANNO) }
  });

  for (const utente of utentiInattivi) {
    await Utente.deleteOne({ _id: utente._id });
    console.log(`Eliminato utente: ${utente.email}`);
    // Qui potresti eliminare anche storico, premi, ecc.
  }

  console.log(`Cleanup MongoDB completato. Eliminati: ${utentiInattivi.length}`);
  process.exit();
}

// cleanupMongo();
*/
