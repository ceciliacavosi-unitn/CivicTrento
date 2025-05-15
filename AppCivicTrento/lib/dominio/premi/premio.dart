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
/// - [nome]: nome o descrizione breve del premio.
/// - [descrizione]: dettagli aggiuntivi (facoltativo).
/// - [costoCivicCoins]: costo in CivicCoins.
///
class Premio {
  final String id;
  final String nome;
  final String? descrizione;
  final double costoCivicCoins;

  Premio({
    required this.id,
    required this.nome,
    this.descrizione,
    required this.costoCivicCoins,
  });

 

  /// 🔄 Factory per creare un Premio da una mappa JSON.
  factory Premio.fromJson(Map<String, dynamic> json) {
    return Premio(
      id: json['id'],
      nome: json['nome'],
      descrizione: json['descrizione'],
      costoCivicCoins: json['costoCivicCoins'],
    );
  }

  /// 📝 Converte il Premio in una mappa JSON.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nome': nome,
      'descrizione': descrizione,
      'costoCivicCoins': costoCivicCoins,
    };
  }
}
