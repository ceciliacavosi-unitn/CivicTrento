// ======================================================
// servizio_multe.dart (servizi/)
//
// Funzione del file:
// - Registra una nuova multa subita dal cittadino.
// - Specifica la gravità della multa al backend.
// - Autenticazione tramite JWT.
// - Aggiorna il saldo dei CivicCoins se accettato.
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'gravita_multa.dart'; // Enum o costanti associate alle gravità
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

/// Servizio per comunicare una multa al backend.
class ServizioMulte {
  /// Invia al backend la [gravita] della multa subita.
  ///
  /// - Utilizza il token JWT dell’utente per autenticazione.
  /// - Se la risposta è `200`, aggiorna il saldo CivicCoins e ritorna `true`.
  /// - Altrimenti ritorna `false`.
  static Future<bool> registraMulta(String gravita) async {
    final response = await http.post(
      Uri.parse(multa),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${SistemaAutenticazione.utenteAttuale.token}', //Token JWT
      },
      body: jsonEncode({
        'email': SistemaAutenticazione.utenteAttuale.email,
        'gravita': gravita,
      }),
    );

    if (response.statusCode == 200) {
      SistemaAutenticazione.aggiornaSaldo(jsonDecode(response.body)['nuovoSaldo']);
      return true;
    }

    return false;
  }
}
