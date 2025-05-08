from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from enum import Enum
import os
import csv

app = FastAPI()

# ======================================================
# 📦 MODELLI DI RICHIESTA: AUTENTICAZIONE (/auth)
# ======================================================

class AuthRegisterRequest(BaseModel):
    name: str
    surname: str
    email: str
    password: str
    fiscal_code: str
    id_card_number: str

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class AuthDeleteUserRequest(BaseModel):
    email: str
    password: str

class AuthLogoutRequest(BaseModel):
    email: str

# ======================================================
# 📦 MODELLI DI RICHIESTA: PROFILO UTENTE (/utente)
# ======================================================

class UtenteProfiloRequest(BaseModel):
    email: str
    password: str

class UtenteFieldName(str, Enum):
    name = "name"
    surname = "surname"
    email = "email"
    fiscal_code = "fiscal_code"
    id_card_number = "id_card_number"

class UtenteModificaProfiloRequest(BaseModel):
    email: str
    password: str
    field: UtenteFieldName
    new_value: str

# ======================================================
# 📦 MODELLI DI RICHIESTA: DATI CITTADINO (/cittadino)
# ======================================================

class CittadinoDatiRequest(BaseModel):
    email: str
    password: str

class CittadinoSingoloCampoRequest(BaseModel):
    email: str
    password: str
    field: str  # subscription_code, pod_code, driver_license
    value: str

# ======================================================
# 🔐 FUNZIONE DI VERIFICA
# ======================================================

def verifica_utente(email: str, password: str) -> bool:
    if not os.path.exists("users.txt"):
        return False
    with open("users.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 4 and row[2] == email and row[3] == password:
                return True
    return False

# ======================================================
# 🔐 AUTENTICAZIONE (/auth)
# ======================================================

@app.post("/auth/register")
def register(data: AuthRegisterRequest):
    with open("users.txt", "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            data.name.strip(),
            data.surname.strip(),
            data.email.strip(),
            data.password.strip(),
            data.fiscal_code.strip(),
            data.id_card_number.strip()
        ])
    return {"status": "success", "message": "Registrazione completata"}

@app.post("/auth/login")
def login(data: AuthLoginRequest):
    if verifica_utente(data.email, data.password):
        return {"status": "success", "message": "Login effettuato"}
    raise HTTPException(status_code=401, detail="Credenziali non valide")

@app.delete("/auth/delete_user")
def delete_user(data: AuthDeleteUserRequest):
    if not os.path.exists("users.txt"):
        raise HTTPException(status_code=404, detail="Nessun utente registrato")

    utenti_rimanenti = []
    utente_trovato = False

    with open("users.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) == 6 and row[2] == data.email and row[3] == data.password:
                utente_trovato = True
            else:
                utenti_rimanenti.append(row)

    if not utente_trovato:
        raise HTTPException(status_code=404, detail="Utente non trovato o credenziali errate")

    with open("users.txt", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(utenti_rimanenti)

    return {"status": "success", "message": f"Utente {data.email} eliminato correttamente"}

@app.post("/auth/logout")
def logout(data: AuthLogoutRequest):
    if not os.path.exists("users.txt"):
        raise HTTPException(status_code=404, detail="Nessun utente registrato")

    with open("users.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 3 and row[2] == data.email:
                return {"status": "success", "message": f"Logout effettuato per {data.email}"}

    raise HTTPException(status_code=404, detail="Utente non trovato")

# ======================================================
# 👤 PROFILO UTENTE (/utente)
# ======================================================

@app.post("/utente/profilo")
def get_profilo(data: UtenteProfiloRequest):
    """
    ✅ Endpoint: /utente/profilo
    Restituisce i dati anagrafici del profilo utente.
    """
    if not os.path.exists("users.txt"):
        raise HTTPException(status_code=404, detail="Nessun utente registrato")

    with open("users.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 5 and row[2] == data.email and row[3] == data.password:
                return {
                    "name": row[0],
                    "surname": row[1],
                    "email": row[2],
                    "fiscal_code": row[4],
                    "id_card_number": row[5] if len(row) > 5 else "",
                }

    raise HTTPException(status_code=401, detail="Credenziali non valide")

@app.put("/utente/modifica_profilo")
def modify_profilo(data: UtenteModificaProfiloRequest):
    """
    ✅ Endpoint: /utente/modifica_profilo
    Modifica un campo specifico del profilo (es. nome, email ecc.).
    """
    if not os.path.exists("users.txt"):
        raise HTTPException(status_code=404, detail="Nessun utente registrato")

    updated = False
    rows = []

    with open("users.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 4 and row[2] == data.email and row[3] == data.password:
                idx_map = {
                    UtenteFieldName.name: 0,
                    UtenteFieldName.surname: 1,
                    UtenteFieldName.email: 2,
                    UtenteFieldName.fiscal_code: 4,
                    UtenteFieldName.id_card_number: 5,
                }
                idx = idx_map[data.field]
                if idx >= len(row):
                    row += [""] * (idx - len(row) + 1)
                row[idx] = data.new_value.strip()
                updated = True
            rows.append(row)

    if not updated:
        raise HTTPException(status_code=401, detail="Utente non trovato o credenziali errate")

    with open("users.txt", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(rows)

    return {"status": "success", "field": data.field, "new_value": data.new_value}

# ======================================================
# 🏩 DATI CITTADINO (/cittadino)
# ======================================================

@app.post("/cittadino/dati")
def get_cittadino_dati(data: CittadinoDatiRequest):
    if not verifica_utente(data.email, data.password):
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    if not os.path.exists("data.txt"):
        raise HTTPException(status_code=404, detail="Nessun dato disponibile")

    with open("data.txt", "r", newline="") as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            if row[0] == data.email:
                return {
                    "subscription_code": row[1],
                    "pod_code": row[2],
                    "driver_license": row[3]
                }

    raise HTTPException(status_code=404, detail="Dati utente non trovati")

@app.post("/cittadino/aggiungi_dato")
def aggiungi_dato(data: CittadinoSingoloCampoRequest):
    if not verifica_utente(data.email, data.password):
        raise HTTPException(status_code=401, detail="Credenziali non valide")

    header = ["email", "subscription_code", "pod_code", "driver_license"]
    if data.field not in header:
        raise HTTPException(status_code=400, detail="Campo non valido")

    if not os.path.exists("data.txt"):
        with open("data.txt", "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(header)

    rows = []
    found = False
    with open("data.txt", "r", newline="") as f:
        reader = csv.reader(f)
        existing_header = next(reader, None)
        for row in reader:
            if row[0] == data.email:
                index = header.index(data.field)
                while len(row) < len(header):
                    row.append("")
                if row[index]:
                    raise HTTPException(status_code=400, detail="Dato già esistente")
                row[index] = data.value.strip()
                found = True
            rows.append(row)

    if not found:
        row = [""] * 4
        row[0] = data.email
        row[header.index(data.field)] = data.value.strip()
        rows.append(row)

    with open("data.txt", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

    return {"status": "success", "message": f"{data.field} aggiunto"}

@app.put("/cittadino/modifica_dato")
def modifica_dato(data: CittadinoSingoloCampoRequest):
    if not verifica_utente(data.email, data.password):
        raise HTTPException(status_code=401, detail="Credenziali non valide")

    header = ["email", "subscription_code", "pod_code", "driver_license"]
    if data.field not in header:
        raise HTTPException(status_code=400, detail="Campo non valido")

    rows = []
    modified = False

    if not os.path.exists("data.txt"):
        raise HTTPException(status_code=404, detail="Nessun dato disponibile")

    with open("data.txt", "r", newline="") as f:
        reader = csv.reader(f)
        next(reader, None)  # Salta intestazione
        for row in reader:
            if row[0].strip() == data.email.strip():
                index = header.index(data.field)
                while len(row) < len(header):
                    row.append("")
                row[index] = data.value.strip()
                modified = True
            rows.append(row)

    if not modified:
        raise HTTPException(status_code=404, detail="Dati non trovati")

    with open("data.txt", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

    return {"status": "success", "message": f"{data.field} modificato"}

@app.delete("/cittadino/rimuovi_dato")
def rimuovi_dato(data: CittadinoSingoloCampoRequest):
    if not verifica_utente(data.email, data.password):
        raise HTTPException(status_code=401, detail="Credenziali non valide")

    header = ["email", "subscription_code", "pod_code", "driver_license"]
    if data.field not in header:
        raise HTTPException(status_code=400, detail="Campo non valido")

    rows = []
    removed = False
    with open("data.txt", "r", newline="") as f:
        reader = csv.reader(f)
        existing_header = next(reader, None)
        for row in reader:
            if row[0] == data.email:
                index = header.index(data.field)
                while len(row) < len(header):
                    row.append("")
                if row[index]:
                    row[index] = ""
                    removed = True
            rows.append(row)

    if not removed:
        raise HTTPException(status_code=404, detail="Dato non trovato")

    with open("data.txt", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

    return {"status": "success", "message": f"{data.field} rimosso"}
