// ======================================================
// premio_service.dart (servizi/)
//
// Funzione del file:
// - Gestisce le richieste HTTP relative ai premi.
// - Fornisce metodi per caricare e riscattare premi.
//
// Debug integrato a livello logico:
// - Caricamento dati da API e gestione errori.
// - Simulazione del riscatto premio.
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_endpoints.dart';

class PremioService {
  /// Carica i premi da backend (GET /premi)
  ///
  /// Ritorna una lista di mappe contenenti i dati dei premi.
  /// Richiede JWT nel header Authorization.
  Future<List<Map<String, dynamic>>> caricaPremi() async {
    final token = await _getToken();
    final uri = Uri.parse(premiUrl);

    final response = await http.get(
      uri,
      headers: _authHeaders(token),
    );

    if (response.statusCode == 200) {
      final List premi = jsonDecode(response.body);
      return premi.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Errore nel caricamento premi: ${response.statusCode}');
    }
  }

  /// Riscatta un premio (POST /premi/riscatta/:id)
  ///
  /// Invia una richiesta POST per riscattare il premio con l'ID specificato.
  /// Richiede JWT nel header Authorization.
  Future<bool> riscattaPremio(String idPremio) async {
    final token = await _getToken();
    final uri = Uri.parse('$riscattaPremioUrl/$idPremio');

    final response = await http.post(
      uri,
      headers: _authHeaders(token),
    );

    return response.statusCode == 200;
  }

  // ======================================================
  // Helpers privati per token
  static Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Token non trovato. Effettua il login.');
    return token;
  }

  static Map<String, String> _authHeaders(String token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }
}
