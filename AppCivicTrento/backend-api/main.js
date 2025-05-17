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

const {
  getStoricoVoto,
  getStoricoBolletta,
  getStoricoSpostamento,
  getStoricoAbbonamentoMezziPubblici,
  getStoricoMulta
} = require("./gestione_punti");


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
app.post("/auth/register", (req, res) => {
    const { name, surname, email, password, fiscal_code, id_card_number } = req.body;
    
    //controllo password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if(!passwordRegex(password)){
      return res.status(400).json({ detail: "La password non rispetta i criteri di sicurezza"});
    }
    
    //controllo email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ detail: "Email non valida" });
    }

    // controllo codice fiscale
    const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z]{1}[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{1}$/;
    if (!cfRegex.test(fiscal_code)) {
        return res.status(400).json({ detail: "Codice fiscale non valido" });
    }
    
    //controllo numero carta d'identità
    const idCardRegex = /^\d{8}$/;
    if (!idCardRegex.test(id_card_number)) {
        return res.status(400).json({ detail: "Numero carta d'identità non valido" });
    }

    const newUser = `${name.trim()},${surname.trim()},${email.trim()},${password.trim()},${fiscal_code.trim()},${id_card_number.trim()}\n`;
    fs.appendFileSync(USERS_FILE, newUser);
    res.json({ status: "success", message: "Registrazione completata" });
    if (!gdprConsent) {
      return res.status(400).json({ error: "È necessario accettare l'informativa GDPR per registrarsi." });
    }
  });
  
app.post("/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (verificaUtente(email, password)) {
      res.json({ status: "success", message: "Login effettuato" });
    } else {
      res.status(401).json({ detail: "Credenziali non valide" });
    }
  });
  
app.delete("/auth/delete_user", (req, res) => {
    const { email, password } = req.body;
  
    if (!fs.existsSync(USERS_FILE)) {
      return res.status(404).json({ detail: "Nessun utente registrato" });
    }
  
    const lines = fs.readFileSync(USERS_FILE, "utf-8").split("\n").filter(Boolean);
    const updated = [];
    let found = false;
  
    for (let line of lines) {
      const fields = line.split(",");
      if (fields[2] === email && fields[3] === password) {
        found = true;
      } else {
        updated.push(line);
      }
    }
  
    if (!found) {
      return res.status(404).json({ detail: "Utente non trovato o credenziali errate" });
    }
  
    fs.writeFileSync(USERS_FILE, updated.join("\n") + "\n");
    res.json({ status: "success", message: `Utente ${email} eliminato correttamente` });
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


//profilo utente 
app.post("/utente/profilo", (req, res) => {
    const { email, password } = req.body;
  
    if (!fs.existsSync(USERS_FILE)) {
      return res.status(404).json({ detail: "Nessun utente registrato" });
    }
  
    const lines = fs.readFileSync(USERS_FILE, "utf-8").split("\n").filter(Boolean);
  
    for (let line of lines) {
      const [name, surname, em, pw, fiscal, idCard] = line.split(",");
      if (em === email && pw === password) {
        return res.json({ name, surname, email: em, fiscal_code: fiscal, id_card_number: idCard });
      }
    }
  
    res.status(401).json({ detail: "Credenziali non valide" });
  });
  app.put("/utente/modifica_profilo", (req, res) => {
    const { email, password, field, new_value } = req.body;
    const fieldMap = {
      name: 0,
      surname: 1,
      email: 2,
      fiscal_code: 4,
      id_card_number: 5,
    };
  
    if (!fs.existsSync(USERS_FILE)) {
      return res.status(404).json({ detail: "Nessun utente registrato" });
    }

    //Regex per email e password
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  
    //verifica criteri
    if (field === "email" && !emailRegex.test(new_value)) {
      return res.status(400).json({ detail: "Formato email non valido" });
    }

    if (field === "password" && !passwordRegex.test(new_value)) {
      return res.status(400).json({ detail: "La password non rispetta i criteri di sicurezza" });
    }

    const lines = fs.readFileSync(USERS_FILE, "utf-8").split("\n").filter(Boolean);
    let updated = false;
  
    const newLines = lines.map(line => {
      const parts = line.split(",");
      if (parts[2] === email && parts[3] === password) {
        const idx = fieldMap[field];
        parts[idx] = new_value.trim();
        updated = true;
      }
      return parts.join(",");
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
const PREMI_FILE = path.join(__dirname, 'data', 'premi.json');

// GET /premi → restituisce l'elenco dei premi
app.get("/premi", (req, res) => {
  if (!fs.existsSync(PREMI_FILE)) {
    return res.status(404).json({ detail: "Nessun premio disponibile" });
  }

  const premi = JSON.parse(fs.readFileSync(PREMI_FILE, "utf-8"));
  res.json(premi);
});

// POST /premi/riscatta/:id → simula il riscatto del premio
app.post("/premi/riscatta/:id", (req, res) => {
  const premioId = req.params.id;
  if (!fs.existsSync(PREMI_FILE)) {
    return res.status(404).json({ detail: "Nessun premio disponibile" });
  }

  const premi = JSON.parse(fs.readFileSync(PREMI_FILE, "utf-8"));
  const premio = premi.find(p => p.id === premioId);

  if (!premio) {
    return res.status(404).json({ detail: "Premio non trovato" });
  }

  // (Opzionale: loggare il riscatto)
  console.log(`✅ Premio riscattato: ${premio.nome}`);

  res.json({ status: "success", message: `Premio "${premio.nome}" riscattato` });
});

// === Monitoraggio comportamenti ===
// 🗳️ Voto elettorale
app.post('/monitoraggio/voto', async (req, res) => {
  const { email, password } = req.body;
  console.log(`🗳️ [VOTO] Richiesta da: ${email}`);

  const utente = await getProfiloUtente(email, password);
  if (!utente) {
    console.warn(`❌ [VOTO] Credenziali non valide`);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const voto = getStoricoVoto();
  if (!voto || voto.punti == null) {
    return res.status(400).json({ error: 'Configurazione voto mancante' });
  }

  utente.saldo = (utente.saldo || 0) + voto.punti;

  // salvaUtenti([...]);
  console.log(`✅ [VOTO] ${voto.punti} punti assegnati a ${email}`);
  res.json(voto);
});

// 💧 Bolletta pagata
app.post('/monitoraggio/bolletta', async (req, res) => {
  const { email, password, tipo } = req.body;
  console.log(`💧 [BOLLETTA] ${tipo} richiesta da: ${email}`);

  const utente = await getProfiloUtente(email, password);
  if (!utente) {
    console.warn(`❌ [BOLLETTA] Credenziali non valide`);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const bolletta = getStoricoBolletta(tipo);
  if (!bolletta || bolletta.punti == null) {
    return res.status(400).json({ error: 'Tipo bolletta non valido' });
  }

  utente.saldo = (utente.saldo || 0) + bolletta.punti;

  // salvaUtenti([...]);
  console.log(`✅ [BOLLETTA] ${bolletta.punti} punti per ${tipo}`);
  res.json(bolletta);
});

// 🚶‍♂️ Movimento a piedi o bici
app.post('/monitoraggio/movimento', async (req, res) => {
  const { email, password, distanza_km } = req.body;
  console.log(`🚶‍♂️ [MOVIMENTO] ${distanza_km} km da: ${email}`);

  const utente = await getProfiloUtente(email, password);
  if (!utente) {
    console.warn(`❌ [MOVIMENTO] Credenziali non valide`);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const movimento = getStoricoSpostamento(parseFloat(distanza_km));
  if (!movimento || movimento.punti == null) {
    return res.status(400).json({ error: 'Distanza non valida' });
  }

  utente.saldo = (utente.saldo || 0) + movimento.punti;

  // salvaUtenti([...]);
  console.log(`✅ [MOVIMENTO] ${movimento.punti} punti per ${email}`);
  res.json(movimento);
});

// 🚌 Abbonamento mezzi pubblici
app.post('/monitoraggio/trasporti', async (req, res) => {
  const { email, password } = req.body;
  console.log(`🚌 [TRASPORTI] Rilevato abbonamento da: ${email}`);

  const utente = await getProfiloUtente(email, password);
  if (!utente) {
    console.warn(`❌ [TRASPORTI] Credenziali non valide`);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const trasporti = getStoricoAbbonamentoMezziPubblici();
  if (!trasporti || trasporti.punti == null) {
    return res.status(400).json({ error: 'Configurazione trasporti mancante' });
  }

  utente.saldo = (utente.saldo || 0) + trasporti.punti;

  // salvaUtenti([...]);
  console.log(`✅ [TRASPORTI] ${trasporti.punti} punti assegnati a ${email}`);
  res.json(trasporti);
});

// 🚨 Multa ricevuta
app.post('/monitoraggio/multa', async (req, res) => {
  const { email, password, gravita } = req.body;
  console.log(`🚨 [MULTA] Gravità ${gravita} per: ${email}`);

  const utente = await getProfiloUtente(email, password);
  if (!utente) {
    console.warn(`❌ [MULTA] Credenziali non valide`);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const multa = getStoricoMulta(gravita, new Date().toISOString());
  if (!multa || multa.punti == null) {
    return res.status(400).json({ error: 'Gravità non valida' });
  }

  if (multa.punti === 'perdita_totale') {
    utente.saldo = 0;
    console.log(`⚠️ [MULTA] Saldo azzerato per ${email}`);
  } else {
    utente.saldo = (utente.saldo || 0) + multa.punti;
    console.log(`✅ [MULTA] Penalità ${multa.punti} per ${email}`);
  }

  utente.dataUltimaMulta = multa.dataUltimaMulta;

  // salvaUtenti([...]);
  res.json(multa);
});

//avvio server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
