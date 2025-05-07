// ======================================================
// 📄 storico_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Schermata generale dello Storico, che permette di accedere
//   ai tre storici specifici:
//   1️⃣ Storico Bollette
//   2️⃣ Storico Multe
//   3️⃣ Storico Spostamenti
//
// 📦 Collegamento alla struttura del progetto:
// - Si trova nella cartella `presentazione/schermate/`.
// - Collega le tre schermate specifiche dello storico già esistenti:
//   - storico_bollette_screen.dart
//   - storico_multe_screen.dart
//   - storico_spostamenti_screen.dart
//
// ✅ Dipendenze dirette:
// - Flutter Material (per UI e navigazione).
// - Le tre schermate storico specifiche.
//
// ======================================================

import 'package:flutter/material.dart';
import 'storico_bollette_screen.dart';
import 'storico_multe_screen.dart';
import 'storico_spostamenti_screen.dart';

/// 🗂️ Schermata principale dello Storico.
///
/// 🔑 Responsabilità:
/// - Mostrare un'interfaccia semplice che permette agli utenti
///   di navigare verso:
///     ✅ Storico Bollette
///     ✅ Storico Multe
///     ✅ Storico Spostamenti
///
/// 🛠️ Dettagli implementativi:
/// - Utilizza un'app bar con titolo 'Storico'.
/// - Ogni voce di storico è rappresentata da un pulsante grande
///   e ben visibile, che porta alla rispettiva schermata.
/// - Il layout è una semplice colonna verticale con padding uniforme.
///
/// 👉 Miglioramenti futuri possibili:
/// - Integrare una TabBar per migliorare l'esperienza utente.
/// - Visualizzare una panoramica combinata di tutte le operazioni
///   recenti direttamente in questa schermata.
///
class StoricoScreen extends StatelessWidget {
  const StoricoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Barra superiore con il titolo della pagina
      appBar: AppBar(
        title: const Text('Storico'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        // Colonna che contiene i pulsanti per ogni storico
        child: Column(
          children: [
            // 🔗 Pulsante: Storico Bollette
            _buildStoricoButton(
              context,
              label: 'Storico Bollette',
              destinazione: const StoricoBolletteScreen(),
            ),
            const SizedBox(height: 16), // Spaziatura tra i pulsanti

            // 🔗 Pulsante: Storico Multe
            _buildStoricoButton(
              context,
              label: 'Storico Multe',
              destinazione: const StoricoMulteScreen(),
            ),
            const SizedBox(height: 16),

            // 🔗 Pulsante: Storico Spostamenti
            _buildStoricoButton(
              context,
              label: 'Storico Spostamenti',
              destinazione: const StoricoSpostamentiScreen(),
            ),
          ],
        ),
      ),
    );
  }

  /// 🔘 Costruisce un pulsante per accedere a una schermata dello storico.
  ///
  /// Parametri:
  /// - [context]: contesto di build.
  /// - [label]: testo visualizzato sul pulsante.
  /// - [destinazione]: widget di destinazione da aprire al click.
  ///
  /// 👉 Al click esegue un push sulla pila di Navigator,
  ///    portando l'utente alla schermata desiderata.
  Widget _buildStoricoButton(BuildContext context,
      {required String label, required Widget destinazione}) {
    return SizedBox(
      width: double.infinity, // Occupa tutta la larghezza disponibile
      child: ElevatedButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => destinazione),
          );
        },
        child: Text(label),
      ),
    );
  }
}
