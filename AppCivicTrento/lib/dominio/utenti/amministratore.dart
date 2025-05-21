// ======================================================
// amministratore.dart (dominio/utenti/)
//
// Funzione del file:
// - Definisce la classe `Amministratore`, che estende `Utente`
//   e rappresenta un amministratore con privilegi aggiuntivi.
//
// ======================================================

import 'utente.dart';

/// Classe `Amministratore`, estende `Utente`.
///
/// Campi aggiuntivi (opzionale):
/// - [permessi]: lista di permessi/azioni amministrative consentite.
class Amministratore extends Utente {
  final List<String> permessi;

  Amministratore({
    required String nome,
    required String cognome,
    required String email,
    this.permessi = const [],
  }) : super(
          nome: nome,
          cognome: cognome,
          email: email,
        );
}
