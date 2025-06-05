const fs = require("fs");
const path = require("path");
// const mongoose = require("mongoose"); // MongoDB disattivato

const FILE_ABITAZIONI = path.join(__dirname, "data", "abitazioni.json");
const FILE_CODICI_POD = path.join(__dirname, "data", "codici_pod.json");

// ===================================================
// MongoDB disattivato (puoi riattivare se necessario)
// ===================================================

// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log("Connesso a MongoDB"))
//   .catch(err => console.error("Errore connessione MongoDB:", err));

// const abitazioneSchema = new mongoose.Schema({
//   residenza: String,
//   idAbitazione: String,
//   codicePOD: String,
//   classeEnergetica: String,
//   metratura: Number,
//   residenti: [String]
// }, {
//   collection: 'abitazioni'
// });

// const Abitazione = mongoose.model('Abitazione', abitazioneSchema);

// ===================================================
// FUNZIONI BASATE SU FILE JSON
// ===================================================

function caricaCodiciPOD() {
  if (!fs.existsSync(FILE_CODICI_POD)) {
    console.error("[caricaCodiciPOD] File codici_pod.json non trovato.");
    return [];
  }
  const contenuto = fs.readFileSync(FILE_CODICI_POD, "utf8");
  const dati = JSON.parse(contenuto);
  return dati.map(entry => entry.codicePOD);
}

function generaAbitazioni(codiciPOD) {
  const classi = ["A", "B", "C", "D"];
  const carteID = Array.from({ length: 50 }, (_, i) => `cartaID${i + 1}`);
  const residenze = Array.from({ length: 10 }, (_, i) => `residenza_${i + 1}`);

  let lista = [];
  let podIndex = 0;

  for (const residenza of residenze) {
    for (let idLocale = 1; idLocale <= 3; idLocale++) {
      if (podIndex >= codiciPOD.length) break;

      const numRes = Math.floor(Math.random() * 4) + 1;
      const residenti = [];
      while (residenti.length < numRes) {
        const id = carteID[Math.floor(Math.random() * carteID.length)];
        if (!residenti.includes(id)) residenti.push(id);
      }

      lista.push({
        residenza,
        idAbitazione: String(idLocale),
        codicePOD: codiciPOD[podIndex++],
        classeEnergetica: classi[Math.floor(Math.random() * classi.length)],
        metratura: Math.floor(Math.random() * 101) + 50,
        residenti
      });
    }
  }

  return lista;
}

function scriviJSON(dati) {
  fs.writeFileSync(FILE_ABITAZIONI, JSON.stringify(dati, null, 2));
  console.log(`[scriviJSON] File ${FILE_ABITAZIONI} generato con ${dati.length} record`);
}

const codiciPOD = caricaCodiciPOD();
const dati = generaAbitazioni(codiciPOD);
scriviJSON(dati);

// // Inserisce anche nel DB (disattivato)
// Abitazione.insertMany(dati).then(() => {
//   console.log("Dati abitazioni salvati su MongoDB");
//   mongoose.disconnect();
// });
