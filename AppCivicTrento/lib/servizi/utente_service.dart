// ======================================================
//  utente_service.dart (servizi/)
//
//  Funzione del file:
// - Gestisce i dati anagrafici del profilo utente.
// - Permette di registrare un nuovo utente.
//
//  Collegamento alla struttura del progetto:
// - Si trova in `servizi/`.
// - Usato nelle schermate Impostazioni, Profilo e Registrazione.
//
//  Dipendenze dirette:
// - Pacchetto HTTP
// - Configurazione API
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_endpoints.dart';

class UtenteService {

  // ======================================================
  //  POST /utente/profilo - Recupera profilo utente
  static Future<Map<String, String>> fetchProfile({
    required String email,
    required String password,
  }) async {
    final resp = await http.post(
      Uri.parse(myAccountUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );
    if (resp.statusCode == 200) {
      final data = json.decode(resp.body) as Map<String, dynamic>;
      return {
        'nome': data['nome'] as String? ?? '',
        'cognome': data['cognome'] as String? ?? '',
        'email': data['email'] as String? ?? '',
        'password':data['password'] as String? ?? '',
        'CF': data['CF'] as String? ?? '',
        'cartaID': data['cartaID'] as String? ?? '',
      };
    }
    final detail = _parseError(resp.body);
    throw Exception('Errore nel recupero profilo: $detail');
  }

  // ======================================================
  //  PUT /utente/modifica_profilo - Modifica profilo utente
  static Future<void> modifyProfile({
    required String email,
    required String password,
    required String field,
    required String newValue,
  }) async {
    final resp = await http.put(
      Uri.parse(modifyProfileUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
        'field': field,
        'new_value': newValue.trim(),
      }),
    );
    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Modifica profilo fallita: $detail');
    }
  }

  // ======================================================
  //  Funzione privata: parsing errori dal server
  static String _parseError(String body) {
    try {
      final jsonBody = json.decode(body) as Map<String, dynamic>;
      return jsonBody['detail'] as String? ?? body;
    } catch (_) {
      return body;
    }
  }
}