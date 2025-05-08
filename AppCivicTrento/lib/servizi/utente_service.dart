// ======================================================
// 📄 utente_service.dart (servizi/)
//
// 📌 Funzione del file:
// - Gestisce i dati anagrafici del profilo utente.
// - Permette di registrare un nuovo utente.
//
// 📦 Collegamento alla struttura del progetto:
// - Si trova in `servizi/`.
// - Usato nelle schermate Impostazioni, Profilo e Registrazione.
//
// ✅ Dipendenze dirette:
// - Pacchetto HTTP
// - Configurazione API
//
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_endpoints.dart';

class UtenteService {
  // ======================================================
  // 📝 POST /auth/register - Registra un nuovo utente
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
