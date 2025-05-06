// ======================================================
// 📄 storico_multe_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Mostra la lista delle multe pagate nello storico.
// - Attualmente è un ESEMPIO BASE che andrà esteso.
//
// ======================================================

import 'package:flutter/material.dart';
import '../widget/storico_elemento.dart';

/// 🚔 Schermata che mostra lo storico delle multe.
///
/// 👉 Esempio base. Da estendere per mostrare dati dinamici.
class StoricoMulteScreen extends StatelessWidget {
  const StoricoMulteScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ElementoStorico(
      title: 'Pagamento multa divieto di sosta',
      subtitle: '12/02/2025 15:30',
      points: '+2',
    );
  }
}
