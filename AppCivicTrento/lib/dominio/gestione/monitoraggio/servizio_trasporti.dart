// ======================================================
// servizio_trasporti.dart (servizi/)
//
// Funzione del file:
// - Comunica al backend l’attivazione di un abbonamento ai trasporti pubblici.
// - Autenticazione tramite token JWT dell’utente.
// - Se accettato, aggiorna il saldo CivicCoins.
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

/// Servizio per registrare un abbonamento ai trasporti pubblici.
class ServizioTrasporti {
  /// Invia la richiesta di registrazione abbonamento.
  ///
  /// - Usa il token JWT per autenticazione.
  /// - Ritorna `true` se il backend risponde con successo (200).
  /// - In caso contrario, ritorna `false`.
  static Future<bool> registraAbbonamento() async {
    final response = await http.post(
      Uri.parse(trasporti),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${SistemaAutenticazione.utenteAttuale.token}', //JWT
      },
      body: jsonEncode({
        'email': SistemaAutenticazione.utenteAttuale.email,
      }),
    );

    if (response.statusCode == 200) {
      final nuovoSaldo = jsonDecode(response.body)['nuovoSaldo'];
      SistemaAutenticazione.aggiornaSaldo(nuovoSaldo);
      return true;
    }

    return false;
  }
}
