// ======================================================
// servizio_bollette.dart (servizi/)
//
// Funzione del file:
// - Esegue la registrazione del pagamento di una bolletta.
// - Invia al backend: l'email dell’utente e il tipo di bolletta pagata.
// - Include il token JWT nell’header per autenticazione sicura.
// - Se il backend conferma (200 OK), aggiorna il saldo locale.
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

/// Classe che gestisce il servizio di registrazione delle bollette pagate.
class ServizioBollette {
  /// Metodo per registrare una bolletta di tipo [tipo] per l’utente attuale.
  ///
  /// - Invia una richiesta POST al backend con:
  ///     → email utente
  ///     → tipo di bolletta (es. "gas", "acqua", "elettrica")
  /// - Include l'header JWT per autenticazione (`Authorization: Bearer <token>`).
  /// - Se la risposta è valida, aggiorna il saldo dei CivicCoins.
  /// - Ritorna `true` se la registrazione è andata a buon fine, `false` altrimenti.
  static Future<bool> registraBolletta(String tipo) async {
    final response = await http.post(
      Uri.parse(bolletta),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${SistemaAutenticazione.utenteAttuale.token}', //Token JWT
      },
      body: jsonEncode({
        'email': SistemaAutenticazione.utenteAttuale.email,
        'tipo': tipo,
      }),
    );

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      SistemaAutenticazione.aggiornaSaldo(json['nuovoSaldo']);
      return true;
    }

    return false;
  }
}
