// ======================================================
// 📄 cittadino_service.dart (servizi/)
//
// 📌 Funzione del file:
// - Gestisce tutte le richieste HTTP legate al cittadino:
//   ✅ Registrazione e login
//   ✅ Recupero e modifica dei dati civici
//
// 📦 Collegamento alla struttura del progetto:
// - Si trova in `servizi/`.
//
// ✅ Dipendenze dirette:
// - Pacchetto HTTP
// - Configurazione API
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_endpoints.dart';

class CittadinoService {
  // ======================================================
  // 🔐 POST /register - Registra un nuovo cittadino
  static Future<void> register({
    required String name,
    required String surname,
    required String email,
    required String password,
    required String fiscalCode,
    required String idCardNumber,
  }) async {
    final resp = await http.post(
      Uri.parse(registerUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'name': name.trim(),
        'surname': surname.trim(),
        'email': email.trim(),
        'password': password.trim(),
        'fiscal_code': fiscalCode.trim(),
        'id_card_number': idCardNumber.trim(),
      }),
    );
    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Registrazione fallita: $detail');
    }
  }

  // ======================================================
  // 🔐 POST /login - Effettua login
  static Future<void> login({
    required String email,
    required String password,
  }) async {
    final resp = await http.post(
      Uri.parse(loginUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );
    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Login fallito: $detail');
    }
  }

  // ======================================================
  // 🗂️ POST /cittadino/dati - Recupera dati civici
  static Future<Map<String, String>> fetchMyData({
    required String email,
    required String password,
  }) async {
    final resp = await http.post(
      Uri.parse(myDataUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );

    if (resp.statusCode == 200) {
      final data = json.decode(resp.body) as Map<String, dynamic>;
      return {
        'subscription_code': data['subscription_code'] as String? ?? '',
        'pod_code': data['pod_code'] as String? ?? '',
        'driver_license': data['driver_license'] as String? ?? '',
      };
    }

    // Caso speciale: dati non ancora presenti
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
  // 📝 POST /cittadino/inserisci_dati - Inserisce dati civici
  static Future<void> insertData({
    required String email,
    required String password,
    required String field,
    required String value,
  }) async {
    final resp = await http.post(
      Uri.parse(insertDataUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
        'field': field,
        'value': value,
      }),
    );
    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Inserimento dati fallito: $detail');
    }
  }


  // ======================================================
  // ✏️ PUT /cittadino/modifica_dati - Modifica dati civici
  static Future<void> modifyData({
    required String email,
    required String password,
    required String field,
    required String value,
  }) async {
    final resp = await http.put(
      Uri.parse(modifyDataUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
        'field': field,
        'value': value,
      }),
    );
    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Modifica dati fallita: $detail');
    }
  }


  // ======================================================
  // ❌ DELETE /cittadino/rimuovi_dato - Elimina un dato civico
  static Future<void> deleteData({
    required String email,
    required String password,
    required String field,
  }) async {
    final resp = await http.delete(
      Uri.parse(deleteDataUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
        'field': field,
        'value': '', 
      }),
    );

    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Eliminazione dati fallita: $detail');
    }
  }

  // 🧹 DELETE /cittadino/rimuovi_tutti - Elimina tutti i dati civici
  static Future<void> deleteAllData({
    required String email,
    required String password,
  }) async {
    final resp = await http.delete(
      Uri.parse(deleteAllDataUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );

    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Eliminazione completa dei dati fallita: $detail');
    }
  }

  // ======================================================
  // 🛠️ Funzione privata: parsing errori
  static String _parseError(String body) {
    try {
      final jsonBody = json.decode(body) as Map<String, dynamic>;
      return jsonBody['detail'] as String? ?? body;
    } catch (_) {
      return body;
    }
  }
}
