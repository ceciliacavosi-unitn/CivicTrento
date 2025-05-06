// ======================================================
// 📄 bollette.dart (dominio/storico/)
//
// 📌 Funzione del file:
// - Definisce il modello `Bolletta`, che rappresenta i dettagli
//   di una bolletta registrata nello storico dell'app CivicCoins.
//
// ======================================================

/// 💡 Modello dati per una Bolletta.
///
/// - [id]: identificativo univoco.
/// - [descrizione]: descrizione sintetica della bolletta.
/// - [dataPagamento]: data di pagamento.
/// - [importo]: importo totale.
/// - [puntiAccumulati]: punti assegnati per il pagamento.
class Bolletta {
  final String id;
  final String descrizione;
  final DateTime dataPagamento;
  final double importo;
  final int puntiAccumulati;

  Bolletta({
    required this.id,
    required this.descrizione,
    required this.dataPagamento,
    required this.importo,
    required this.puntiAccumulati,
  });
}
