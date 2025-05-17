import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

class ServizioBollette {
  static Future<bool> registraBolletta(String tipo) async {
    final response = await http.post(
      Uri.parse('${Api.baseUrl}/monitoraggio/bolletta'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': SistemaAutenticazione.utenteAttuale.email,
        'tipo': tipo
      }),
    );
    if (response.statusCode == 200) {
      SistemaAutenticazione.aggiornaSaldo(jsonDecode(response.body)['nuovoSaldo']);
      return true;
    }
    return false;
  }
}

