// ======================================================
// 📄 premio_service.dart (servizi/)
//
// 📌 Funzione del file:
// - Gestisce le richieste HTTP relative ai premi.
// - Fornisce metodi per caricare e riscattare premi.
//
// ✅ Debug integrato a livello logico:
// - Caricamento dati da API e gestione errori.
// - Simulazione del riscatto premio.
// ======================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_endpoints.dart';

class PremioService {
  /// 🔄 Carica i premi da backend (GET /premi)
  ///
  /// Ritorna una lista di mappe contenenti i dati dei premi.
  /// Se la risposta è valida (statusCode 200), effettua il parsing JSON.
  /// In caso contrario, lancia un'eccezione con il codice errore.
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

  /// ✅ Simula il riscatto di un premio (POST /premi/:id)
  ///
  /// Invia una richiesta POST all'endpoint per riscattare il premio con l'ID specificato.
  /// Ritorna true se lo statusCode è 200 (successo), altrimenti false.
  Future<bool> riscattaPremio(String idPremio) async {
    final uri = Uri.parse('$riscattaPremioUrl/$idPremio');
    final response = await http.post(uri);
    return response.statusCode == 200;
  }
}
