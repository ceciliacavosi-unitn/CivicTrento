import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_endpoints.dart';

class PremioService {
  /// 🔄 Carica i premi da backend (GET /premi)
  Future<List<Map<String, dynamic>>> caricaPremi() async {
    final uri = Uri.parse(premiUrl);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final List premi = jsonDecode(response.body);
      return premi.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Errore nel caricamento premi: ${response.statusCode}');
    }
  }

  /// ✅ Esegue una chiamata simulata per riscattare un premio
  Future<bool> riscattaPremio(String idPremio) async {
    final uri = Uri.parse('$riscattaPremioUrl/$idPremio');
    final response = await http.post(uri);
    return response.statusCode == 200;
  }
}

