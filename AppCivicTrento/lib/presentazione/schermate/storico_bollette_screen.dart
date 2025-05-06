// ======================================================
// 📄 storico_bollette_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Mostra la lista delle bollette pagate nello storico.
// - Attualmente è un ESEMPIO BASE che andrà esteso per visualizzare
//   più elementi dinamicamente.
//
// ======================================================

import 'package:flutter/material.dart';
import '../widget/storico_elemento.dart'; 

/// 🧾 Schermata che mostra lo storico delle bollette.
///
/// 👉 Al momento è solo un esempio base. Da estendere per:
/// - Ciclo su una lista di `Bolletta` (modello dati)
/// - Recupero dinamico da servizio o database
///
class StoricoBolletteScreen extends StatelessWidget {
  const StoricoBolletteScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ElementoStorico(
      title: 'Pagamento bolletta elettrica marzo',
      subtitle: '27/03/2025 09:00',
      points: '+3',
    );
  }
}
