import 'premio.dart';

class DetrazioneFiscale extends Premio {
  final String tipoTassa; // Esempio: "TARI", "IMU"
  final double valoreDetrazione; // Esempio: 50.0 euro

  DetrazioneFiscale({
    required super.id,
    required super.nome,
    required super.descrizione,
    required super.costoCivicCoins,
    required this.tipoTassa,
    required this.valoreDetrazione,
  });
}

