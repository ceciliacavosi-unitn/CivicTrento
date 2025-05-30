// ======================================================
// storico_service.dart
//
// Funzione:
// - Recupera lo storico simulato inviando email e password nel body.
// - Funziona solo in fase di test, finché JWT non è implementato.
//
// Restituisce Map<String, dynamic> con chiavi come "nuovoSaldo", ecc.
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_endpoints.dart';

class StoricoService {
  /// Recupera il token JWT salvato localmente
  static Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Token JWT non trovato. Effettua il login.');
    return token;
  }

  /// Header con Authorization
  static Future<Map<String, String>> _authHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  /// Voto elettorale
  static Future<Map<String, dynamic>> getStoricoVoto() async {
    final headers = await _authHeaders();
    final response = await http.post(Uri.parse(voto), headers: headers);
    return _gestisciRispostaSingola(response, 'voti');
  }

  /// Bolletta (acqua, luce, gas)
  static Future<Map<String, dynamic>> getStoricoBolletta(String tipo) async {
    final headers = await _authHeaders();
    final response = await http.post(
      Uri.parse(bolletta),
      headers: headers,
      body: jsonEncode({'tipo': tipo}),
    );
    return _gestisciRispostaSingola(response, 'bolletta');
  }

  /// Movimento monitorato (km a piedi/bici)
  static Future<Map<String, dynamic>> getStoricoMovimento(double distanzaKm) async {
    final headers = await _authHeaders();
    final response = await http.post(
      Uri.parse(movimento),
      headers: headers,
      body: jsonEncode({'distanza_km': distanzaKm}),
    );
    return _gestisciRispostaSingola(response, 'movimento');
  }

  /// Abbonamento mezzi pubblici
  static Future<Map<String, dynamic>> getStoricoTrasporti() async {
    final headers = await _authHeaders();
    final response = await http.post(Uri.parse(trasporti), headers: headers);
    return _gestisciRispostaSingola(response, 'trasporti');
  }

  /// Multa ricevuta
  static Future<Map<String, dynamic>> getStoricoMulte(String gravita) async {
    final headers = await _authHeaders();
    final response = await http.post(
      Uri.parse(multa),
      headers: headers,
      body: jsonEncode({'gravita': gravita}),
    );
    return _gestisciRispostaSingola(response, 'multa');
  }

  /// Gestione risposta JSON generica
  static Map<String, dynamic> _gestisciRispostaSingola(http.Response response, String tipo) {
    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      if (json is Map<String, dynamic>) {
        return json;
      } else {
        throw Exception('La risposta per "$tipo" non è un oggetto JSON valido: ${response.body}');
      }
    } else {
      throw Exception('Errore nello storico $tipo: ${response.statusCode}\n${response.body}');
    }
  }
}
