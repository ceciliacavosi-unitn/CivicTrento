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
    """
    Modello per la registrazione utente.
    Contiene i dati anagrafici e le credenziali.
    """
    name: str
    surname: str
    email: str
    password: str
    fiscal_code: str
    id_card_number: str

class AuthLoginRequest(BaseModel):
    """
    Modello per il login utente.
    Richiede email e password.
    """
    email: str
    password: str

class AuthDeleteUserRequest(BaseModel):
    """
    Modello per la cancellazione di un account utente.
    Richiede email e password per verifica.
    """
    email: str
    password: str

class AuthLogoutRequest(BaseModel):
    """
    Modello per il logout utente.
    Richiede solo l'email (opzionale: possiamo anche non verificare nulla).
    """
    email: str


# ======================================================
# 📦 MODELLI DI RICHIESTA: PROFILO UTENTE (/utente)
# ======================================================

class UtenteProfiloRequest(BaseModel):
    """
    Modello per recuperare i dati del profilo.
    Richiede email e password.
    """
    email: str
    password: str

class UtenteFieldName(str, Enum):
    """
    Enum che rappresenta i campi modificabili del profilo.
    """
    name = "name"
    surname = "surname"
    email = "email"
    fiscal_code = "fiscal_code"
    id_card_number = "id_card_number"

class UtenteModificaProfiloRequest(BaseModel):
    """
    Modello per modificare un campo del profilo utente.
    Richiede:
    - email e password per autenticazione
    - field da modificare
    - nuovo valore da inserire
    """
    email: str
    password: str
    field: UtenteFieldName
    new_value: str

# ======================================================
# 📦 MODELLI DI RICHIESTA: DATI CITTADINO (/cittadino)
# ======================================================

class CittadinoDatiRequest(BaseModel):
    """
    Modello per recuperare i dati civici (POD, abbonamento ecc.)
    Richiede email e password.
    """
    email: str
    password: str

class CittadinoInserisciDatiRequest(BaseModel):
    """
    Modello per inserire nuovi dati civici.
    """
    email: str
    subscription_code: str
    pod_code: str
    driver_license: str

class CittadinoModificaDatiRequest(BaseModel):
    """
    Modello per modificare i dati civici esistenti.
    """
    email: str
    subscription_code: str
    pod_code: str
    driver_license: str

# ======================================================
# 🔐 AUTENTICAZIONE (/auth)
# ======================================================

@app.post("/auth/register")
def register(data: AuthRegisterRequest):
    """
    ✅ Endpoint: /auth/register
    Registra un nuovo utente scrivendo i dati in users.txt.
    """
    # Strip dei dati in ingresso
    name = data.name.strip()
    surname = data.surname.strip()
    email = data.email.strip()
    password = data.password.strip()
    fiscal = data.fiscal_code.strip()
    id_card = data.id_card_number.strip()

    # Aggiunge l'utente al file CSV
    with open("users.txt", "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([name, surname, email, password, fiscal, id_card])

    return {"status": "success", "message": "Registrazione completata"}

@app.post("/auth/login")
def login(data: AuthLoginRequest):
    """
    ✅ Endpoint: /auth/login
    Effettua il login verificando email e password su users.txt.
    """
    if not os.path.exists("users.txt"):
        raise HTTPException(status_code=404, detail="Nessun utente registrato")

    with open("users.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) == 6 and row[2] == data.email and row[3] == data.password:
                return {"status": "success", "message": "Login effettuato"}

    raise HTTPException(status_code=401, detail="Credenziali non valide")

@app.delete("/auth/delete_user")
def delete_user(data: AuthDeleteUserRequest):
    """
    ✅ Endpoint: /auth/delete_user
    Cancella un utente esistente da users.txt.
    """
    if not os.path.exists("users.txt"):
        raise HTTPException(status_code=404, detail="Nessun utente registrato")

    utenti_rimanenti = []
    utente_trovato = False

    with open("users.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) == 6 and row[2] == data.email and row[3] == data.password:
                utente_trovato = True  # Skip questa riga (l'utente da cancellare)
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
    """
    ✅ Endpoint: /auth/logout
    Esegue il logout (solo simulato lato server, nessuna azione reale).
    """
    # Possiamo anche controllare se l'email esiste (opzionale)
    if not os.path.exists("users.txt"):
        raise HTTPException(status_code=404, detail="Nessun utente registrato")

    user_found = False
    with open("users.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 3 and row[2] == data.email:
                user_found = True
                break

    if not user_found:
        raise HTTPException(status_code=404, detail="Utente non trovato")

    return {"status": "success", "message": f"Logout effettuato per {data.email}"}


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
# 🏛️ DATI CITTADINO (/cittadino)
# ======================================================

@app.post("/cittadino/dati")
def get_cittadino_dati(data: CittadinoDatiRequest):
    """
    ✅ Endpoint: /cittadino/dati
    Restituisce i dati civici dell'utente (abbonamento, POD, patente).
    """
    if not os.path.exists("users.txt"):
        raise HTTPException(status_code=404, detail="Nessun utente registrato")
    if not os.path.exists("data.txt"):
        raise HTTPException(status_code=404, detail="Nessun dato disponibile")

    # Verifica le credenziali prima di accedere ai dati
    user_found = False
    with open("users.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 4 and row[2] == data.email and row[3] == data.password:
                user_found = True
                break

    if not user_found:
        raise HTTPException(status_code=401, detail="Credenziali non valide")

    # Cerca i dati civici dell'utente
    with open("data.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 4 and row[0] == data.email:
                return {
                    "subscription_code": row[1],
                    "pod_code": row[2],
                    "driver_license": row[3],
                }

    raise HTTPException(status_code=404, detail="Dati utente non trovati")

@app.post("/cittadino/inserisci_dati")
def insert_cittadino_dati(data: CittadinoInserisciDatiRequest):
    """
    ✅ Endpoint: /cittadino/inserisci_dati
    Inserisce nuovi dati civici per l'utente.
    """
    if not os.path.exists("data.txt"):
        with open("data.txt", "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["email", "subscription_code", "pod_code", "driver_license"])

    with open("data.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 1 and row[0] == data.email:
                raise HTTPException(status_code=400, detail="Dati già esistenti per questo utente")

    with open("data.txt", "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            data.email,
            data.subscription_code.strip(),
            data.pod_code.strip(),
            data.driver_license.strip()
        ])

    return {"status": "success", "message": "Dati inseriti correttamente"}

@app.put("/cittadino/modifica_dati")
def modify_cittadino_dati(data: CittadinoModificaDatiRequest):
    """
    ✅ Endpoint: /cittadino/modifica_dati
    Modifica i dati civici esistenti o li crea se non presenti.
    """
    if not os.path.exists("data.txt"):
        with open("data.txt", "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["email", "subscription_code", "pod_code", "driver_license"])

    updated = False
    rows = []

    with open("data.txt", "r", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if row[0] == data.email:
                row = [
                    data.email,
                    data.subscription_code.strip(),
                    data.pod_code.strip(),
                    data.driver_license.strip()
                ]
                updated = True
            rows.append(row)

    if not updated:
        rows.append([
            data.email,
            data.subscription_code.strip(),
            data.pod_code.strip(),
            data.driver_license.strip()
        ])

    with open("data.txt", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(rows)

    return {"status": "success", "message": "Dati aggiornati correttamente"}
