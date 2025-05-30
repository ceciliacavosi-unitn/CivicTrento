// ======================================================
// servizio_movimenti.dart (servizi/)
//
// Funzione del file:
// - Registra uno spostamento sostenibile effettuato dal cittadino.
// - Comunica la distanza percorsa al backend.
// - Autenticazione tramite JWT.
// - Aggiorna il saldo dei CivicCoins se accettato.
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

/// Servizio per registrare uno spostamento (es. a piedi o in bici).
class ServizioMovimenti {
  /// Invia la distanza percorsa in [distanzaKm] al backend.
  ///
  /// - Utilizza il token JWT dell’utente per autenticazione.
  /// - Se la risposta è `200`, aggiorna il saldo CivicCoins e ritorna `true`.
  /// - Altrimenti ritorna `false`.
  static Future<bool> registraSpostamento(double distanzaKm) async {
    final response = await http.post(
      Uri.parse(movimento),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${SistemaAutenticazione.utenteAttuale.token}', //Token JWT
      },
      body: jsonEncode({
        'email': SistemaAutenticazione.utenteAttuale.email,
        'distanza_km': distanzaKm,
      }),
    );

    if (response.statusCode == 200) {
      SistemaAutenticazione.aggiornaSaldo(jsonDecode(response.body)['nuovoSaldo']);
      return true;
    }

    return false;
  }
}
