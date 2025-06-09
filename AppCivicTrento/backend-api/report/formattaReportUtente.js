const fs = require("fs");

const reportPath = "report/test-report_utente.json";
const statusCodePath = "report/status_codes_utente.json";

let statusMap = {};

try {
  // Se esiste il file con gli status code, caricalo
  if (fs.existsSync(statusCodePath)) {
    const rawStatus = fs.readFileSync(statusCodePath, "utf-8");
    const listaStatus = JSON.parse(rawStatus);

    // Mappa: titolo del test → statusCode
    listaStatus.forEach(entry => {
      statusMap[entry.title] = entry.statusCode;
    });
  }

  // Leggi il report dei test utente
  const raw = fs.readFileSync(reportPath, "utf-8");
  const dati = JSON.parse(raw);

  console.log("\n📋 Risultati dei Test:");
  console.log("======================");

  dati.testResults.forEach(suite => {
    suite.assertionResults.forEach(test => {
      const titolo = `${test.ancestorTitles.join(" > ")} > ${test.title}`;
      const risultato = test.status === "passed" ? "✅ PASSATO" : "❌ FALLITO";
      const statusCode = statusMap[test.title] !== undefined ? ` (Status: ${statusMap[test.title]})` : "";
      console.log(`${risultato} → ${titolo}${statusCode}`);
    });
  });

  console.log("\nTotali:");
  console.log(`✔️  Passati: ${dati.numPassedTests}`);
  console.log(`❌ Falliti: ${dati.numFailedTests}`);
  console.log(`📂 Suite totali: ${dati.numTotalTestSuites}`);
} catch (err) {
  console.error("Errore nella lettura del file:", err.message);
}
