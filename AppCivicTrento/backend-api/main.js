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

const {
  getStoricoVoto,
  getStoricoBolletta,
  getStoricoSpostamento,
  getStoricoAbbonamentoMezziPubblici,
  getStoricoMulta
} = require("./gestione_punti");

const {
  getPremi,
  riscattaPremio
} = require("./gestione_premi");

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
    <p>Le rotte vanno testate con strumenti come Postman, curl o una frontend app, poiché la maggior parte richiede <code>POST</code> o <code>DELETE</code> con JSON nel body.</p>
  `);
});



//autenticazione
app.post("/auth/register", async (req, res) => {
  console.log("[REGISTER] Richiesta ricevuta");
  console.log("Dati ricevuti:", req.body);

  const { nome, cognome, email, password, CF, cartaID, gdprConsent } = req.body;

  const errori = [];

  // Regex di validazione
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z]{1}[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{1}$/;
  const idCardRegex = /^([A-Z]{2}\d{5,6}[A-Z]{1,2}|\d{9})$/i;

  if (!passwordRegex.test(password)) {
    errori.push("La password non rispetta i criteri di sicurezza:\n- Min 8 caratteri, una maiuscola, una minuscola, un numero, un simbolo");
  }

  if (!emailRegex.test(email)) {
    errori.push("Email non valida");
  }

  if (!cfRegex.test(CF)) {
    errori.push("Codice fiscale non valido");
  }

  if (!idCardRegex.test(cartaID)) {
    errori.push("Numero carta d'identità non valido");
  }

  // Se ci sono errori, restituiscili tutti
  if (errori.length > 0) {
    console.warn("[REGISTER] Errori validazione:\n" + errori.join("\n"));
    return res.status(400).json({ detail: errori });
  }

  // Registrazione
  try {
    registraUtente({ nome, cognome, email, password, CF, cartaID });
    console.log(`[REGISTER] Registrazione completata per: ${email}`);
    res.json({ status: "success", message: "Registrazione completata" });
  } catch (error) {
    console.error("[REGISTER] Errore durante la registrazione:", error);
    res.status(500).json({ error: "Errore interno del server durante la registrazione." });
  }
});

  
app.delete("/auth/delete_user", async (req, res) => {
  const { email, password } = req.body;

  const success = await cancellaUtente(email?.trim(), password?.trim());

  if (!success) {
    return res.status(404).json({ detail: "Utente non trovato o credenziali errate" });
  }

  res.json({ status: "success", message: `Utente ${email} eliminato correttamente` });
});

  
/**
 * LOGIN: verifica le credenziali nel DB
 */
app.post("/auth/login", async (req, res) => {
  console.log("[LOGIN] Body ricevuto:", req.body);

  const { email, password } = req.body;
  console.log("Email:", email);
  console.log("Password:", password);

  const credenziali = await trovaCredenziali(email?.trim(), password?.trim());

  if (!credenziali) {
    console.warn("[LOGIN] Credenziali non valide");
    return res.status(404).json({ detail: "Utente non trovato o credenziali non valide" });
  }

  console.log(`[LOGIN] Login riuscito per ${email}`);
  res.json({ status: "success", message: "Login effettuato" });
});

  
/**
 * DELETE: elimina da DB e file JSON
 */
app.delete("/auth/delete_user", async (req, res) => {
  console.log("[DELETE] Body ricevuto:", req.body);

  const { email, password } = req.body;

  const success = await cancellaUtente(email?.trim(), password?.trim());

  if (!success) {
    console.warn(`[DELETE] Utente ${email} non trovato o credenziali errate`);
    return res.status(404).json({ detail: "Utente non trovato o credenziali errate" });
  }

  console.log(`[DELETE] Utente ${email} eliminato`);
  res.json({ status: "success", message: `Utente ${email} eliminato correttamente` });
});

//profilo utente 
app.post("/utente/profilo", async (req, res) => {
  const { email, password } = req.body;

  // Autenticazione
  const profilo = await getProfiloUtente(email?.trim(), password?.trim());

  if (!profilo) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  // Restituisci tutti i campi del profilo
  res.json({
    nome: profilo.nome,
    cognome: profilo.cognome,
    email: profilo.email,
    password: profilo.password,
    CF: profilo.CF,
    cartaID: profilo.cartaID
  });
});


  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

app.put("/utente/modifica_profilo", async (req, res) => {
  console.log("[MODIFICA PROFILO] Body ricevuto:", req.body);

  const { email, password, field, new_value } = req.body;

  // Validazione solo se si modifica email o password
  if (field === "email" && !emailRegex.test(new_value)) {
    return res.status(400).json({ detail: "Formato email non valido" });
  }

  if (field === "password" && !passwordRegex.test(new_value)) {
    return res.status(400).json({ detail: "La password non rispetta i criteri di sicurezza,: - lunghezza minima di 8 caratteri\n\
      - deve includere almeno una lettera maiuscola\n\
      - deve includere almeno una lettera minuscola\n\
      - deve includere almeno un numero\n\
      - deve includere almeno un carattere speciale\n\
      - non deve contenere spazi vuoti" });
  }

  try {
    const successo = await modificaProfiloUtente(email?.trim(), password?.trim(), field, new_value?.trim());

    if (!successo) {
      console.warn(`[MODIFICA PROFILO] Fallita per ${email}`);
      return res.status(401).json({ detail: "Utente non trovato o credenziali errate" });
    }

    console.log(`[MODIFICA PROFILO] ${field} modificato per ${email}`);
    res.json({ status: "success", field, new_value });
  } catch (error) {
    console.error("Errore interno nella modifica del profilo:", error);
    res.status(500).json({ detail: "Errore interno del server" });
  }
});



//reset password
app.post("/auth/reset_password", async (req, res) => {
  console.log("[RESET PASSWORD] Body ricevuto:", req.body);

  const { token, newPassword } = req.body;

  const result = await reimpostaPasswordConToken(token, newPassword);

  if (result.success) {
    console.log(`[RESET] Password aggiornata per ${result.email}`);
    res.json({ status: "success", message: "Password reimpostata con successo" });
  } else {
    console.warn("[RESET] Fallita:", result.reason);
    res.status(400).json({ detail: result.reason });
  }
});



//profilo utente 
/**
 * RETURN UTENTE
 */
app.post("/utente/profilo", async (req, res) => {
  console.log("[GET PROFILO] Body ricevuto:", req.body);

  const { email, password } = req.body;
  const profilo = await getProfiloUtente(email?.trim(), password?.trim());

  if (!profilo) {
    console.warn(`[GET PROFILO] Credenziali non valide per ${email}`);
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  console.log(`[GET PROFILO] Profilo restituito per ${email}`);
  res.json(profilo);
});


/**
 * MODIFICA PROFILO UTENTE
 */
app.put("/utente/modifica_profilo", async (req, res) => {
  console.log("[MODIFICA PROFILO] Body ricevuto:", req.body);

  const { email, password, field, new_value } = req.body;
  const successo = await modificaProfiloUtente(email?.trim(), password?.trim(), field, new_value);

  if (!successo) {
    console.warn(`[MODIFICA PROFILO] Fallita per ${email}`);
    return res.status(401).json({ detail: "Utente non trovato o credenziali errate" });
  }

  console.log(`[MODIFICA PROFILO] ${field} modificato per ${email}`);
  res.json({ status: "success", field, new_value });
});


//cittadino
/**
 * GET DATI CITTADINO
 */
app.post("/cittadino/dati", async (req, res) => {
  console.log("[GET DATI CITTADINO] Body ricevuto:", req.body);

  const { email, password } = req.body;
  const autenticato = await verificaUtente(email?.trim(), password?.trim());

  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const dati = getDatiCittadino(email.trim());
  if (!dati) {
    return res.status(404).json({ detail: "Dati utente non trovati" });
  }

  console.log(`[GET DATI CITTADINO] Dati restituiti per ${email}`);
  res.json(dati);
});

/**
 * AGGIUNGI DATO CIVICO
 */
app.post("/cittadino/aggiungi_dato", async (req, res) => {
  console.log("[AGGIUNGI DATO] Body ricevuto:", req.body);

  const { email, password, field, value } = req.body;
  const autenticato = await verificaUtente(email?.trim(), password?.trim());

  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = aggiungiDato(email.trim(), field, value);
  if (!ok) {
    return res.status(400).json({ detail: "Dato già esistente o campo non valido" });
  }

  console.log(`[AGGIUNGI DATO] ${field} aggiunto per ${email}`);
  res.json({ status: "success", message: `${field} aggiunto` });
});

/**
 * MODIFICA DATO CIVICO
 */
app.put("/cittadino/modifica_dato", async (req, res) => {
  console.log("[MODIFICA DATO] Body ricevuto:", req.body);

  const { email, password, field, value } = req.body;
  const autenticato = await verificaUtente(email?.trim(), password?.trim());

  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = modificaDato(email.trim(), field, value);
  if (!ok) {
    return res.status(404).json({ detail: "Campo non valido o utente inesistente" });
  }

  console.log(`[MODIFICA DATO] ${field} aggiornato per ${email}`);
  res.json({ status: "success", message: `${field} modificato` });
});

/**
 * RIMUOVI DATO SINGOLO
 */
app.delete("/cittadino/rimuovi_dato", async (req, res) => {
  console.log("[RIMUOVI DATO] Body ricevuto:", req.body);

  const { email, password, field } = req.body;
  const autenticato = await verificaUtente(email?.trim(), password?.trim());

  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = rimuoviDato(email.trim(), field);
  if (!ok) {
    return res.status(404).json({ detail: "Dato non trovato" });
  }

  console.log(`[RIMUOVI DATO] ${field} rimosso per ${email}`);
  res.json({ status: "success", message: `${field} rimosso` });
});

/**
 * RIMUOVI TUTTI I DATI CIVICI
 */
app.delete("/cittadino/rimuovi_tutti", async (req, res) => {
  console.log("[RIMUOVI TUTTI] Body ricevuto:", req.body);

  const { email, password } = req.body;
  const autenticato = await verificaUtente(email?.trim(), password?.trim());

  if (!autenticato) {
    return res.status(401).json({ detail: "Credenziali non valide" });
  }

  const ok = rimuoviTutti(email.trim());
  console.log(`[RIMUOVI TUTTI] Tutti i dati rimossi per ${email}`);
  res.json({ status: "success", message: ok ? "Tutti i dati eliminati" : "Nessun dato da rimuovere" });
});

// === PREMI ===

// GET /premi → restituisce l'elenco dei premi
app.get("/premi", (req, res) => {
  try {
    const premi = getPremi(); // usa la funzione importata
    res.json(premi);
  } catch (error) {
    console.error("Errore nel recupero dei premi:", error);
    res.status(500).json({ detail: "Errore interno nel recupero dei premi" });
  }
});


// POST /premi/riscatta/:id → simula il riscatto del premio
app.post("/premi/riscatta/:id", (req, res) => {
  const premioId = req.params.id;

  try {
    const risultato = riscattaPremio(premioId); // usa la funzione
    if (!risultato) {
      return res.status(404).json({ detail: "Premio non trovato" });
    }

    console.log(`Premio riscattato: ${risultato.nome}`);
    res.json({ status: "success", message: `Premio "${risultato.nome}" riscattato` });
  } catch (error) {
    console.error("Errore durante il riscatto:", error);
    res.status(500).json({ detail: "Errore interno durante il riscatto del premio" });
  }
});


// === Monitoraggio comportamenti ===
// Voto elettorale
app.post('/monitoraggio/voto', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[VOTO] Richiesta da: ${email}`);

  const utente = await getProfiloUtente(email, password);
  if (!utente) {
    console.warn(`[VOTO] Credenziali non valide`);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const voto = getStoricoVoto();
  if (!voto || voto.punti == null) {
    return res.status(400).json({ error: 'Configurazione voto mancante' });
  }

  utente.saldo = (utente.saldo || 0) + voto.punti;

  // salvaUtenti([...]);
  console.log(`[VOTO] ${voto.punti} punti assegnati a ${email}`);
  res.json(voto);
});

// Bolletta pagata
app.post('/monitoraggio/bolletta', async (req, res) => {
  const { email, password, tipo } = req.body;
  console.log(`[BOLLETTA] ${tipo} richiesta da: ${email}`);

  const utente = await getProfiloUtente(email, password);
  if (!utente) {
    console.warn(`[BOLLETTA] Credenziali non valide`);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const bolletta = getStoricoBolletta(tipo);
  if (!bolletta || bolletta.punti == null) {
    return res.status(400).json({ error: 'Tipo bolletta non valido' });
  }

  utente.saldo = (utente.saldo || 0) + bolletta.punti;

  // salvaUtenti([...]);
  console.log(`[BOLLETTA] ${bolletta.punti} punti per ${tipo}`);
  res.json(bolletta);
});

// Movimento a piedi o bici
app.post('/monitoraggio/movimento', async (req, res) => {
  const { email, password, distanza_km } = req.body;
  console.log(`[MOVIMENTO] ${distanza_km} km da: ${email}`);

  const utente = await getProfiloUtente(email, password);
  if (!utente) {
    console.warn(`[MOVIMENTO] Credenziali non valide`);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const movimento = getStoricoSpostamento(parseFloat(distanza_km));
  if (!movimento || movimento.punti == null) {
    return res.status(400).json({ error: 'Distanza non valida' });
  }

  utente.saldo = (utente.saldo || 0) + movimento.punti;

  // salvaUtenti([...]);
  console.log(`[MOVIMENTO] ${movimento.punti} punti per ${email}`);
  res.json(movimento);
});

// Abbonamento mezzi pubblici
app.post('/monitoraggio/trasporti', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[TRASPORTI] Rilevato abbonamento da: ${email}`);

  const utente = await getProfiloUtente(email, password);
  if (!utente) {
    console.warn(`[TRASPORTI] Credenziali non valide`);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const trasporti = getStoricoAbbonamentoMezziPubblici();
  if (!trasporti || trasporti.punti == null) {
    return res.status(400).json({ error: 'Configurazione trasporti mancante' });
  }

  utente.saldo = (utente.saldo || 0) + trasporti.punti;

  // salvaUtenti([...]);
  console.log(`[TRASPORTI] ${trasporti.punti} punti assegnati a ${email}`);
  res.json(trasporti);
});

// Multa ricevuta
app.post('/monitoraggio/multa', async (req, res) => {
  const { email, password, gravita } = req.body;
  console.log(`[MULTA] Gravità ${gravita} per: ${email}`);

  const utente = await getProfiloUtente(email, password);
  if (!utente) {
    console.warn(`[MULTA] Credenziali non valide`);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const multa = getStoricoMulta(gravita, new Date().toISOString());
  if (!multa || multa.punti == null) {
    return res.status(400).json({ error: 'Gravità non valida' });
  }

  if (multa.punti === 'perdita_totale') {
    utente.saldo = 0;
    console.log(`[MULTA] Saldo azzerato per ${email}`);
  } else {
    utente.saldo = (utente.saldo || 0) + multa.punti;
    console.log(`[MULTA] Penalità ${multa.punti} per ${email}`);
  }

  utente.dataUltimaMulta = multa.dataUltimaMulta;

  // salvaUtenti([...]);
  res.json(multa);
});

//avvio server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
