const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");

const app = express();
app.use(bodyParser.json()); // abilita il supporto JSON nel body delle richieste

const {
  registraUtente,
  trovaCredenziali,
  cancellaUtente,
  utenteEsiste
} = require("./gestione_autenticazione");

const { 
  getProfiloUtente, 
  modificaProfiloUtente,
  verificaUtente 
} = require("./gestione_utenti");

const {
  getDatiCittadino,
  aggiungiDato,
  modificaDato,
  rimuoviDato,
  rimuoviTutti
} = require("./gestione_cittadino");

//pagina principale
app.get("/", (req, res) => {
  res.send(`
    <h1>Benvenuto nell'API CivicTrento</h1>
    <p>Queste sono le principali rotte disponibili:</p>
    <ul>
      <li><strong>POST</strong> /auth/register</li>
      <li><strong>POST</strong> /auth/login</li>
      <li><strong>POST</strong> /auth/logout</li>
      <li><strong>DELETE</strong> /auth/delete_user</li>
      <li><strong>POST</strong> /utente/profilo</li>
      <li><strong>PUT</strong> /utente/modifica_profilo</li>
      <li><strong>POST</strong> /cittadino/dati</li>
      <li><strong>POST</strong> /cittadino/aggiungi_dato</li>
      <li><strong>PUT</strong> /cittadino/modifica_dato</li>
      <li><strong>DELETE</strong> /cittadino/rimuovi_dato</li>
      <li><strong>DELETE</strong> /cittadino/rimuovi_tutti</li>
    </ul>
    <p>⚠️ Le rotte vanno testate con strumenti come Postman, curl o una frontend app, poiché la maggior parte richiede <code>POST</code> o <code>DELETE</code> con JSON nel body.</p>
  `);
});


//autenticazione

/**
 * ✅ REGISTRAZIONE: salva nel DB + file JSON
 */
app.post("/auth/register", async (req, res) => {
  const { name, surname, email, password, fiscal_code, id_card_number } = req.body;

  const success = await registraUtente({
    nome: name.trim(),
    cognome: surname.trim(),
    email: email.trim(),
    password: password.trim(),
    CF: fiscal_code.trim(),
    cartaID: id_card_number.trim()
  });

  if (success) {
    res.json({ status: "success", message: "Registrazione completata" });
  } else {
    res.status(409).json({ detail: "Utente già registrato" });
  }
});

  
/**
 * ✅ LOGIN: verifica le credenziali nel DB
 */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("📩 Email ricevuta:", email);
  console.log("📥 Password ricevuta:", password);

  const credenziali = await trovaCredenziali(email.trim(), password.trim());

  if (!credenziali) {
    return res.status(404).json({ detail: "Utente non trovato o credenziali non valide" });
  }

  res.json({ status: "success", message: "Login effettuato" });
});

  
/**
 * ✅ DELETE: elimina da DB e file JSON
 */
app.delete("/auth/delete_user", async (req, res) => {
  const { email, password } = req.body;

  const success = await cancellaUtente(email.trim(), password.trim());

  if (!success) {
    return res.status(404).json({ detail: "Utente non trovato o credenziali errate" });
  }

  res.json({ status: "success", message: `Utente ${email} eliminato correttamente` });
});
  
/*
✅ LOGOUT: verifica esistenza nel DB o JSON
 */
app.post("/auth/logout", async (req, res) => {
  const { email } = req.body;

  const esiste = await utenteEsiste(email.trim());

  if (!esiste) {
    return res.status(404).json({ detail: "Utente non trovato" });
  }

  res.json({ status: "success", message: `Logout effettuato per ${email}` });
});


//profilo utente 
/**
 * ✅ RETURN UTENTE
 * - Riceve email e password
 * - Cerca i dati utente in utenti.json (e anche in MongoDB, ma solo commentato)
 * - Restituisce i dati (nome, cognome, email, CF, cartaID)
 */
app.post("/utente/profilo", async (req, res) => {
  const { email, password } = req.body;

  const profilo = await getProfiloUtente(email.trim(), password.trim());

  if (!profilo) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  res.json(profilo);
});


/**
 * ✅ MODIFICA PROFILO UTENTE
 * - Riceve email, password, campo da modificare e nuovo valore
 * - Aggiorna sia MongoDB che il file utenti.json
 * - Restituisce conferma solo se almeno uno dei due è stato aggiornato
 */
app.put("/utente/modifica_profilo", async (req, res) => {
  const { email, password, field, new_value } = req.body;

  const successo = await modificaProfiloUtente(email.trim(), password.trim(), field, new_value);

  if (!successo) {
    return res.status(401).json({ detail: "Utente non trovato o credenziali errate" });
  }

  res.json({ status: "success", field, new_value });
});


//cittadino
/**
 * ✅ GET DATI CITTADINO
 * - Restituisce i dati civici da dati_cittadino.json
 */
app.post("/cittadino/dati", async (req, res) => {
  const { email, password } = req.body;

  const autenticato = await verificaUtente(email.trim(), password.trim());
  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const dati = getDatiCittadino(email.trim());
  if (!dati) {
    return res.status(404).json({ detail: "Dati utente non trovati" });
  }

  res.json(dati);
});

/**
 * ✅ AGGIUNGI DATO CIVICO
 */
app.post("/cittadino/aggiungi_dato", async (req, res) => {
  const { email, password, field, value } = req.body;

  const autenticato = await verificaUtente(email.trim(), password.trim());
  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = aggiungiDato(email.trim(), field, value);
  if (!ok) {
    return res.status(400).json({ detail: "Dato già esistente o campo non valido" });
  }

  res.json({ status: "success", message: `${field} aggiunto` });
});

/**
 * ✅ MODIFICA DATO CIVICO
 */
app.put("/cittadino/modifica_dato", async (req, res) => {
  const { email, password, field, value } = req.body;

  const autenticato = await verificaUtente(email.trim(), password.trim());
  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = modificaDato(email.trim(), field, value);
  if (!ok) {
    return res.status(404).json({ detail: "Campo non valido o utente inesistente" });
  }

  res.json({ status: "success", message: `${field} modificato` });
});

/**
 * ✅ RIMUOVI DATO SINGOLO
 */
app.delete("/cittadino/rimuovi_dato", async (req, res) => {
  const { email, password, field } = req.body;

  const autenticato = await verificaUtente(email.trim(), password.trim());
  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = rimuoviDato(email.trim(), field);
  if (!ok) {
    return res.status(404).json({ detail: "Dato non trovato" });
  }

  res.json({ status: "success", message: `${field} rimosso` });
});

/**
 * ✅ RIMUOVI TUTTI I DATI CIVICI
 */
app.delete("/cittadino/rimuovi_tutti", async (req, res) => {
  const { email, password } = req.body;

  const autenticato = await verificaUtente(email.trim(), password.trim());
  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = rimuoviTutti(email.trim());
  res.json({ status: "success", message: ok ? "Tutti i dati eliminati" : "Nessun dato da rimuovere" });
});


//avvio server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});