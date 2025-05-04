// ======================================================
// 📄 auth_service.dart (servizi/)
//
// 📌 Funzione del file:
// - Gestisce tutte le richieste HTTP di autenticazione:
//   ✅ Registrazione
//   ✅ Login
//   ✅ Logout (se previsto)
//
// 📦 Collegamento alla struttura del progetto:
// - Si trova in `servizi/`.
// - Utilizzato da tutte le schermate di login/registrazione.
//
// ✅ Dipendenze dirette:
// - Pacchetto HTTP
// - Configurazione API
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_endpoints.dart';

class AuthService {
  // ======================================================
  // 🔐 POST /register
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
  // 🔐 POST /login
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
  // 🔐 POST /logout (opzionale)
  static Future<void> logout({
    required String token,
  }) async {
    final resp = await http.post(
      Uri.parse(logoutUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Logout fallito: $detail');
    }
  }

  // ======================================================
  // 🛠️ Funzione privata: parsing errori dal server
  static String _parseError(String body) {
    try {
      final jsonBody = json.decode(body) as Map<String, dynamic>;
      return jsonBody['detail'] as String? ?? body;
    } catch (_) {
      return body;
    }
  }
}
