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

    const db = client.db("civicTrento");
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

run().catch(console.dir);

//Carica le variabili di ambiente
require('dotenv').config();

// Importa la libreria mongoose che facilita la comunicazione con MongoDB
const mongoose = require('mongoose');

// Connessione al database 'test' in MongoDB sulla porta predefinita (27017)
mongoose.connect(process.env.DB_URL).then(() => console.log('Connesso a MongoDB')).catch(err => console.error('Errore nella connessione a MongoDB', err));

// Crea un modello chiamato 'Utente'
const Utente = mongoose.model('Utente', { 
  nome: String, 
  cognome: String, 
  email: String, 
  password: String, 
  CF: String, 
  cartaID: String
}, 'utenti');

// Crea un nuovo documento 'utente1'
const utente1 = new Utente({
  nome: 'nome1',
  cognome: 'cognome1', 
  email: 'email1', 
  password: 'password1', 
  CF: 'CF1', cartaID: 
  'cartaID1'
});
