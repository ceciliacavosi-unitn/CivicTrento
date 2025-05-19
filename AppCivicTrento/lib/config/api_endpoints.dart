// ======================================================
// 📄 api_endpoints.dart
// Configurazione centralizzata degli endpoint API.
//
// 📌 Funzione del file:
// - Definisce l’indirizzo del server e costruisce dinamicamente
//   tutti i percorsi (URL) delle API per l'app CivicCoins.
// - Centralizza le rotte per facilitare eventuali modifiche future.
//
// 📦 Collegamento alla struttura del progetto:
// - Situato nella cartella `config/`, usato dai servizi in `servizi/`.
//
// ======================================================

/// 🖥 Indirizzo del server (host + porta)
const String apiHost = '172.20.10.2:8000'; // ceci_casa: 192.168.0.108 //mati: 172.20.10.3 //ceci_casa_luca: 192.168.1.66 //ceci_casa_luca_dese: 192.168.1.65 //elena_cell: 172.20.10.2

/// 🌐 URL base completo (protocollo + host + porta)
const String baseUrl = 'http://$apiHost';

//// ======================================================
/// 📂 Endpoint di autenticazione (/auth/)
/// ======================================================

/// Registrazione utente (creazione account)
const String registerUrl = '$baseUrl/auth/register';

/// Login utente (autenticazione)
const String loginUrl = '$baseUrl/auth/login';

/// Logout utente (termina la sessione)
const String logoutUrl = '$baseUrl/auth/logout';

/// Cancellazione account utente
const String deleteUserUrl = '$baseUrl/auth/delete_user';

/// ======================================================
/// 📂 Gestione del profilo utente (/utente/)
/// ======================================================

/// Ottiene i dati del profilo utente (nome, cognome, email ecc.)
const String myAccountUrl = '$baseUrl/utente/profilo';

/// Modifica i dati del profilo utente
const String modifyProfileUrl = '$baseUrl/utente/modifica_profilo';

/// ======================================================
/// 📂 Dati specifici del cittadino (/cittadino/)
/// ======================================================

/// Recupera dati specifici del cittadino (abbonamenti, POD, patente ecc.)
const String myDataUrl = '$baseUrl/cittadino/dati';

/// Inserisce nuovi dati del cittadino (SINGOLO campo)
const String insertDataUrl = '$baseUrl/cittadino/aggiungi_dato';

/// Modifica i dati esistenti del cittadino (SINGOLO campo)
const String modifyDataUrl = '$baseUrl/cittadino/modifica_dato';

/// Rimuove un singolo dato del cittadino (es. codice POD, patente)
const String deleteDataUrl = '$baseUrl/cittadino/rimuovi_dato';

/// Elimina tutti i dati civici 
const String deleteAllDataUrl = '$baseUrl/cittadino/rimuovi_tutti';

/// ======================================================
/// 📂 Premi (/premi/)
/// ======================================================
const String premiUrl = '$baseUrl/premi';
const String riscattaPremioUrl = '$baseUrl/premi/riscatta';

/// 📂 Monitoraggio dati (/cittadino/)
/// ======================================================

// Monitoraggio comportamenti
const String voto = "$baseUrl/monitoraggio/voto";
const String bolletta = "$baseUrl/monitoraggio/bolletta";
const String movimento = "$baseUrl/monitoraggio/movimento";
const String trasporti = "$baseUrl/monitoraggio/trasporti";
const String multa = "$baseUrl/monitoraggio/multa";
const String bonusAnnuale = "$baseUrl/monitoraggio/bonus-annuale";
