import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

class ServizioTrasporti {
  static Future<bool> registraAbbonamento() async {
    final response = await http.post(
      Uri.parse('${Api.baseUrl}/monitoraggio/trasporti'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': SistemaAutenticazione.utenteAttuale.email}),
    );
    if (response.statusCode == 200) {
      SistemaAutenticazione.aggiornaSaldo(jsonDecode(response.body)['nuovoSaldo']);
      return true;
    }
    return false;
  }
}

