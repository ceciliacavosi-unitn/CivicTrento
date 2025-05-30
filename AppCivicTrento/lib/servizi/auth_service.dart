// ======================================================
//  auth_service.dart (servizi/)
//
//  Funzione del file:
// - Gestisce tutte le richieste HTTP di autenticazione:
//   Registrazione
//   Login
//   Cancellazione account
//
//  Collegamento alla struttura del progetto:
// - Si trova in `servizi/`.
// - Utilizzato da tutte le schermate di login/registrazione.
//
//  Dipendenze dirette:
// - Pacchetto HTTP
// - Configurazione API
//
// ======================================================

import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../config/api_endpoints.dart';
import '../dominio/gestione/sistema_autenticazione.dart';

class AuthService {
  // ======================================================
  //  POST /register
  static Future<void> register({
    required String name,
    required String surname,
    required String email,
    required String password,
    required String fiscalCode,
    required String idCardNumber,
    required bool gdprConsent,
  }) async {
    final resp = await http.post(
      Uri.parse(registerUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'nome': name.trim(),
        'cognome': surname.trim(),
        'email': email.trim(),
        'password': password.trim(),
        'CF': fiscalCode.trim(),
        'cartaID': idCardNumber.trim(),
        'gdprConsent': gdprConsent,
      }),
    );
    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Registrazione fallita: $detail');
    }
  }

  // ======================================================
  //  POST /login
  static Future<void> login({
    required String email,
    required String password,
  }) async {
    print('📤 Login in corso con email: $email');

    final resp = await http.post(
      Uri.parse(loginUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );

    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Login fallito: $detail');
    }

    final jsonBody = json.decode(resp.body);
    final token = jsonBody['token'];

    if (token == null) {
      throw Exception('Token non presente nella risposta del server');
    }

    // Salva il token localmente
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);

    // Salva tutto il contesto di login (in memoria RAM)
    SistemaAutenticazione.login(email, password, token);

    print('✅ Login riuscito. Token JWT salvato.');
  }

  // ======================================================
  //  DELETE /delete_user
  static Future<void> deleteAccount({
    required String email,
    required String password,
  }) async {
    final resp = await http.delete(
      Uri.parse(deleteUserUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );
    if (resp.statusCode != 200) {
      final detail = _parseError(resp.body);
      throw Exception('Cancellazione fallita: $detail');
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
