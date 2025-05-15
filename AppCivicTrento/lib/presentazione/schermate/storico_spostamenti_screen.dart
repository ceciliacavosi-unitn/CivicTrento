// ======================================================
// storico_spostamenti_screen.dart (presentazione/schermate/)
//
// Funzione del file:
// - Mostra la lista degli spostamenti registrati nello storico.
// - Attualmente è un ESEMPIO BASE che andrà esteso.
//
// ======================================================

import 'package:flutter/material.dart';
import '../widget/storico_elemento.dart';

///  Schermata che mostra lo storico degli spostamenti.
///
/// Esempio base. Da estendere per mostrare dati dinamici.
class StoricoSpostamentiScreen extends StatelessWidget {
  const StoricoSpostamentiScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ElementoStorico(
      title: 'Percorso casa → lavoro in bici',
      subtitle: '05/04/2025 08:15',
      points: '+5',
    );
  }
}
