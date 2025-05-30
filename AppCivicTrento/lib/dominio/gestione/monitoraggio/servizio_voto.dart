// ======================================================
// servizio_voto.dart (servizi/)
//
// Funzione del file:
// - Comunica al backend la partecipazione al voto elettorale.
// - Utilizza autenticazione con token JWT.
// - Se il backend risponde positivamente, aggiorna il saldo CivicCoins.
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

/// Servizio per registrare la partecipazione al voto.
class ServizioVoto {
  /// Invia la richiesta di registrazione del voto elettorale.
  ///
  /// - Autenticazione tramite token JWT.
  /// - Ritorna `true` se l’operazione ha successo.
  /// - Altrimenti ritorna `false`.
  static Future<bool> registraVoto() async {
    final response = await http.post(
      Uri.parse(voto),
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
