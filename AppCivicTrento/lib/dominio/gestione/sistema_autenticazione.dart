// ======================================================
// 📄 sistema_autenticazione.dart (dominio/gestione/)
//
// 📌 Funzione del file:
// - Gestisce l'autenticazione e mantiene i dati di sessione
//   (email e password) per l'utente attualmente loggato.
//
// ======================================================

class SistemaAutenticazione {
  static String? _email;
  static String? _password;

  /// 🔐 Imposta le credenziali dell'utente loggato
  static void login(String email, String password) {
    _email = email;
    _password = password;
  }

  /// 🔓 Rimuove le credenziali (logout)
  static void logout() {
    _email = null;
    _password = null;
  }

  /// 📧 Ottiene l'email dell'utente loggato (null se non loggato)
  static String? get email => _email;

  /// 🔑 Ottiene la password dell'utente loggato (null se non loggato)
  static String? get password => _password;

  /// 🔍 Verifica se l'utente è loggato
  static bool get isLoggedIn => _email != null && _password != null;
}
