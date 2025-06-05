const fs = require("fs");
const path = require("path");
// const mongoose = require("mongoose"); // MongoDB disattivato

const FILE_PATH = path.join(__dirname, "data", "codici_pod.json");

// ===================================================
// MongoDB disattivato (puoi riattivare se necessario)
// ===================================================

// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log("Connesso a MongoDB"))
//   .catch(err => console.error("Errore connessione MongoDB:", err));

// const podSchema = new mongoose.Schema({
//   codicePOD: { type: String, required: true, unique: true },
//   consumiTrimestrali: {
//     T1: { luce: Number, gas: Number, acqua: Number },
//     T2: { luce: Number, gas: Number, acqua: Number },
//     T3: { luce: Number, gas: Number, acqua: Number },
//     T4: { luce: Number, gas: Number, acqua: Number }
//   }
// }, {
//   collection: 'codici_pod'
// });

// const CodicePOD = mongoose.model('CodicePOD', podSchema);

// ===================================================
// FUNZIONI BASATE SU FILE JSON
// ===================================================

function generaCodice(i) {
  return `IT001E${String(i).padStart(5, '0')}`;
}

function generaConsumi() {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  return {
    T1: { luce: rand(400, 1200), gas: rand(300, 1000), acqua: rand(200, 800) },
    T2: { luce: rand(400, 1200), gas: rand(300, 1000), acqua: rand(200, 800) },
    T3: { luce: rand(400, 1200), gas: rand(300, 1000), acqua: rand(200, 800) },
    T4: { luce: rand(400, 1200), gas: rand(300, 1000), acqua: rand(200, 800) }
  };
}

function generaDati(n = 30) {
  const lista = [];
  for (let i = 1; i <= n; i++) {
    lista.push({
      codicePOD: generaCodice(i),
      consumiTrimestrali: generaConsumi()
    });
  }
  return lista;
}

function scriviJSON(dati) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(dati, null, 2));
  console.log(`[scriviJSON] File ${FILE_PATH} generato con ${dati.length} record`);
}

const dati = generaDati();
scriviJSON(dati);

// // Inserisce anche nel DB (disattivato)
// CodicePOD.insertMany(dati).then(() => {
//   console.log("Dati salvati su MongoDB");
//   mongoose.disconnect();
// });
