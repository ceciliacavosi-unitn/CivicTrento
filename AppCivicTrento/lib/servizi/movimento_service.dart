import 'package:health/health.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_endpoints.dart';  // <-- se usi gli endpoint centralizzati

class ServizioMovimento {
  static final _health = HealthFactory();

  static Future<double> leggiKmPercorsiOggi() async {
    final types = [HealthDataType.DISTANCE_DELTA];

    final isAuthorized = await _health.requestAuthorization(types);
    if (!isAuthorized) return 0;

    final now = DateTime.now();
    final start = DateTime(now.year, now.month, now.day); // inizio giornata

    final data = await _health.getHealthDataFromTypes(start, now, types);
    double metriTotali = data.fold(0.0, (sum, point) => sum + (point.value.toDouble()));
    return metriTotali / 1000.0; // metri → km
  }

  static Future<void> inviaDatiMovimento(String email, double km) async {
    final response = await http.post(
      Uri.parse(APIEndpoint.movimento),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'kmPercorsi': km,
        'data': DateTime.now().toIso8601String().split("T")[0]
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Errore nell’invio dei dati di movimento');
    }
  }
}
