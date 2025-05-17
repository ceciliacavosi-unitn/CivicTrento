import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

class ServizioEsterne {
  static Future<bool> inviaDatiDaFornitori(String fonte, Map<String, dynamic> dati) async {
    final response = await http.post(
      Uri.parse('${Api.baseUrl}/monitoraggio/esterne'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': SistemaAutenticazione.utenteAttuale.email,
        'fonte': fonte,
        'dati': dati,
      }),
    );

    if (response.statusCode == 200) {
      final nuovoSaldo = jsonDecode(response.body)['nuovoSaldo'];
      SistemaAutenticazione.aggiornaSaldo(nuovoSaldo);
      return true;
    }
    return false;
  }
}
