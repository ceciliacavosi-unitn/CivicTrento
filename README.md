# 🚀 CivicTrento

CivicTrento è un’app Flutter con backend FastAPI progettata per premiare comportamenti virtuosi e sostenibili dei cittadini. L'app permette di:

- ✅ Registrarsi e autenticarsi
- ✅ Gestire il profilo personale e i dati (codice abbonamenti, codice POD, numero patente)
- ✅ Accumulare Civic-Coins tramite attività sostenibili (es. mobilità ecologica, consumi bassi domestici)
- ✅ Monitorare multe, bollette e spostamenti
- ✅ Riscattare premi e offerte

---

## 📂 Struttura del progetto

- **Frontend Flutter (`lib/`)**: contiene UI, logica di business e servizi.
- **Backend FastAPI (`backend-api/`)**: API + gestione dei dati salvati (CSV).
- **Docker / Docker Compose**: orchestrazione dei container per avviare l'intero sistema in modo semplice e rapido.

---

## 🚀 Avvio rapido

L'intero progetto è containerizzato: **non è necessario installare Flutter o Python sul proprio sistema**.

### ▶️ Prerequisiti

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### ▶️ Procedura di avvio (solo Linux)

1.  **Clona repository:**
   ```bash
   git clone <URL_DEL_TUO_REPO>
   cd <nome_cartella_repo>

2.  **Avvia l'applicazione con docker-compose:**:
    ⚠️ **IMPORTANTE:** la prima volta che avvii il progetto (oppure ogni volta che modifichi i file Docker), è necessario costruire le immagini usando:
   ```bash
   docker-compose up --build
   
   Le volte successive è sufficiente lanciare:
   ```bash
   ./docker_compose_start.sh

3. **Accesso all'app:**
   **Backend API (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
   **Frontend (solo Android):** 
        ```bash
        flutter run -d <id-device>

4. **Stop dei container (senza eliminarli):**

   Per fermare i container mantenendo le immagini:
   ```bash
   ./docker_compose_stop.sh
