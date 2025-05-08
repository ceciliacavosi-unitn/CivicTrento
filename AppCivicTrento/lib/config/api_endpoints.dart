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
const String apiHost = '192.168.0.108:8000';

/// 🌐 URL base completo (protocollo + host + porta)
const String baseUrl = 'http://$apiHost';

/// ======================================================
/// 📂 Endpoint di autenticazione (/auth/)
/// ======================================================

/// Registrazione utente (creazione account)
const String registerUrl = '$baseUrl/auth/register';

/// Login utente (autenticazione)
const String loginUrl = '$baseUrl/auth/login';
