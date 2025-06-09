import 'package:health/health.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_endpoints.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ServizioMovimento {
  static final _health = HealthFactory();

  static Future<double> leggiKmPercorsiOggi() async {
    final status = await Permission.activityRecognition.request();
    if (!status.isGranted) {
      print("Permesso ACTIVITY_RECOGNITION negato");
      return 0;
    }

    final types = [HealthDataType.DISTANCE_WALKING_RUNNING];

    final isAuthorized = await _health.requestAuthorization(types);
    if (!isAuthorized) return 0;

    final now = DateTime.now();
    final start = DateTime(now.year, now.month, now.day);

    final data = await _health.getHealthDataFromTypes(start, now, types);
    double metriTotali = data.fold(0.0, (sum, point) {
      if (point.value is num) {
        return sum + (point.value as num).toDouble();
      } else {
        return sum;
      }
    });

    return metriTotali / 1000.0;
  }

  static Future<void> inviaDatiMovimento(double km) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final email = prefs.getString('email');
    if (token == null || email == null) throw Exception('Token o email mancanti');

    final response = await http.post(
      Uri.parse(movimento),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token'
      },
      body: jsonEncode({
        'email': email,
        'distanza_km': km
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Errore nell’invio dei dati di movimento');
    }
  }
}
