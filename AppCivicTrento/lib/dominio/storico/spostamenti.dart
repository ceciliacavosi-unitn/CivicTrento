// ======================================================
// spostamenti.dart (dominio/storico/)
//
// Funzione del file:
// - Definisce la classe `Spostamento`, che rappresenta un
//   movimento registrato nello storico dell'app CivicCoins.
//
// ======================================================

/// Modello dati per uno Spostamento.
///
/// Campi principali:
/// - [id]: identificativo univoco.
/// - [percorso]: descrizione del tragitto (es. "Casa → Lavoro").
/// - [data]: data in cui è avvenuto lo spostamento.
/// - [modalita]: modalità del trasporto (es. bici, a piedi, ecc.).
/// - [distanzaKm]: distanza percorsa in chilometri.
/// - [puntiAccumulati]: punti assegnati per lo spostamento.
class Spostamento {
  final String id;
  final String percorso;
  final DateTime data;
  final String modalita; // Hey! Potresti creare un TipoSpostamento enum se diventa strutturato.
  final double distanzaKm;
  final int puntiAccumulati;

  Spostamento({
    required this.id,
    required this.percorso,
    required this.data,
    required this.modalita,
    required this.distanzaKm,
    required this.puntiAccumulati,
  });
}
