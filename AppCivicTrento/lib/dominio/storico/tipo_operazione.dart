// ======================================================
// 📄 tipo_operazione.dart (dominio/storico/)
//
// 📌 Funzione del file:
// - Definisce l'enumerazione `TipoOperazione`, che classifica
//   le varie tipologie di operazioni registrate nello storico punti.
//
// ======================================================

/// 🔄 Enum che rappresenta le categorie di operazioni storiche.
///
/// Valori:
/// - ACQUISTO_PREMIO: quando viene riscattato un premio.
/// - MULTA: quando viene pagata una multa.
/// - BOLLETTA: pagamento di una bolletta.
/// - SPOSTAMENTO: registrazione di uno spostamento ecologico.
/// - VOTO: esercizio del diritto di voto.
/// - INVITO: invito di un altro cittadino all'app.
enum TipoOperazione {
  ACQUISTO_PREMIO,
  MULTA,
  BOLLETTA,
  SPOSTAMENTO,
  VOTO,
  INVITO,
}
