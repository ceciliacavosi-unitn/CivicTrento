// ======================================================
// cittadino.dart (dominio/utenti/)
//
// Funzione del file:
// - Definisce la classe `Cittadino`, che estende `Utente`
//   con attributi specifici del cittadino (codice fiscale,
//   numero carta d'identità, punti CivicCoins).
//
// ======================================================

import 'utente.dart';

/// Classe `Cittadino`, estende `Utente`.
///
/// Campi aggiuntivi:
/// - [codiceFiscale]
/// - [numeroCartaIdentita]
/// - [punti]: CivicCoins accumulati
class Cittadino extends Utente {
  final String codiceFiscale;
  final String numeroCartaIdentita;
  int punti;

  Cittadino({
    required String nome,
    required String cognome,
    required String email,
    required this.codiceFiscale,
    required this.numeroCartaIdentita,
    this.punti = 0,
  }) : super(
          nome: nome,
          cognome: cognome,
          email: email,
        );
}
