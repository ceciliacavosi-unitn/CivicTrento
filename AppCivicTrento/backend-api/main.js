/*MATI:ho tradotto quello che ha fatto la ceci in py a js*/ 

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");

const app = express();
app.use(bodyParser.json());

const USERS_FILE = "users.txt";
const DATA_FILE = "data.txt"; 

//verifica credenziali utente 

function verificaUtente(email, password) {
    if (!fs.existsSync(USERS_FILE)) return false;
  
    const data = fs.readFileSync(USERS_FILE, "utf-8").split("\n");
  
    for (let row of data) {
      const [name, surname, em, pw, fiscal, idCard] = row.split(",");
      if (em === email && pw === password) return true;
    }
    return false;
  }

//autenticazione

app.post("/auth/register", (req, res) => {
    const { name, surname, email, password, fiscal_code, id_card_number } = req.body;
    const newUser = `${name.trim()},${surname.trim()},${email.trim()},${password.trim()},${fiscal_code.trim()},${id_card_number.trim()}\n`;
    fs.appendFileSync(USERS_FILE, newUser);
    res.json({ status: "success", message: "Registrazione completata" });
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
  
app.post("/auth/logout", (req, res) => {
    const { email } = req.body;
  
    if (!fs.existsSync(USERS_FILE)) {
      return res.status(404).json({ detail: "Nessun utente registrato" });
    }
  
    const lines = fs.readFileSync(USERS_FILE, "utf-8").split("\n").filter(Boolean);
  
    for (let line of lines) {
      const fields = line.split(",");
      if (fields[2] === email) {
        return res.json({ status: "success", message: `Logout effettuato per ${email}` });
      }
    }

    res.status(404).json({ detail: "Utente non trovato" });
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
  
    if (!updated) {
      return res.status(401).json({ detail: "Utente non trovato o credenziali errate" });
    }
  
    fs.writeFileSync(USERS_FILE, newLines.join("\n") + "\n");
    res.json({ status: "success", field, new_value });
  });
  


//cittadino
app.post("/cittadino/dati", (req, res) => {
    const { email, password } = req.body;
    if (!verificaUtente(email, password)) {
      return res.status(401).json({ detail: "Credenziali non valide" });
    }
  
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(404).json({ detail: "Nessun dato disponibile" });
    }
  
    const rows = fs.readFileSync(DATA_FILE, "utf-8").split("\n").filter(Boolean);
    const [header, ...dataRows] = rows;
  
    for (let row of dataRows) {
      const parts = row.split(",");
      if (parts[0] === email) {
        return res.json({
          subscription_code: parts[1],
          pod_code: parts[2],
          driver_license: parts[3],
        });
      }
    }
  
    res.status(404).json({ detail: "Dati utente non trovati" });
  });
  
  
  //manca da aggiungere gli altri endpoint /cittadino (aggiungi_dato, modifica_dato, rimuovi_dato, rimuovi_tutti)

//avvio server: non so come farlo 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});