// ======================================================
// 📄 storico_operazione.dart (dominio/storico/)
//
// 📌 Funzione del file:
// - Definisce la classe `StoricoOperazione`, che rappresenta
//   un'operazione registrata nello storico punti CivicCoins.
//
// ======================================================

import 'tipo_operazione.dart'; 

/// 📝 Modello dati per un'operazione dello storico.
///
/// Campi:
/// - [data]: data dell'operazione.
/// - [tipo]: tipo di operazione (es. premio riscattato, multa pagata).
/// - [puntiVariati]: quanti punti sono stati aggiunti o sottratti.
/// - [_descrizione]: descrizione privata (può essere usata per dettagli aggiuntivi).
///
class StoricoOperazione {
  final DateTime data;
  final TipoOperazione tipo;
  final int puntiVariati;
  final String _descrizione; // campo privato

  StoricoOperazione({
    required this.data,
    required this.tipo,
    required this.puntiVariati,
    required String descrizione,
  }) : _descrizione = descrizione;

  /// 🔎 Metodo pubblico per ottenere il tipo di operazione.
  TipoOperazione getTipoOperazione() {
    return tipo;
  }

  /// (Opzionale) Metodo getter per leggere la descrizione in modo sicuro.
  String get descrizione => _descrizione;
}
