const fs = require("fs");
const path = require("path");

// Percorso al file votazioni
const pathVotazioni = path.join(__dirname, "data", "voto_abitantiTN.json");

// Carica dati votazioni
let votazioniData = [];
try {
  const rawData = fs.readFileSync(pathVotazioni, "utf-8");
  votazioniData = JSON.parse(rawData);
  console.log("✔️ File delle votazioni caricato con successo.");
} catch (error) {
  console.error("❌ Errore nella lettura del file delle votazioni:", error);
  return;
}

// Funzione per applicare bonus voto
function applicaBonusVoto(nome, cognome, cartaID, utentiData) {
  console.log(`➡️ Verifica votazioni per: ${nome} ${cognome}, cartaID decifrata: ${cartaID}`);

  const utente = utentiData.find(
    u =>
      u.nome.toLowerCase() === nome.toLowerCase() &&
      u.cognome.toLowerCase() === cognome.toLowerCase()
  );

  if (!utente) {
    console.warn(`⚠️ Utente ${nome} ${cognome} non trovato.`);
    return;
  }

  if (!Array.isArray(utente.storico)) utente.storico = [];

  const votazioniUtente = votazioniData.find(
    v => v.cartaID.toUpperCase() === cartaID.toUpperCase()
  );

  if (!votazioniUtente || !Array.isArray(votazioniUtente.votazioni)) {
    console.log(`ℹ️ Nessuna votazione trovata per cartaID ${cartaID}.`);
    return;
  }

  votazioniUtente.votazioni.forEach(dataVoto => {
    const giàPresente = utente.storico.some(
      entry =>
        entry.azione === "Voto" &&
        entry.data === dataVoto &&
        entry.cartaID === cartaID
    );

    if (giàPresente) {
        // Imposta daAggiungereAlSaldo a false se esiste già
        const voceEsistente = utente.storico.find(entry =>
            entry.azione === "Voto" &&
            entry.data === dataVoto &&
            entry.cartaID === m.cartaID
        );

        if (voceEsistente && voceEsistente.daAggiungereAlSaldo !== false) {
            voceEsistente.daAggiungereAlSaldo = false;
            console.log(`ℹ️ Voto già presente: aggiornata daAggiungereAlSaldo a false.`);
        } else {
            console.log(`ℹ️ Voto già presente e già processato.`);
        }

        return;
    }


    utente.storico.push({
      azione: "Voto",
      data: dataVoto,
      cartaID,
      saldo: 100,
      daAggiungereAlSaldo: true
    });

    console.log(`✅ Bonus voto +100 aggiunto per data ${dataVoto}.`);
  });

  console.log(`✅ Bonus voto gestito per ${nome} ${cognome}`);
}

module.exports = {
  applicaBonusVoto
};
