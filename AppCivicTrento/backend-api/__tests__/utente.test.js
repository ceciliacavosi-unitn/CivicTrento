const request = require("supertest");
const app = require("../server");

let token = "";

// Array globale per raccogliere i codici di stato dei test
global.testStatusLog = [];

function logTestStatus(title, res) {
  global.testStatusLog.push({
    title,
    statusCode: res.statusCode
  });
}

/**
 * =========================================
 * SETUP: REGISTRAZIONE + LOGIN UTENTE BASE
 * =========================================
 */
beforeAll(async () => {
  await request(app).post("/auth/register").send({
    email: "elena@example.com",
    password: "Password@123",
    nome: "Elena",
    cognome: "Rubbo",
    CF: "RBBLNA03R46T206G",
    cartaID: "CA00000AA",
    gdprConsent: true
  });

  const login = await request(app).post("/auth/login").send({
    email: "elena@example.com",
    password: "Password@123"
  });

  if (!login.body.token) {
    throw new Error("Token non ottenuto: assicurati che l'utente 'elena@example.com' sia registrato correttamente");
  }

  token = login.body.token;
});

/**
 * ====================================
 * MODIFICA PASSWORD (US 19)
 * ====================================
 */
describe("Modifica password", () => {
  it("US19 - Modifica password con valore valido", async () => {
    const res = await request(app)
      .put("/utente/modifica_profilo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        field: "password",
        new_value: "NewPwd123!"
      });

    logTestStatus("US19 - Modifica password con valore valido", res);

    expect(res.statusCode).toBe(200);
  });
});

/**
 * ====================================
 * MODIFICA DATI PERSONALI (US 32–33)
 * ====================================
 */
describe("Modifica dati personali", () => {
  it("US32 - Modifica riuscita del nome", async () => {
    const res = await request(app)
      .put("/utente/modifica_profilo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        field: "nome",
        new_value: "Gianluca"
      });

    console.log("Risposta:", res.statusCode, res.body);

    logTestStatus("US32 - Modifica riuscita del nome", res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("profiloAggiornato");
    expect(res.body.profiloAggiornato.nome).toBe("Gianluca");
  });

  it("US33 - Tentativo di modifica con campo obbligatorio vuoto", async () => {
    const res = await request(app)
      .put("/utente/modifica_profilo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        field: "cognome",
        new_value: ""
      });

    logTestStatus("US33 - Tentativo di modifica con campo obbligatorio vuoto", res);

    expect([400, 401]).toContain(res.statusCode);
  });
});

/**
 * ====================================
 * RIEPILOGO STATUS CODE
 * ====================================
 */
afterAll(() => {
  const fs = require("fs");
  const path = "report/status_codes_utente.json";
  fs.writeFileSync(path, JSON.stringify(global.testStatusLog, null, 2));

  console.log("\n📊 Riepilogo Status Code dei Test:");
  console.log("====================================");
  global.testStatusLog.forEach(entry => {
    console.log(`🧪 ${entry.title} → Status code: ${entry.statusCode}`);
  });
});
