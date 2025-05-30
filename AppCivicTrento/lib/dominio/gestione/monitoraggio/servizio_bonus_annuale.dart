// ======================================================
// servizio_bonus_annuale.dart (servizi/)
//
// Funzione del file:
// - Esegue la richiesta HTTP per assegnare il bonus annuale.
// - Invia l'email dell'utente autenticato al backend.
// - Include il token JWT nell’header per l’autenticazione.
// - Se la risposta è valida, aggiorna il saldo locale.
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

/// Classe che gestisce il servizio di bonus annuale.
class ServizioBonusAnnuale {
  /// Metodo statico per assegnare il bonus annuale all’utente autenticato.
  ///
  /// - Esegue una richiesta POST al backend con l'email dell’utente.
  /// - Include il token JWT nell'header `Authorization: Bearer <token>`.
  /// - Se la risposta è 200 OK:
  ///   → aggiorna il saldo locale con il nuovo valore.
  ///   → ritorna `true`.
  /// - Altrimenti ritorna `false`.
  static Future<bool> assegnaBonus() async {
    final response = await http.post(
      Uri.parse(bonusAnnuale),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${SistemaAutenticazione.utenteAttuale.token}', //Token JWT
      },
      body: jsonEncode({
        'email': SistemaAutenticazione.utenteAttuale.email,
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
