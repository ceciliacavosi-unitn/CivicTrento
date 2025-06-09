// =======================================================
// gestione_punti.js basato su utenti_completo.json
// Estrae i punteggi base dall'ultimo evento rilevante dello storico
// =======================================================

const fs = require('fs');
const path = require('path');

const utentiPath = path.join(__dirname, 'data', 'utenti_completo.json');

// MongoDB disattivato (commentato)
/*
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connesso a MongoDB per assegnazione punti'))
.catch(err => console.error('Errore connessione MongoDB:', err));

const puntiSchema = new mongoose.Schema({
  bonus_iniziale: Number,
  bollette: {
    acqua: Number,
    elettrica: Number,
    gas: Number
  },
  multe: {
    "1_anno_senza_multe": Number,
    medie: Number,
    gravi: Number
  },
  spostamenti_piedi: {
    "0_5_km": Number,
    "oltre_5_km": Number
  },
  voto_elettorale: Number,
  abbonamento_mezzi_pubblici: Number
}, {
  collection: 'configurazione_punti',
  versionKey: false
});
const ConfigurazionePunti = mongoose.model('ConfigurazionePunti', puntiSchema);
*/

// =======================================================
// gestione_punti.js
// Calcola i punti in base ai km (non legge dallo storico)
// =======================================================

function calcolaPuntiSpostamento(km) {
  if (km < 1) return 0;
  if (km <= 5) return +(km * 0.5).toFixed(2);
  return +(km * 1.0).toFixed(2);
}

module.exports = {
  calcolaPuntiSpostamento
};