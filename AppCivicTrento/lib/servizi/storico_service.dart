// ======================================================
// storico_service.dart
//
// Funzione:
// - Recupera lo storico da backend inviando l'email dell'utente.
// - Usa il token JWT per autenticarsi.
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

  /// Recupera l'email salvata localmente
  static Future<String> _getEmail() async {
    final prefs = await SharedPreferences.getInstance();
    final email = prefs.getString('email');
    if (email == null) throw Exception('Email utente non trovata. Effettua il login.');
    return email;
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
    final email = await _getEmail();
    final response = await http.post(
      Uri.parse(voto),
      headers: headers,
      body: jsonEncode({'email': email}),
    );
    return _gestisciRispostaSingola(response, 'voti');
  }

  /// Bolletta (acqua, luce, gas)
  static Future<Map<String, dynamic>> getStoricoBolletta(String tipo) async {
    final headers = await _authHeaders();
    final email = await _getEmail();
    final response = await http.post(
      Uri.parse(bolletta),
      headers: headers,
      body: jsonEncode({'email': email, 'tipo': tipo}),
    );
    return _gestisciRispostaSingola(response, 'bolletta');
  }

  /// Movimento monitorato (km a piedi/bici)
  static Future<Map<String, dynamic>> getStoricoMovimento(double distanzaKm) async {
    final headers = await _authHeaders();
    final email = await _getEmail();
    final response = await http.post(
      Uri.parse(movimento),
      headers: headers,
      body: jsonEncode({'email': email, 'distanza_km': distanzaKm}),
    );
    return _gestisciRispostaSingola(response, 'movimento');
  }
  static Future<List<Map<String, dynamic>>> getTuttiSpostamenti() async {
    final response = await http.get(Uri.parse('$baseUrl/cittadino/storico/movimento'));
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data);
    } else {
      throw Exception('Errore caricamento spostamenti');
    }
  }


  /// Abbonamento mezzi pubblici
  static Future<Map<String, dynamic>> getStoricoTrasporti() async {
    final headers = await _authHeaders();
    final email = await _getEmail();
    final response = await http.post(
      Uri.parse(trasporti),
      headers: headers,
      body: jsonEncode({'email': email}),
    );
    return _gestisciRispostaSingola(response, 'trasporti');
  }

  /// Multa ricevuta
  static Future<Map<String, dynamic>> getStoricoMulte(String gravita) async {
    final headers = await _authHeaders();
    final email = await _getEmail();
    final response = await http.post(
      Uri.parse(multa),
      headers: headers,
      body: jsonEncode({'email': email, 'gravita': gravita}),
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
