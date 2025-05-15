import 'dart:convert';
import 'package:http/http.dart' as http;
import 'gravita_multa.dart';
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

class ServizioMulte {
  static Future<bool> registraMulta(String gravita) async {
    final response = await http.post(
      Uri.parse('${Api.baseUrl}/monitoraggio/multa'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': SistemaAutenticazione.utenteAttuale.email,
        'gravita': gravita
      }),
    );
    if (response.statusCode == 200) {
      SistemaAutenticazione.aggiornaSaldo(jsonDecode(response.body)['nuovoSaldo']);
      return true;
    }
    return false;
  }
}

