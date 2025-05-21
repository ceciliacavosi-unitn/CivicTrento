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
import '../config/api_endpoints.dart';

class StoricoService {
  /// Header comune per tutte le richieste
  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
      };

  /// Voto elettorale
  static Future<Map<String, dynamic>> getStoricoVoto({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse(voto),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _gestisciRispostaSingola(response, 'voti');
  }

  /// Bolletta (acqua, luce, gas)
  static Future<Map<String, dynamic>> getStoricoBolletta({
    required String email,
    required String password,
    String tipo = 'elettrica', // 👈 default per test
  }) async {
    final response = await http.post(
      Uri.parse(bolletta),
      headers: _headers,
      body: jsonEncode({
        'email': email,
        'password': password,
        'tipo': tipo, // 👈 essenziale!
      }),
    );
    return _gestisciRispostaSingola(response, 'bolletta');
  }

  /// Movimento monitorato (km a piedi/bici)
  static Future<Map<String, dynamic>> getStoricoMovimento({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse(movimento),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _gestisciRispostaSingola(response, 'movimento');
  }

  /// Abbonamento mezzi pubblici
  static Future<Map<String, dynamic>> getStoricoTrasporti({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse(trasporti),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _gestisciRispostaSingola(response, 'trasporti');
  }

  /// Multa ricevuta
  static Future<Map<String, dynamic>> getStoricoMulte({
    required String email,
    required String password,
    String gravita = 'medie', // default per test
  }) async {
    final response = await http.post(
      Uri.parse(multa),
      headers: _headers,
      body: jsonEncode({
        'email': email,
        'password': password,
        'gravita': gravita, // campo obbligatorio
      }),
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