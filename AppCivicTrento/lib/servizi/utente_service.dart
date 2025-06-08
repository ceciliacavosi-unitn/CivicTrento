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
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_endpoints.dart';

class UtenteService {
  // Recupera il token JWT salvato localmente
  static Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Token JWT non trovato. Effettua il login.');
    return token;
  }

  // Header con Authorization
  static Future<Map<String, String>> _authHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // ======================================================
  //  POST /utente/profilo - Recupera profilo utente
  static Future<Map<String, dynamic>> fetchProfile() async {
    final resp = await http.post(
      Uri.parse(myAccountUrl),
      headers: await _authHeaders(),
    );

    if (resp.statusCode == 200) {
      final data = json.decode(resp.body) as Map<String, dynamic>;

      return {
        'nome': data['nome'] ?? '',
        'cognome': data['cognome'] ?? '',
        'email': data['email'] ?? '',
        'password': data['password'] ?? '',
        'CF': data['CF'] ?? '',
        'cartaID': data['cartaID'] ?? '',
        'saldo': data['saldo'] ?? 0,
        'punti': data['punti'] ?? 0,
      };
    }

    final detail = _parseError(resp.body);
    throw Exception('Errore nel recupero profilo: $detail');
  }

  

  // ======================================================
  //  PUT /utente/modifica_profilo - Modifica profilo utente
  static Future<void> modifyProfile({
    required String field,
    required String newValue,
  }) async {
    final resp = await http.put(
      Uri.parse(modifyProfileUrl),
      headers: await _authHeaders(),
      body: json.encode({
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
  //  Parsing errori dal server
  static String _parseError(String body) {
    try {
      final jsonBody = json.decode(body) as Map<String, dynamic>;
      return jsonBody['detail'] as String? ?? body;
    } catch (_) {
      return body;
    }
  }
}
