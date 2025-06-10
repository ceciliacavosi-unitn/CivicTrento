const fs = require("fs");
const path = require("path");

// Percorso al file consumi
const pathConsumi = path.join(__dirname, "data", "consumi.json");

// Soglie e punteggi
const soglie = {
  acqua: 120,       // m³
  elettrica: 1000,  // kWh
  gas: 900          // Smc
};

const punteggiFissi = {
  acqua: 10,
  elettrica: 15,
  gas: 15
};

// Carica consumi
let consumiData = [];
try {
  const rawData = fs.readFileSync(pathConsumi, "utf-8");
  consumiData = JSON.parse(rawData);
  console.log("✔️ File consumi.json caricato con successo.");
} catch (err) {
  console.error("❌ Errore nella lettura del file consumi:", err);
  return;
}

// Calcolo punti
function calcolaPunti(consumo, tipo) {
  const soglia = soglie[tipo];
  const punti = punteggiFissi[tipo];
  return (typeof consumo === "number" && consumo <= soglia) ? punti : 0;
}

// Funzione principale
function applicaBonusBolletta(nome, cognome, codicePOD, utentiData) {
  console.log(`➡️ Applicazione bonus bollette per: ${nome} ${cognome} (POD: ${codicePOD})`);

  const consumoRecord = consumiData.find(c => c.codicePOD === codicePOD);
  if (!consumoRecord) {
    console.warn(`⚠️ Nessun consumo trovato per codice POD ${codicePOD}`);
    return;
  }

  const utente = utentiData.find(
    u => u.nome.toLowerCase() === nome.toLowerCase() &&
         u.cognome.toLowerCase() === cognome.toLowerCase()
  );

  if (!utente) {
    console.warn(`⚠️ Utente ${nome} ${cognome} non trovato.`);
    return;
  }

  if (!Array.isArray(utente.storico)) utente.storico = [];

  const trimestri = consumoRecord.consumiTrimestrali || {};
  const tipi = ["luce", "gas", "acqua"];

  for (const [trimestre, valori] of Object.entries(trimestri)) {
    tipi.forEach(tipo => {
      const consumo = valori[tipo];
      if (typeof consumo !== "number") return;

      const giàPresente = utente.storico.some(
        voce =>
          voce.azione === `Consumi ${tipo} nel range` &&
          voce.trimestre === trimestre
      );

      if (giàPresente) {
        // Imposta daAggiungereAlSaldo a false se esiste già
        const voceEsistente = utente.storico.find(entry =>
            entry.azione === `Consumi ${tipo} nel range` &&
          voce.trimestre === trimestre
        );

        if (voceEsistente && voceEsistente.daAggiungereAlSaldo !== false) {
            voceEsistente.daAggiungereAlSaldo = false;
            console.log(`ℹ️ Bolletta già presente: aggiornata daAggiungereAlSaldo a false.`);
        } else {
            console.log(`ℹ️ Bolletta già presente e già processata.`);
        }

        return;
    }

      const punti = calcolaPunti(consumo, tipo);
      if (punti > 0) {
        utente.storico.push({
          azione: `Consumi ${tipo} nel range`,
          trimestre,
          consumo,
          saldo: punti,
          data: new Date().toISOString().split("T")[0],
          daAggiungereAlSaldo: true
        });

        console.log(`✅ Bonus ${punti} per ${tipo} - ${trimestre} inserito per ${nome} ${cognome}`);
      }
    });
  }
}

module.exports = {
  applicaBonusBolletta
};
