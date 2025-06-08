import 'package:health/health.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_endpoints.dart';  // <-- se usi gli endpoint centralizzati
import 'package:permission_handler/permission_handler.dart';


class ServizioMovimento {
  static final _health = HealthFactory();

  static Future<double> leggiKmPercorsiOggi() async {
    //richiesta permesso ACTIVITY_RECOGNITION per Android
    final status = await Permission.activityRecognition.request();
    if (!status.isGranted) {
      print("Permesso ACTIVITY_RECOGNITION negato");
      return 0;
    }
    
    final types = [HealthDataType.DISTANCE_DELTA];

    final isAuthorized = await _health.requestAuthorization(types);
    if (!isAuthorized) return 0;

    final now = DateTime.now();
    final start = DateTime(now.year, now.month, now.day); // inizio giornata

    final data = await _health.getHealthDataFromTypes(start, now, types);
    double metriTotali = data.fold(0.0, (sum, point) {
      if (point.value is num) {
        return sum + (point.value as num).toDouble();
      } else {
        return sum;
      }
    });

    return metriTotali / 1000.0; // metri → km
  }

static Future<void> inviaDatiMovimento(double km) async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('jwt_token');
  if (token == null) throw Exception('Token mancante, effettua login');

  int punti;
  if (km < 1) {
    punti = 0;
  } else if (km < 3) {
    punti = 1;
  } else if (km < 5) {
    punti = 2;
  } else if (km < 10) {
    punti = 3;
  } else {
    punti = 5;
  }

  final response = await http.post(
    Uri.parse(movimento),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token'
    },
    body: jsonEncode({
      'kmPercorsi': km,
      'data': DateTime.now().toIso8601String()
    }),
  );

  if (response.statusCode != 200) {
    throw Exception('Errore nell’invio dei dati di movimento');
  }
}


}