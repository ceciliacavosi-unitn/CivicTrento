// =======================================================
// 📦 gestione_punti.js
// ✅ Gestione punteggi da file JSON (storico.json)
// ✅ Restituisce oggetti completi per frontend (tipo, distanza_km, gravita, data...)
// =======================================================

const fs = require('fs');
const path = require('path');

// 📂 Percorso del file JSON attivo
const punteggiPath = path.join(__dirname, 'data', 'storico.json');

// 🌐 Connessione MongoDB disabilitata (commentata)
/*
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connesso a MongoDB per assegnazione punti'))
.catch(err => console.error('❌ Errore connessione MongoDB:', err));
*/

// 📄 Schema MongoDB (commentato)
/*
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
    gravi: String
  },
  spostamenti_bici_piedi: {
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
// 🔄 Caricamento configurazione (JSON attivo, MongoDB commentato)
// =======================================================

function caricaConfigurazionePunti() {
  // ✅ VERSIONE FILE JSON (attiva)
  if (!fs.existsSync(punteggiPath)) {
    console.error("❌ File storico.json non trovato.");
    return null;
  }

  try {
    const rawData = fs.readFileSync(punteggiPath, 'utf8');
    const json = JSON.parse(rawData);
    const storico = json.storico;

    // 🎯 Configurazione estratta dinamicamente dallo storico
    const config = {
      voto_elettorale: storico.find(e => e.azione === "voto_elettorale")?.punti ?? null,
      bollette: {},
      multe: {},
      spostamenti_bici_piedi: {},
      abbonamento_mezzi_pubblici: null
    };

    for (const evento of storico) {
      switch (evento.azione) {
        case "bolletta":
          config.bollette[evento.tipo] = evento.punti;
          break;
        case "spostamento":
          const key = evento.distanza_km <= 5 ? "0_5_km" : "oltre_5_km";
          config.spostamenti_bici_piedi[key] = evento.punti;
          break;
        case "abbonamento_mezzi_pubblici":
          config.abbonamento_mezzi_pubblici = evento.punti;
          break;
        case "multa":
          config.multe[evento.gravita] = evento.punti;
          break;
        default:
          break;
      }
    }

    return config;
  } catch (err) {
    console.error("❌ Errore lettura storico.json:", err);
    return null;
  }

  // 🌐 VERSIONE MONGODB (commentata)
  /*
  try {
    const config = await ConfigurazionePunti.findOne();
    if (!config) {
      console.warn("⚠️ Nessuna configurazione trovata nel database.");
      return null;
    }
    return config.toObject();
  } catch (err) {
    console.error("❌ Errore lettura configurazione MongoDB:", err);
    return null;
  }
  */
}


// =======================================================
// 🎯 FUNZIONI PUNTI PURI (solo valore numerico)
// =======================================================

function getPuntiBolletta(tipo) {
  const config = caricaConfigurazionePunti();
  if (!config) return null;

  // 🔧 JSON
  return config?.bollette?.[tipo] ?? null;

  // 🌐 MongoDB (commentato)
  // return config.bollette?.[tipo] ?? null;
}

function getPuntiMulta(gravita) {
  const config = caricaConfigurazionePunti();
  if (!config) return null;

  return config?.multe?.[gravita] ?? null;

  // 🌐 MongoDB
  // return config.multe?.[gravita] ?? null;
}

function getPuntiSpostamento(distanzaKm) {
  const config = caricaConfigurazionePunti();
  if (!config) return null;

  if (distanzaKm <= 5) {
    return config?.spostamenti_bici_piedi?.["0_5_km"] ?? null;
  } else {
    return config?.spostamenti_bici_piedi?.["oltre_5_km"] ?? null;
  }

  // 🌐 MongoDB
  /*
  return distanzaKm <= 5
    ? config.spostamenti_bici_piedi?.["0_5_km"] ?? null
    : config.spostamenti_bici_piedi?.["oltre_5_km"] ?? null;
  */
}

function getPuntiVoto() {
  const config = caricaConfigurazionePunti();
  if (!config) return null;

  return config?.voto_elettorale ?? null;

  // 🌐 MongoDB
  // return config.voto_elettorale ?? null;
}

function getPuntiAbbonamentoMezziPubblici() {
  const config = caricaConfigurazionePunti();
  if (!config) return null;

  return config?.abbonamento_mezzi_pubblici ?? null;

  // 🌐 MongoDB
  // return config.abbonamento_mezzi_pubblici ?? null;
}

function getBonusIniziale() {
  const config = caricaConfigurazionePunti();
  if (!config) return null;

  return config?.bonus_iniziale ?? null;

  // 🌐 MongoDB
  // return config.bonus_iniziale ?? null;
}

// =======================================================
// 📦 FUNZIONI COMPLETE (per storico frontend)
// =======================================================

function getStoricoBolletta(tipo) {
  const config = caricaConfigurazionePunti();
  if (!config || !tipo) return null;

  const punti = config?.bollette?.[tipo];
  if (punti == null) return null;

  return {
    tipo,
    punti
  };
}

function getStoricoSpostamento(distanzaKm) {
  const config = caricaConfigurazionePunti();
  if (!config || distanzaKm == null) return null;

  const punti = distanzaKm <= 5
    ? config?.spostamenti_bici_piedi?.["0_5_km"]
    : config?.spostamenti_bici_piedi?.["oltre_5_km"];

  if (punti == null) return null;

  return {
    distanza_km: distanzaKm,
    punti
  };
}

function getStoricoMulta(gravita, dataUltimaMulta) {
  const config = caricaConfigurazionePunti();
  if (!config || !gravita) return null;

  const punti = config?.multe?.[gravita];
  if (punti == null) return null;

  return {
    gravita,
    punti,
    dataUltimaMulta: dataUltimaMulta || new Date().toISOString()
  };
}

function getStoricoVoto() {
  const config = caricaConfigurazionePunti();
  if (!config) return null;

  return {
    punti: config?.voto_elettorale ?? null
  };
}

function getStoricoAbbonamentoMezziPubblici() {
  const config = caricaConfigurazionePunti();
  if (!config) return null;

  return {
    punti: config?.abbonamento_mezzi_pubblici ?? null
  };
}

// =======================================================
// 🧾 Esportazione
// =======================================================

module.exports = {
  // ✅ Metodi numerici puri
  getPuntiBolletta,
  getPuntiMulta,
  getPuntiSpostamento,
  getPuntiVoto,
  getPuntiAbbonamentoMezziPubblici,
  getBonusIniziale,

  // ✅ Metodi arricchiti per storico
  getStoricoBolletta,
  getStoricoSpostamento,
  getStoricoMulta,
  getStoricoVoto,
  getStoricoAbbonamentoMezziPubblici
};

