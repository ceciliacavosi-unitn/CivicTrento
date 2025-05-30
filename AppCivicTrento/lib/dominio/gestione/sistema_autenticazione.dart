// ======================================================
// sistema_autenticazione.dart (dominio/gestione/)
//
// Funzione del file:
// - Gestisce l'autenticazione e mantiene i dati di sessione
//   (email, password e token JWT) per l'utente attualmente loggato.
//
// ======================================================

/// Classe per gestire le credenziali dell'utente autenticato.
class SistemaAutenticazione {
  static String? _email;
  static String? _password;
  static String? _token;
  static int _saldo = 0;

  /// Imposta le credenziali e il token dell'utente loggato
  static void login(String email, String password, String token) {
    _email = email;
    _password = password;
    _token = token;
  }

  /// Email dell'utente loggato (null se non loggato)
  static String get email => _email ?? '';

  /// Password dell'utente loggato (null se non loggato)
  static String get password => _password ?? '';

  /// Token JWT attuale (null se non loggato)
  static String get token => _token ?? '';

  /// Verifica se l'utente è loggato correttamente
  static bool get isLoggedIn => _email != null && _token != null;

  /// Ottiene l'utente attuale in forma strutturata
  static UtenteAutenticato get utenteAttuale => UtenteAutenticato(
        email: email,
        password: password,
        token: token,
        saldo: _saldo,
      );

  /// Aggiorna il saldo CivicCoins
  static void aggiornaSaldo(int nuovoSaldo) {
    _saldo = nuovoSaldo;
  }

  /// Ottiene il saldo attuale
  static int get saldo => _saldo;

  /// Esegue il logout
  static void logout() {
    _email = null;
    _password = null;
    _token = null;
    _saldo = 0;
  }
}

/// Oggetto di supporto per rappresentare i dati utente
class UtenteAutenticato {
  final String email;
  final String password;
  final String token;
  final int saldo;

  UtenteAutenticato({
    required this.email,
    required this.password,
    required this.token,
    required this.saldo,
  });
}
