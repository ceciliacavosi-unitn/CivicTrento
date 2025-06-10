require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const pathUtenti = path.join(__dirname, "data", "utenti_completo.json");

const app = express();
app.use(bodyParser.json()); // abilita il supporto JSON nel body delle richieste

const {
  registraUtente,
  trovaCredenziali,
  cancellaUtente,
  reimpostaPasswordConToken,
  verificaToken,
  salvaSessioneUtente
} = require("./gestione_autenticazione");

const { 
  getProfiloUtente, 
  modificaProfiloUtente,
  aggiornaUltimaAttivita,
  aggiornaPuntiUtente
} = require("./gestione_utenti");

const {
  getDatiCittadino,
  aggiungiDato,
  modificaDato,
  rimuoviDato,
  rimuoviTutti,
  registraMovimento,
  visualizzaStorico,
  eliminaUtenteCompleto
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

const { rimuoviUtenze } = require("./gestione_utenze");


const { applicaPenalitaMulte } = require("./gestione_multe");
const { applicaBonusAbbonamento } = require("./gestione_abbonamenti");
const { applicaBonusVoto } = require('./gestione_votazioni');
const { applicaBonusBolletta } = require('./gestione_bollette');
const { aggiornaSaldiDaStorico } = require('./gestione_punti');


//pagina principale
app.get("/", (req, res) => {
  res.send(`
    <h1>Benvenuto nell'API CivicTrento</h1>
    <p>Queste sono le principali rotte disponibili:</p>
    
    <h2>Autenticazione</h2>
    <ul>
      <li><strong>POST</strong> /auth/register</li>
      <li><strong>POST</strong> /auth/login</li>
      <li><strong>POST</strong> /auth/logout</li>
      <li><strong>POST</strong> /auth/reset_password</li>
      <li><strong>DELETE</strong> /auth/delete_user</li>
    </ul>

    <h2>Profilo Utente</h2>
    <ul>
      <li><strong>POST</strong> /utente/profilo</li>
      <li><strong>PUT</strong> /utente/modifica_profilo</li>
    </ul>

    <h2>Dati Civici</h2>
    <ul>
      <li><strong>POST</strong> /cittadino/dati</li>
      <li><strong>POST</strong> /cittadino/aggiungi_dato</li>
      <li><strong>PUT</strong> /cittadino/modifica_dato</li>
      <li><strong>DELETE</strong> /cittadino/rimuovi_dato</li>
      <li><strong>DELETE</strong> /cittadino/rimuovi_tutti</li>
    </ul>

    <h2>Movimento</h2>
    <ul>
      <li><strong>POST</strong> /cittadino/movimento</li>
    </ul>

    <h2>Utenze</h2>
    <ul>
      <li><strong>POST</strong> /cittadino/utenza</li>
    </ul>

    <h2>Premi</h2>
    <ul>
      <li><strong>GET</strong> /premi</li>
      <li><strong>POST</strong> /premi/riscatta/:id</li>
    </ul>

    <h2>Monitoraggio Comportamenti</h2>
    <ul>
      <li><strong>POST</strong> /monitoraggio/voto</li>
      <li><strong>POST</strong> /monitoraggio/bolletta</li>
      <li><strong>POST</strong> /monitoraggio/trasporti</li>
      <li><strong>POST</strong> /monitoraggio/multa</li>
      <!--<li><strong>POST</strong> /monitoraggio/movimento</li>--> <!-- Commentato nel codice -->
    </ul>

    <p>Le rotte vanno testate con strumenti come <strong>Postman</strong>, <strong>curl</strong> o una <em>frontend app</em>, poiché molte richiedono <code>POST</code>, <code>PUT</code> o <code>DELETE</code> con JSON nel body.</p>
  `);
});
// Regex di validazione
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z]{1}[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{1}$/;
  const idCardRegex = /^(?:[A-Z]{2}\d{5}[A-Z]{1,2}|\d{7,9})$/;

  let utentiData = [];
    try {
      const rawUtenti = fs.readFileSync(pathUtenti, "utf-8");
      utentiData = JSON.parse(rawUtenti);
      console.log("✔️ utenti_completo.json caricato in main.js");
    } catch (error) {
      console.error("❌ Errore nella lettura utenti_completo.json:", error);
    }


  function salvaUtentiAggiornati() {
    const pathUtenti = path.join(__dirname, "data", "utenti_completo.json");
    fs.writeFileSync(pathUtenti, JSON.stringify(utentiData, null, 2), "utf-8");
    console.warn("✅ File utenti_completo.json salvato correttamente a fine login");
  }

//autenticazione
app.post("/auth/register", async (req, res) => {
  console.log("[REGISTER] Richiesta ricevuta");
  console.log("Dati ricevuti:", req.body);

  
  const { nome, cognome, email, password, CF, cartaID, gdprConsent } = req.body;

  // Verifica presenza campi obbligatori
  if (!nome || !cognome || !email || !password || !CF || !cartaID) {
    console.warn("[VALIDAZIONE] Campi obbligatori mancanti");
    return res.status(400).json({
      detail: "Tutti i campi (nome, cognome, email, password, codice fiscale, carta d'identità) sono obbligatori"
    });
  }
  const errori = [];

  

  // Validazioni
  if (!passwordRegex.test(password)) {
    console.warn("[VALIDAZIONE] Password non valida");
    errori.push("La password non rispetta i criteri di sicurezza:\n- Min 8 caratteri, una maiuscola, una minuscola, un numero, un simbolo");
  }

  if (!emailRegex.test(email)) {
    console.warn("[VALIDAZIONE] Email non valida");
    errori.push("Email non valida");
  }

  if (!cfRegex.test(CF)) {
    console.warn("[VALIDAZIONE] Codice fiscale non valido");
    errori.push("Codice fiscale non valido");
  }

  if (!idCardRegex.test(cartaID)) {
    console.warn("[VALIDAZIONE] Numero carta d'identità non valido");
    errori.push("Numero carta d'identità non valido");
  }

  if (gdprConsent !== true) {
    console.warn("[VALIDAZIONE] Consenso GDPR non fornito");
    errori.push("È necessario accettare l'informativa privacy per registrarsi");
  }

  // Se ci sono errori, li restituisco
  if (errori.length > 0) {
    console.warn("[REGISTER] Errori validazione:", errori);
    return res.status(400).json({ detail: errori });
  }

  // Salvataggio utente
  try {
    const successo = await registraUtente({
      nome,
      cognome,
      email,
      password,
      CF,
      cartaID,
      gdprConsent: true,
      consentTimestamp: new Date().toISOString(),
      saldo: 800,
      punti: 800
    });

    if (!successo) {
      console.warn(`[REGISTER] Registrazione fallita: email ${email} già presente`);
      return res.status(409).json({ error: "Email già registrata" });
    }

    console.log(`[REGISTER] Registrazione completata per: ${email}`);
    res.json({ status: "success", message: "Registrazione completata" });
  } catch (error) {
    console.error("[REGISTER] Errore durante la registrazione:", error);
    res.status(500).json({ error: "Errore interno del server durante la registrazione." });
  }
});


  
/**
 * LOGIN: verifica le credenziali nel DB
 */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ detail: "Email e password sono obbligatorie" });
  }
  // Controllo formato email PRIMA del login
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ detail: "Formato email non valido" });
  }

  try {
    const utente = await trovaCredenziali(email.trim(), password.trim());
    if (!utente) {
      return res.status(404).json({ detail: "Utente non trovato o credenziali non valide" });
    }

    // Genera il token e salva sessione
    const token = jwt.sign({ email: email.trim() }, JWT_SECRET, { expiresIn: "1h" });
    salvaSessioneUtente(email.trim(), token);

    // **Ora recupero tutti i dati civici utili**
    const datiCittadino = getDatiCittadino(email.trim()) || {};
    const numeroPatente      = datiCittadino.driver_license;
    const subscription_code  = datiCittadino.subscription_code;
    const profiloUtente = await getProfiloUtente(email.trim()) || {};
    const cartaID = profiloUtente.cartaID;
    const codicePOD = datiCittadino.pod_code;

    console.warn("codice POD letto: ", codicePOD);

    // Applica penalità per eventuali multe (usa il numero di patente)
    if (numeroPatente) {
      console.warn(`[DEBUG] Patente trovata per ${email}: ${numeroPatente}`);
      applicaPenalitaMulte(utente.nome, utente.cognome, numeroPatente, utentiData);
    } else {
      console.warn(`[LOGIN] Nessun numero di patente trovato per ${email}`);
    }

    // Applica bonus abbonamento (se presente)
    if (subscription_code) {
      console.warn(`[DEBUG] Codice abbonamento trovato per ${email}: ${subscription_code}`);
      applicaBonusAbbonamento(utente.nome, utente.cognome, subscription_code, utentiData);
    } else {
      console.warn(`[LOGIN] Nessun codice abbonamento trovato per ${email}`);
    }

    // Applica bonus votazioni
    if (cartaID) {
      console.warn(`[DEBUG] Carta ID trovata per ${email}: ${cartaID}`);
      applicaBonusVoto(utente.nome, utente.cognome, cartaID, utentiData);
    } else {
      console.warn(`[LOGIN] Nessun numero carta ID trovato per ${email}`);
    }

    // Applica bonus bollette (se presente codice POD)
    if (codicePOD) {
      console.warn(`[DEBUG] Codice POD trovato per ${email}: ${codicePOD}`);
      applicaBonusBolletta(utente.nome, utente.cognome, codicePOD, utentiData);
    } else {
      console.warn(`[LOGIN] Nessun codice POD trovato per ${email}`);
    }

    salvaUtentiAggiornati();
    const utenteAggiornato = utentiData.find(u => u.email === email);
    console.log(`[DEBUG] Storico finale salvato per ${email}:`, JSON.stringify(utenteAggiornato?.storico, null, 2));

    aggiornaSaldiDaStorico();
    // Rispondo al client **dopo** aver eseguito penalità e bonus
    return res.json({
      status: "success",
      token,
      message: "Login effettuato"
    });

  } catch (error) {
    console.error("[LOGIN] Errore interno:", error);
    return res.status(500).json({ detail: "Errore interno del server durante il login" });
  }
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
//profilo utente 
app.post("/utente/profilo", verificaToken, async (req, res) => {
  console.log("[GET PROFILO] Richiesta autenticata ricevuta");

  const email = req.utente.email; // preso dal token decodificato
  console.log(`[GET PROFILO] Token valido per: ${email}`);

  const profilo = await getProfiloUtente(email);

  if (!profilo) {
    console.warn(`[GET PROFILO] Profilo non trovato per ${email}`);
    return res.status(404).json({ detail: "Profilo utente non trovato" });
  }

  console.log(`[GET PROFILO] Profilo restituito per ${email}`);
  res.json({
    nome: profilo.nome,
    cognome: profilo.cognome,
    email: profilo.email,
    password: profilo.password,
    CF: profilo.CF,
    cartaID: profilo.cartaID,
    saldo: profilo.saldo
  });

  aggiornaUltimaAttivita(email);
});


app.put("/utente/modifica_profilo", verificaToken, async (req, res) => {
  console.log("[MODIFICA PROFILO] Richiesta autenticata ricevuta");
  console.log("Body ricevuto:", req.body);

  const email = req.utente.email; // Ricavato dal token decodificato
  const { field, new_value } = req.body;

  //Controllo campo vuoto
  if (!field || typeof new_value !== "string" || new_value.trim() === "") {
    return res.status(400).json({ detail: "Il campo da modificare non può essere vuoto." });
  }
  // Validazione solo se si modifica email o password
  if (field === "email" && !emailRegex.test(new_value)) {
    return res.status(400).json({ detail: "Formato email non valido" });
  }
  
  if (field === "password" && !passwordRegex.test(new_value)) {
    return res.status(400).json({ detail: "La password non rispetta i criteri di sicurezza:\n\
      - lunghezza minima di 8 caratteri\n\
      - almeno una lettera maiuscola\n\
      - almeno una lettera minuscola\n\
      - almeno un numero\n\
      - almeno un carattere speciale\n\
      - nessuno spazio vuoto" 
    });
  }

  try {
    const successo = await modificaProfiloUtente(email, null, field, new_value?.trim());

    if (!successo) {
      console.warn(`[MODIFICA PROFILO] Fallita per ${email}`);
      return res.status(401).json({ detail: "Utente non trovato o campo non valido" });
    }

    console.log(`[MODIFICA PROFILO] ${field} modificato per ${email}`);
    res.json({ status: "success", field, new_value });
    // Invia il profilo aggiornato al client
    res.json({
      status: "success",
      field,
      new_value,
      profiloAggiornato: {
        nome: profiloAggiornato.nome,
        cognome: profiloAggiornato.cognome,
        email: profiloAggiornato.email,
        password: profiloAggiornato.password,
        CF: profiloAggiornato.CF,
        cartaID: profiloAggiornato.cartaID,
        ultimaAttivita: profiloAggiornato.ultimaAttivita
      }
    });
    aggiornaUltimaAttivita(email);
  } catch (error) {
    console.error("[MODIFICA PROFILO] Errore interno:", error);
    res.status(500).json({ detail: "Errore interno del server" });
  }
});


//cittadino
/**
 * GET DATI CITTADINO
 */
app.post("/cittadino/dati", verificaToken, async (req, res) => {
  console.log("[GET DATI CITTADINO] Richiesta autenticata ricevuta");

  const email = req.utente.email; // preso dal token JWT

  const dati = getDatiCittadino(email.trim());

  if (!dati) {
    console.warn(`[GET DATI CITTADINO] Dati non trovati per ${email}`);
    return res.status(404).json({ detail: "Dati utente non trovati" });
  }

  console.log(`[GET DATI CITTADINO] Dati restituiti per ${email}`);
  res.json(dati);

  aggiornaUltimaAttivita(email.trim());
});


/**
 * AGGIUNGI DATO CIVICO
 */
app.post("/cittadino/aggiungi_dato", verificaToken, async (req, res) => {
  console.log("[AGGIUNGI DATO] Richiesta autenticata ricevuta");

  const email = req.utente.email; // Email estratta dal token
  const { field, value } = req.body;

  const ok = aggiungiDato(email.trim(), field, value);
  if (!ok) {
    console.warn(`[AGGIUNGI DATO] Fallito per ${email}: dato esistente o campo non valido`);
    return res.status(400).json({ detail: "Dato già esistente o campo non valido" });
  }

  console.log(`[AGGIUNGI DATO] ${field} aggiunto per ${email}`);
  res.json({ status: "success", message: `${field} aggiunto` });

  aggiornaUltimaAttivita(email.trim());
});

/**
 * MODIFICA DATO CIVICO
 */
app.put("/cittadino/modifica_dato", verificaToken, async (req, res) => {
  console.log("[MODIFICA DATO] Richiesta autenticata ricevuta");

  const email = req.utente.email; // Email estratta dal token
  const { field, value } = req.body;

  const ok = modificaDato(email.trim(), field, value);
  if (!ok) {
    console.warn(`[MODIFICA DATO] Fallito per ${email}: campo non valido o utente inesistente`);
    return res.status(404).json({ detail: "Campo non valido o utente inesistente" });
  }

  console.log(`[MODIFICA DATO] ${field} aggiornato per ${email}`);
  res.json({ status: "success", message: `${field} modificato` });

  aggiornaUltimaAttivita(email.trim());
});


/**
 * RIMUOVI DATO SINGOLO
 */
app.delete("/cittadino/rimuovi_dato", verificaToken, async (req, res) => {
  console.log("[RIMUOVI DATO] Richiesta autenticata ricevuta");

  const email = req.utente.email; // Email estratta dal token
  const { field } = req.body;

  const ok = rimuoviDato(email.trim(), field);
  if (!ok) {
    console.warn(`[RIMUOVI DATO] Fallito per ${email}: dato non trovato`);
    return res.status(404).json({ detail: "Dato non trovato" });
  }

  console.log(`[RIMUOVI DATO] ${field} rimosso per ${email}`);
  res.json({ status: "success", message: `${field} rimosso` });

  aggiornaUltimaAttivita(email.trim());
});



/**
 * RIMUOVI TUTTI I DATI CIVICI
 */
app.delete("/cittadino/rimuovi_tutti", verificaToken, async (req, res) => {
  console.log("[RIMUOVI TUTTI] Richiesta autenticata ricevuta");

  const email = req.utente.email; // Email estratta dal token

  const ok = rimuoviTutti(email.trim());
  console.log(`[RIMUOVI TUTTI] Tutti i dati rimossi per ${email}`);

  res.json({ 
    status: "success", 
    message: ok ? "Tutti i dati eliminati" : "Nessun dato da rimuovere" 
  });

  aggiornaUltimaAttivita(email.trim());
});



//rimozione utenze
app.delete("/cittadino/rimuovi_utenze", verificaToken, (req, res) => {
  const email = req.utente.email;
  const successo = rimuoviUtenze(email);

  if (!successo) {
    return res.status(404).json({ detail: "Nessuna utenza trovata da eliminare" });
  }

  res.json({ status: "success", message: "Utenze rimosse correttamente" });
});

//mostra storico cittadino
app.get('/cittadino/storico', verificaToken, (req, res) => {
  const email = req.utente.email;

  try {
    const storico = visualizzaStorico(email);
    return res.status(200).json(storico);
  } catch (err) {
    console.error(`[GET /cittadino/storico] Errore:`, err);
    return res.status(500).json({ error: 'Errore durante la lettura dello storico' });
  }
});

//rimozione storico cittadino
app.delete('/cittadino/eliminaUtenteCompleto', verificaToken, (req, res) => {
  const email = req.utente.email;

  try {
    const successo = eliminaUtenteCompleto(email);
    if (!successo) {
      return res.status(404).json({ detail: "Storico non trovato o già vuoto" });
    }

    console.log(`[DELETE /cittadino/storico] Storico eliminato per ${email}`);
    return res.status(200).json({ status: "success", message: "Storico eliminato con successo" });
  } catch (err) {
    console.error(`[DELETE /cittadino/storico] Errore interno:`, err);
    return res.status(500).json({ error: "Errore interno durante l'eliminazione dello storico" });
  }
});


// === PREMI ===

// GET /premi → restituisce l'elenco dei premi
app.get("/premi", verificaToken, (req, res) => {
  try {
    const premi = getPremi(); // usa la funzione importata
    res.json(premi);
  } catch (error) {
    console.error("Errore nel recupero dei premi:", error);
    res.status(500).json({ detail: "Errore interno nel recupero dei premi" });
  }
});


// POST /premi/riscatta/:id → simula il riscatto del premio
app.post("/premi/riscatta/:id", verificaToken, (req, res) => {
  const premioId = req.params.id;
  const email = req.utente.email;

  if (!email) {
    return res.status(400).json({ detail: "Email mancante" });
  }

  try {
    const risultato = riscattaPremio(premioId, req.utente.email);
    if (!risultato) {
      return res.status(404).json({ detail: "Premio non trovato" });
    }

    console.log(`Premio riscattato: ${risultato.nome}`);
    res.json({ status: "success", message: `Premio \"${risultato.nome}\" riscattato` });
  } catch (error) {
    console.error("Errore durante il riscatto:", error);
    res.status(500).json({ detail: "Errore interno durante il riscatto del premio" });
  }
});


// === Monitoraggio comportamenti ===
// Voto elettorale
app.post('/monitoraggio/voto', verificaToken, async (req, res) => {
  const email = req.utente.email;
  console.log(`[VOTO] Richiesta da: ${email}`);

  const voto = getStoricoVoto();
  if (!voto || voto.punti == null) {
    return res.status(400).json({ error: 'Configurazione voto mancante' });
  }

  const azione = { azione: "voto_elettorale" };
  const ok = aggiornaPuntiUtente(email, voto.punti, azione);

  if (!ok) return res.status(404).json({ error: "Utente non trovato" });

  res.json({ message: "Punti assegnati", punti: voto.punti });
});


app.post('/monitoraggio/bolletta', verificaToken, async (req, res) => {
  const email = req.utente.email;
  const { tipo } = req.body;
  console.log(`[BOLLETTA] ${tipo} richiesta da: ${email}`);

  const bolletta = getStoricoBolletta(tipo);
  if (!bolletta || bolletta.punti == null) {
    return res.status(400).json({ error: 'Tipo bolletta non valido' });
  }

  const azione = {
    azione: "bolletta",
    tipo: tipo
  };

  const ok = aggiornaPuntiUtente(email, bolletta.punti, azione);
  if (!ok) return res.status(404).json({ error: "Utente non trovato" });

  res.json({ message: "Punti assegnati", punti: bolletta.punti });
});


/*app.post('/monitoraggio/movimento', verificaToken, async (req, res) => {
  const email = req.utente.email;
  const { distanza_km } = req.body;
  console.log("Email utente in movimento:", req.utente?.email); 
  console.log(`[MOVIMENTO] ${distanza_km} km da: ${email}`);

  const utente = await getProfiloUtente(email);
  if (!utente) return res.status(401).json({ error: 'Utente non trovato' });

  const movimento = getStoricoSpostamento(parseFloat(distanza_km));
  if (!movimento || movimento.punti == null) return res.status(400).json({ error: 'Distanza non valida' });

  utente.saldo = (utente.saldo || 0) + movimento.punti;
  console.log(`[MOVIMENTO] ${movimento.punti} punti per ${email}`);
  res.json(movimento);
});*/

app.post('/monitoraggio/trasporti', verificaToken, async (req, res) => {
  const email = req.utente.email;
  console.log(`[TRASPORTI] Rilevato abbonamento da: ${email}`);

  const trasporti = getStoricoAbbonamentoMezziPubblici();
  if (!trasporti || trasporti.punti == null) {
    return res.status(400).json({ error: 'Configurazione trasporti mancante' });
  }

  const azione = { azione: "abbonamento_mezzi_pubblici" };

  const ok = aggiornaPuntiUtente(email, trasporti.punti, azione);
  if (!ok) return res.status(404).json({ error: "Utente non trovato" });

  res.json({ message: "Punti assegnati", punti: trasporti.punti });
});


app.post('/monitoraggio/multa', verificaToken, async (req, res) => {
  const email = req.utente.email;
  const { gravita } = req.body;
  console.log(`[MULTA] Gravità ${gravita} per: ${email}`);

  const multa = getStoricoMulta(gravita, new Date().toISOString());
  if (!multa || multa.punti == null) {
    return res.status(400).json({ error: 'Gravità non valida' });
  }

  let puntiDaApplicare = 0;
  if (multa.punti === "perdita_totale") {
    puntiDaApplicare = -999999; // un numero enorme per forzare saldo a 0
  } else {
    puntiDaApplicare = multa.punti;
  }

  const azione = {
    azione: "multa",
    gravita: gravita
  };

  const ok = aggiornaPuntiUtente(email, puntiDaApplicare, azione);
  if (!ok) return res.status(404).json({ error: "Utente non trovato" });

  res.json({ message: "Multa applicata", punti: puntiDaApplicare });
});

// monitoraggio camminate
app.post("/cittadino/movimento", verificaToken, async (req, res) => {
  const email = req.utente.email;
  const { kmPercorsi, data } = req.body;

  // Validazione dei parametri ricevuti
  if (typeof kmPercorsi !== 'number' || !email) {
    return res.status(400).json({ error: "Distanza o email non validi" });
  }

  try {
    const successo = registraMovimento(email, kmPercorsi);

    if (!successo) {
      console.warn(`[MOVIMENTO] Fallimento registrazione per ${email}`);
      return res.status(500).json({ message: "Errore durante la registrazione dello spostamento" });
    }

    console.log(`[MOVIMENTO] Spostamento di ${kmPercorsi} km registrato per ${email}`);
    res.status(200).json({ message: "Spostamento registrato correttamente", km: kmPercorsi });
  } catch (error) {
    console.error(`[MOVIMENTO] Errore interno per ${email}:`, error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});



const { aggiungiOModificaUtenza } = require('./gestione_utenze');

app.post('/cittadino/utenza', (req, res) => {
  const { idUtente, utenza, codicePOD, fornitore, consenso } = req.body;
  if (!idUtente || !utenza || !codicePOD || !fornitore || consenso === undefined) {
    return res.status(400).json({ errore: "Campi mancanti" });
  }
  aggiungiOModificaUtenza({ idUtente, utenza, codicePOD, fornitore, consenso });
  res.json({ messaggio: "Dati utenza salvati con successo." });
});




/*
//avvio server
const PORT = process.env.PORT || 8000;
console.log("Avvio server...");
app.listen(PORT, () => {
  console.log(` Server avviato su http://localhost:${PORT}`);
});
*/

module.exports = app;
