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

