// ======================================================
// 📄 utente.dart (dominio/utenti/)
//
// 📌 Funzione del file:
// - Definisce la classe base `Utente`, che rappresenta un utente
//   generico del sistema CivicCoins.
//
// ======================================================

/// 🧑 Classe base per rappresentare un utente del sistema.
///
/// Campi comuni:
/// - [nome]
/// - [cognome]
/// - [email]
class Utente {
  final String nome;
  final String cognome;
  final String email;

  Utente({
    required this.nome,
    required this.cognome,
    required this.email,
  });
}
