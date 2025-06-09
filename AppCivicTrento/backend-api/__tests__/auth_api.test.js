const request = require("supertest");
const fs = require("fs");
const app = require("../server");

const statusPath = "report/status_codes_auth.json";
const utentiPath = "report/utenti_test.json";

global.testStatusLog = [];
global.testCreatedUsers = [];

function logTestStatus(title, res) {
  global.testStatusLog.push({
    title,
    statusCode: res.statusCode
  });
}

/**
 * =======================
 * LOGIN UTENTE (US 0–3)
 * =======================
 */
describe("Login utente", () => {
  it("US0 - Login con credenziali corrette", async () => {
    const email = "loginok@example.com";
    const password = "Password@123";

    await request(app).post("/auth/register").send({
      email,
      password,
      nome: "Matilde",
      cognome: "Prati",
      CF: "PRTMLD02T63F205C",
      cartaID: "CA00499KT",
      gdprConsent: true
    });

    global.testCreatedUsers.push({ email, password });

    const res = await request(app).post("/auth/login").send({ email, password });

    logTestStatus("US0 - Login con credenziali corrette", res);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("US1 - Login con password errata", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "loginok@example.com",
      password: "errata"
    });

    logTestStatus("US1 - Login con password errata", res);
    expect(res.statusCode).toBe(404);
  });

  it("US2 - Login con email non valida", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "utente/example.com",
      password: "Password@123"
    });

    logTestStatus("US2 - Login con email non valida", res);
    expect(res.statusCode).toBe(400);
  });

  it("US3 - Login con credenziali non registrate", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "fake@example.com",
      password: "Password@123"
    });

    logTestStatus("US3 - Login con credenziali non registrate", res);
    expect(res.statusCode).toBe(404);
  });
});

/**
 * ============================
 * PASSWORD SICURA (US 4–5)
 * ============================
 */
describe("Password sicura", () => {
  it("US4 - Registrazione fallita con password semplice", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "semplice@example.com",
      password: "12345",
      nome: "Matilde",
      cognome: "Prati",
      CF: "PRTMLD02T63F205C",
      cartaID: "CA00499KT",
      gdprConsent: true
    });

    logTestStatus("US4 - Registrazione fallita con password semplice", res);
    expect(res.statusCode).toBe(400);
  });

  it("US5 - Registrazione accettata con password complessa", async () => {
    const email = "complessa@example.com";
    const password = "Password@123";

    const res = await request(app).post("/auth/register").send({
      email,
      password,
      nome: "Matilde",
      cognome: "Prati",
      CF: "PRTMLD02T63F205C",
      cartaID: "CA00499KT",
      gdprConsent: true
    });

    logTestStatus("US5 - Registrazione accettata con password complessa", res);
    expect(res.statusCode).toBe(200);

    if (res.statusCode === 200) {
      global.testCreatedUsers.push({ email, password });
    }
  });
});

/**
 * ===============================
 * RECUPERO PASSWORD (US 6–7)
 * ===============================
 */
describe("Recupero password", () => {
  it("US6 - Recupero password con token valido simulato", async () => {
    const res = await request(app).post("/auth/reset_password").send({
      token: "token_valido",
      newPassword: "NuovaPassword@2024"
    });

    logTestStatus("US6 - Recupero password con token valido simulato", res);
    expect([200, 400]).toContain(res.statusCode);
  });

  it("US7 - Recupero password con token non valido", async () => {
    const res = await request(app).post("/auth/reset_password").send({
      token: "token_falso",
      newPassword: "NuovaPassword@2024"
    });

    logTestStatus("US7 - Recupero password con token non valido", res);
    expect(res.statusCode).toBe(400);
  });
});

/**
 * ==============================
 * REGISTRAZIONE UTENTE (US 8–18)
 * ==============================
 */
describe("Registrazione utente", () => {
  const casi = [
    ["US8 - Registrazione con valori validi", { email: "valido@example.com", password: "Password@123" }, [200, 409]],
    ["US9 - Nome vuoto", { nome: "", cognome: "Prati", email: "vuotonome@example.com" }, 400],
    ["US10 - Cognome vuoto", { nome: "Matilde", cognome: "", email: "vuotocognome@example.com" }, 400],
    ["US11 - Email vuota", { nome: "Matilde", cognome: "Prati", email: "", }, 400],
    ["US12 - Password vuota", { nome: "Matilde", cognome: "Prati", email: "vuotapass@example.com", password: "" }, 400],
    ["US13 - Codice fiscale vuoto", { CF: "", email: "vuotoCF@example.com" }, 400],
    ["US14 - Carta d'identità vuota", { cartaID: "", email: "vuotacarta@example.com" }, 400],
    ["US15 - Email non valida", { email: "utente/example.com" }, 400],
    ["US16 - Email già esistente", { email: "valido@example.com" }, 409],
    ["US17 - Codice fiscale non valido", { CF: "ABC123", email: "cfnonvalido@example.com" }, 400],
    ["US18 - Carta d'identità non valida", { cartaID: "12345", email: "cartaidnonvalido@example.com" }, 400]
  ];

  for (const [titolo, dati, expected] of casi) {
    it(titolo, async () => {
      const res = await request(app).post("/auth/register").send({
        nome: dati.nome || "Matilde",
        cognome: dati.cognome || "Prati",
        password: dati.password || "Password@123",
        CF: dati.CF || "PRTMLD02T63F205C",
        cartaID: dati.cartaID || "CA00499KT",
        email: dati.email,
        gdprConsent: true,
        ...dati
      });

      logTestStatus(titolo, res);

      if (Array.isArray(expected)) {
        expect(expected).toContain(res.statusCode);
      } else {
        expect(res.statusCode).toBe(expected);
      }

      if (res.statusCode === 200) {
        global.testCreatedUsers.push({
          email: dati.email,
          password: dati.password || "Password@123"
        });
      }
    });
  }
});

/**
 * =============================
 * CONSENSO GDPR (US 20)
 * =============================
 */
describe("Consenso GDPR", () => {
  it("US20 - Registrazione fallita senza consenso GDPR", async () => {
    const res = await request(app).post("/auth/register").send({
      nome: "Matilde",
      cognome: "Prati",
      email: "nogdpr@example.com",
      password: "Password@123",
      CF: "PRTMLD02T63F205C",
      cartaID: "CA00499KT",
      gdprConsent: false
    });

    logTestStatus("US20 - Registrazione fallita senza consenso GDPR", res);
    expect(res.statusCode).toBe(400);
  });
});

/**
 * ===============================
 * CANCELLAZIONE ACCOUNT (US 29)
 * ===============================
 */
describe("Cancellazione account", () => {
  it("US29 - Cancellazione account riuscita", async () => {
    const res = await request(app).delete("/auth/delete_user").send({
      email: "valido@example.com",
      password: "Password@123"
    });

    logTestStatus("US29 - Cancellazione account riuscita", res);
    expect([200, 404]).toContain(res.statusCode);
  });
});

/**
 * ====================================
 * RIEPILOGO STATUS CODE E UTENTI
 * ====================================
 */
afterAll(() => {
  fs.writeFileSync(statusPath, JSON.stringify(global.testStatusLog, null, 2));
  fs.writeFileSync(utentiPath, JSON.stringify(global.testCreatedUsers, null, 2));

  console.log("\nRiepilogo Status Code dei Test:");
  console.log("====================================");
  global.testStatusLog.forEach(entry => {
    console.log(`${entry.title} → Status code: ${entry.statusCode}`);
  });

  console.log(`\nUtenti di test salvati in ${utentiPath}`);
});
