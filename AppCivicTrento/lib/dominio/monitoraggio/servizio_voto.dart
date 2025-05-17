//non so se volete farlo -> perchè ce ne stavamo dimenticando 

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/api_endpoints.dart';
import '../gestione/sistema_autenticazione.dart';

class ServizioVoto {
  static Future<bool> registraVoto() async {
    final response = await http.post(
      Uri.parse('${Api.baseUrl}/monitoraggio/voto'),
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
