// ======================================================
// 📄 multe.dart (dominio/storico/)
//
// 📌 Funzione del file:
// - Definisce la classe `Multa`, che rappresenta una multa registrata
//   nello storico dell'app CivicCoins.
//
// ======================================================

/// 🚔 Modello dati per una Multa.
///
/// Campi principali:
/// - [id]: identificativo univoco.
/// - [descrizione]: motivo o tipo della multa.
/// - [data]: data della contravvenzione o del pagamento.
/// - [importo]: importo totale della multa.
/// - [puntiAccumulati]: punti assegnati per il pagamento.
class Multa {
  final String id;
  final String descrizione;
  final DateTime data;
  final double importo;
  final int puntiAccumulati;

  Multa({
    required this.id,
    required this.descrizione,
    required this.data,
    required this.importo,
    required this.puntiAccumulati,
  });
}
