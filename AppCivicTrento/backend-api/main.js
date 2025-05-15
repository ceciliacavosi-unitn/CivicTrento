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
  utenteEsiste,
  reimpostaPasswordConToken
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

const { inviaEmailRecuperoPassword } = require("./mailer");

const { getPremi, riscattaPremio } = require("./gestione_premi");

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
  console.log("📥 [REGISTRAZIONE] Body ricevuto:", req.body);

  const { nome, cognome, email, password, CF, cartaID } = req.body;

  const success = await registraUtente({
    nome: nome?.trim(),
    cognome: cognome?.trim(),
    email: email?.trim(),
    password: password?.trim(),
    CF: CF?.trim(),
    cartaID: cartaID?.trim()
  });


  if (success) {
    console.log(`✅ [REGISTRAZIONE] Utente ${email} registrato`);
    res.json({ status: "success", message: "Registrazione completata" });
  } else {
    console.warn(`⚠️ [REGISTRAZIONE] Utente ${email} già registrato`);
    res.status(409).json({ detail: "Utente già registrato" });
  }
});

  
/**
 * ✅ LOGIN: verifica le credenziali nel DB
 */
app.post("/auth/login", async (req, res) => {
  console.log("📥 [LOGIN] Body ricevuto:", req.body);

  const { email, password } = req.body;
  console.log("📩 Email:", email);
  console.log("🔑 Password:", password);

  const credenziali = await trovaCredenziali(email?.trim(), password?.trim());

  if (!credenziali) {
    console.warn("❌ [LOGIN] Credenziali non valide");
    return res.status(404).json({ detail: "Utente non trovato o credenziali non valide" });
  }

  console.log(`✅ [LOGIN] Login riuscito per ${email}`);
  res.json({ status: "success", message: "Login effettuato" });
});

  
/**
 * ✅ DELETE: elimina da DB e file JSON
 */
app.delete("/auth/delete_user", async (req, res) => {
  console.log("🗑️ [DELETE] Body ricevuto:", req.body);

  const { email, password } = req.body;

  const success = await cancellaUtente(email?.trim(), password?.trim());

  if (!success) {
    console.warn(`❌ [DELETE] Utente ${email} non trovato o credenziali errate`);
    return res.status(404).json({ detail: "Utente non trovato o credenziali errate" });
  }

  console.log(`✅ [DELETE] Utente ${email} eliminato`);
  res.json({ status: "success", message: `Utente ${email} eliminato correttamente` });
});
  
/*
✅ LOGOUT: verifica esistenza nel DB o JSON
 */
app.post("/auth/logout", async (req, res) => {
  console.log("🚪 [LOGOUT] Body ricevuto:", req.body);

  const { email } = req.body;

  const esiste = await utenteEsiste(email?.trim());

  if (!esiste) {
    console.warn(`❌ [LOGOUT] Utente ${email} non trovato`);
    return res.status(404).json({ detail: "Utente non trovato" });
  }

  console.log(`✅ [LOGOUT] Logout effettuato per ${email}`);
  res.json({ status: "success", message: `Logout effettuato per ${email}` });
});


//recupero password
app.post("/auth/recupero_password", async (req, res) => {
  console.log("📧 [RECUPERO PASSWORD] Body ricevuto:", req.body);

  const { email } = req.body;

  // Carica utenti da utenti.json
  let utenti;
  try {
    utenti = JSON.parse(fs.readFileSync("utenti.json", "utf-8"));
  } catch (error) {
    console.error("❌ [RECUPERO] Errore lettura utenti.json:", error);
    return res.status(500).json({ detail: "Errore del server" });
  }

  // Cerca l'utente
  const utente = utenti.find(u => u.email === email);
  if (!utente) {
    console.warn(`❌ [RECUPERO] Email ${email} non trovata`);
    return res.status(404).json({ detail: "Email non trovata" });
  }

  // Genera token e salva
  const token = require("crypto").randomBytes(20).toString("hex");
  fs.writeFileSync("password_reset_tokens.txt", `${email},${token}\n`, { flag: "a" });

  const resetLink = `http://backend-api:8000/reset_password?token=${token}`;
  console.log(`🔗 [RECUPERO] Link generato per ${email}: ${resetLink}`);

  inviaEmailRecuperoPassword(email, resetLink)
    .then(info => {
      console.log(`✅ [RECUPERO] Email inviata a ${email}`);
      res.json({ status: "success", message: "Email di recupero inviata" });
    })
    .catch(error => {
      console.error("❌ [RECUPERO] Errore invio email:", error);
      res.status(500).json({ detail: "Errore nell'invio dell'email", error: error.message });
    });
});



//reset password
app.post("/auth/reset_password", async (req, res) => {
  console.log("🔁 [RESET PASSWORD] Body ricevuto:", req.body);

  const { token, newPassword } = req.body;

  const result = await reimpostaPasswordConToken(token, newPassword);

  if (result.success) {
    console.log(`✅ [RESET] Password aggiornata per ${result.email}`);
    res.json({ status: "success", message: "Password reimpostata con successo" });
  } else {
    console.warn("❌ [RESET] Fallita:", result.reason);
    res.status(400).json({ detail: result.reason });
  }
});



//profilo utente 
/**
 * ✅ RETURN UTENTE
 */
app.post("/utente/profilo", async (req, res) => {
  console.log("📤 [GET PROFILO] Body ricevuto:", req.body);

  const { email, password } = req.body;
  const profilo = await getProfiloUtente(email?.trim(), password?.trim());

  if (!profilo) {
    console.warn(`❌ [GET PROFILO] Credenziali non valide per ${email}`);
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  console.log(`✅ [GET PROFILO] Profilo restituito per ${email}`);
  res.json(profilo);
});


/**
 * ✅ MODIFICA PROFILO UTENTE
 */
app.put("/utente/modifica_profilo", async (req, res) => {
  console.log("✏️ [MODIFICA PROFILO] Body ricevuto:", req.body);

  const { email, password, field, new_value } = req.body;
  const successo = await modificaProfiloUtente(email?.trim(), password?.trim(), field, new_value);

  if (!successo) {
    console.warn(`❌ [MODIFICA PROFILO] Fallita per ${email}`);
    return res.status(401).json({ detail: "Utente non trovato o credenziali errate" });
  }

  console.log(`✅ [MODIFICA PROFILO] ${field} modificato per ${email}`);
  res.json({ status: "success", field, new_value });
});


//cittadino
/**
 * ✅ GET DATI CITTADINO
 */
app.post("/cittadino/dati", async (req, res) => {
  console.log("📥 [GET DATI CITTADINO] Body ricevuto:", req.body);

  const { email, password } = req.body;
  const autenticato = await verificaUtente(email?.trim(), password?.trim());

  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const dati = getDatiCittadino(email.trim());
  if (!dati) {
    return res.status(404).json({ detail: "Dati utente non trovati" });
  }

  console.log(`✅ [GET DATI CITTADINO] Dati restituiti per ${email}`);
  res.json(dati);
});

/**
 * ✅ AGGIUNGI DATO CIVICO
 */
app.post("/cittadino/aggiungi_dato", async (req, res) => {
  console.log("➕ [AGGIUNGI DATO] Body ricevuto:", req.body);

  const { email, password, field, value } = req.body;
  const autenticato = await verificaUtente(email?.trim(), password?.trim());

  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = aggiungiDato(email.trim(), field, value);
  if (!ok) {
    return res.status(400).json({ detail: "Dato già esistente o campo non valido" });
  }

  console.log(`✅ [AGGIUNGI DATO] ${field} aggiunto per ${email}`);
  res.json({ status: "success", message: `${field} aggiunto` });
});

/**
 * ✅ MODIFICA DATO CIVICO
 */
app.put("/cittadino/modifica_dato", async (req, res) => {
  console.log("📝 [MODIFICA DATO] Body ricevuto:", req.body);

  const { email, password, field, value } = req.body;
  const autenticato = await verificaUtente(email?.trim(), password?.trim());

  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = modificaDato(email.trim(), field, value);
  if (!ok) {
    return res.status(404).json({ detail: "Campo non valido o utente inesistente" });
  }

  console.log(`✅ [MODIFICA DATO] ${field} aggiornato per ${email}`);
  res.json({ status: "success", message: `${field} modificato` });
});

/**
 * ✅ RIMUOVI DATO SINGOLO
 */
app.delete("/cittadino/rimuovi_dato", async (req, res) => {
  console.log("❌ [RIMUOVI DATO] Body ricevuto:", req.body);

  const { email, password, field } = req.body;
  const autenticato = await verificaUtente(email?.trim(), password?.trim());

  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = rimuoviDato(email.trim(), field);
  if (!ok) {
    return res.status(404).json({ detail: "Dato non trovato" });
  }

  console.log(`✅ [RIMUOVI DATO] ${field} rimosso per ${email}`);
  res.json({ status: "success", message: `${field} rimosso` });
});

/**
 * ✅ RIMUOVI TUTTI I DATI CIVICI
 */
app.delete("/cittadino/rimuovi_tutti", async (req, res) => {
  console.log("🧹 [RIMUOVI TUTTI] Body ricevuto:", req.body);

  const { email, password } = req.body;
  const autenticato = await verificaUtente(email?.trim(), password?.trim());

  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = rimuoviTutti(email.trim());
  console.log(`✅ [RIMUOVI TUTTI] Tutti i dati rimossi per ${email}`);
  res.json({ status: "success", message: ok ? "Tutti i dati eliminati" : "Nessun dato da rimuovere" });
});

// === PREMI ===

app.get("/premi", (req, res) => {
  console.log("📥 [GET /premi] Richiesta ricevuta");

  try {
    const premi = getPremi();
    if (!premi) return res.status(404).json({ detail: "Nessun premio disponibile" });
    res.json(premi);
  } catch (err) {
    console.error("❌ [GET /premi] Errore:", err);
    res.status(500).json({ detail: "Errore nella lettura dei premi" });
  }
});

app.post("/premi/riscatta/:id", (req, res) => {
  const premioId = req.params.id;
  console.log(`📥 [POST /premi/riscatta/${premioId}] Richiesta di riscatto ricevuta`);

  try {
    const premio = riscattaPremio(premioId);
    if (!premio) return res.status(404).json({ detail: "Premio non trovato" });
    res.json({ status: "success", message: `Premio "${premio.nome}" riscattato` });
  } catch (err) {
    console.error("❌ [POST /premi/riscatta] Errore:", err);
    res.status(500).json({ detail: "Errore durante il riscatto del premio" });
  }
});

//avvio server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
