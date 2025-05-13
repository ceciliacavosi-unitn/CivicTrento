// Importa il costruttore MongoClient dalla libreria "mongodb"
const { MongoClient } = require("mongodb");

// Definisce l'URI di connessione al server MongoDB (in questo caso locale)
const uri = "mongodb://localhost:27017/";

// Crea un nuovo client MongoDB usando l'URI fornito
const client = new MongoClient(uri);

// Funzione asincrona principale per gestire le operazioni con il database
async function run() {
  try {
    // Tenta di aprire una connessione al server MongoDB
    await client.connect();

    // Accede al database chiamato "sample_guides"
    // Se non esiste, MongoDB lo crea al primo inserimento
    const db = client.db("civicTrento");

    // Accede alla collezione chiamata "planets"
    // Anche questa viene creata automaticamente se non esiste
    const coll = db.collection("utenti");

    // Recupera tutti i documenti presenti nella collezione
    const cursor = coll.find();

    // Itera sui documenti trovati e li stampa in console
    await cursor.forEach(console.log);
  } finally {
    // Chiude la connessione al database, anche in caso di errore
    await client.close();
  }
}

// Avvia la funzione "run" e stampa eventuali errori sulla console
run().catch(console.dir);
