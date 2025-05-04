// ======================================================
// 📄 premio.dart (dominio/premi/)
//
// 📌 Funzione del file:
// - Definisce la classe `Premio`, che rappresenta un premio riscattabile
//   nel dominio dell'app CivicCoins.
//
// 📦 Collegamento alla struttura del progetto:
// - Collocato nella cartella `dominio/premi/`, è il modello base di dati
//   che viene usato dai servizi e dalla UI per gestire e visualizzare i premi.
//
// ======================================================

import 'tipo_premio.dart';

/// 🏆 Modello dati che rappresenta un Premio.
///
/// ✅ Campi principali:
/// - [id]: identificativo univoco del premio.
/// - [titolo]: nome o descrizione breve del premio.
/// - [descrizione]: dettagli aggiuntivi (facoltativo).
/// - [tipo]: tipo di premio (vedi `TipoPremio` in enums.dart).
/// - [validoFino]: data di scadenza (facoltativo).
/// - [valore]: valore numerico (es. sconto in euro, punti richiesti).
///
class Premio {
  final String id;
  final String titolo;
  final String? descrizione;
  final TipoPremio tipo;
  final DateTime? validoFino;
  final double? valore;

  Premio({
    required this.id,
    required this.titolo,
    this.descrizione,
    required this.tipo,
    this.validoFino,
    this.valore,
  });

  /// 🔄 Factory per creare un Premio da una mappa JSON.
  factory Premio.fromJson(Map<String, dynamic> json) {
    return Premio(
      id: json['id'],
      titolo: json['titolo'],
      descrizione: json['descrizione'],
      tipo: TipoPremio.values.firstWhere(
        (e) => e.toString() == 'TipoPremio.${json['tipo']}',
      ),
      validoFino: json['validoFino'] != null ? DateTime.parse(json['validoFino']) : null,
      valore: (json['valore'] as num?)?.toDouble(),
    );
  }

  /// 📝 Converte il Premio in una mappa JSON.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titolo': titolo,
      'descrizione': descrizione,
      'tipo': tipo.name,
      'validoFino': validoFino?.toIso8601String(),
      'valore': valore,
    };
  }
}
