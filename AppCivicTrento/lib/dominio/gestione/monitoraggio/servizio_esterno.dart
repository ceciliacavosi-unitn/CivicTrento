// ======================================================
// servizio_esterno.dart (servizi/)
//
// Funzione del file:
// - Invia al backend i dati provenienti da fornitori esterni (es. sensori, API).
// - Specifica la fonte e i dati associati.
// - Autenticazione tramite JWT (header Authorization).
// - Aggiorna il saldo se l’invio è stato accettato (200 OK).
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

/// Servizio per comunicare al backend i dati esterni ricevuti da altre fonti.
class ServizioEsterno {
  /// Invia i [dati] raccolti da una certa [fonte] esterna.
  ///
  /// - Parametri:
  ///     → [fonte]: nome o codice del fornitore (es. "ARPA", "IoT-Tracker").
  ///     → [dati]: oggetto JSON con i valori rilevati.
  /// - Invia la richiesta con il token JWT dell’utente.
  /// - Se la risposta è 200, aggiorna il saldo CivicCoins e ritorna `true`.
  /// - Altrimenti ritorna `false`.
  static Future<bool> inviaDatiDaFornitori(String fonte, Map<String, dynamic> dati) async {
    final response = await http.post(
      Uri.parse('${Api.baseUrl}/monitoraggio/esterne'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${SistemaAutenticazione.utenteAttuale.token}', //Token JWT
      },
      body: jsonEncode({
        'email': SistemaAutenticazione.utenteAttuale.email,
        'fonte': fonte,
        'dati': dati,
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
