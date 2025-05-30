// ======================================================
//  cittadino_service.dart (servizi/)
//
//  Funzione del file:
// - Gestisce tutte le richieste HTTP legate al cittadino:
//   Registrazione e login
//   Recupero e modifica dei dati civici
//
//  Collegamento alla struttura del progetto:
// - Si trova in `servizi/`.
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

class CittadinoService {
  // ======================================================
  // Recupera i dati civici dell'utente autenticato
  static Future<Map<String, String>> fetchMyData() async {
    final token = await _getToken();

    final resp = await http.post(
      Uri.parse(myDataUrl),
      headers: _authHeaders(token),
    );

    if (resp.statusCode == 200) {
      final data = json.decode(resp.body) as Map<String, dynamic>;
      return {
        'subscription_code': data['subscription_code'] ?? '',
        'pod_code': data['pod_code'] ?? '',
        'driver_license': data['driver_license'] ?? '',
      };
    }

    if (resp.statusCode == 404 || resp.body.contains('Dati utente non trovati')) {
      return {
        'subscription_code': '',
        'pod_code': '',
        'driver_license': '',
      };
    }

    final detail = _parseError(resp.body);
    throw Exception('Errore nel recupero dati civici: $detail');
  }

  // ======================================================
  // Aggiunge un nuovo dato civico
  static Future<void> insertData({
    required String field,
    required String value,
  }) async {
    final token = await _getToken();

    final resp = await http.post(
      Uri.parse(insertDataUrl),
      headers: _authHeaders(token),
      body: json.encode({'field': field, 'value': value}),
    );

    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Inserimento dati fallito: $detail');
    }
  }

  // ======================================================
  // Modifica un dato civico esistente
  static Future<void> modifyData({
    required String field,
    required String value,
  }) async {
    final token = await _getToken();

    final resp = await http.put(
      Uri.parse(modifyDataUrl),
      headers: _authHeaders(token),
      body: json.encode({'field': field, 'value': value}),
    );

    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Modifica dati fallita: $detail');
    }
  }

  // ======================================================
  // Rimuove un singolo dato civico
  static Future<void> deleteData({
    required String field,
  }) async {
    final token = await _getToken();

    final resp = await http.delete(
      Uri.parse(deleteDataUrl),
      headers: _authHeaders(token),
      body: json.encode({'field': field}),
    );

    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Eliminazione dato fallita: $detail');
    }
  }

  // ======================================================
  // Rimuove tutti i dati civici
  static Future<void> deleteAllData() async {
    final token = await _getToken();

    final resp = await http.delete(
      Uri.parse(deleteAllDataUrl),
      headers: _authHeaders(token),
    );

    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Eliminazione completa fallita: $detail');
    }
  }

  // ======================================================
  // Funzioni di utilità privata
  static Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Token non trovato, effettua il login');
    return token;
  }

  static Map<String, String> _authHeaders(String token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  static String _parseError(String body) {
    try {
      final jsonBody = json.decode(body) as Map<String, dynamic>;
      return jsonBody['detail'] ?? body;
    } catch (_) {
      return body;
    }
  }
}
