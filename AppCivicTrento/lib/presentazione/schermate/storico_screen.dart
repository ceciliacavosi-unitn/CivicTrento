// ======================================================
//  storico_screen.dart (presentazione/schermate/)
//
// Funzione del file:
// - Schermata generale dello Storico, che permette di accedere
//   ai tre storici specifici:
//   Storico Bollette
//   Storico Multe
//   Storico Spostamenti
//
//  Collegamento alla struttura del progetto:
// - Si trova nella cartella `presentazione/schermate/`.
// - Collega le tre schermate specifiche dello storico già esistenti:
//   - storico_bollette_screen.dart
//   - storico_multe_screen.dart
//   - storico_spostamenti_screen.dart
//
//  Dipendenze dirette:
// - Flutter Material (per UI e navigazione).
// - Le tre schermate storico specifiche.
//
// ======================================================

import 'package:flutter/material.dart';
import 'storico_bollette_screen.dart';
import 'storico_multe_screen.dart';
import 'storico_spostamenti_screen.dart';

///  Schermata principale dello Storico.
///
///  Responsabilità:
/// - Mostrare un'interfaccia semplice che permette agli utenti
///   di navigare verso:
///     Storico Bollette
///     Storico Multe
///     Storico Spostamenti
///
/// Dettagli implementativi:
/// - Utilizza un'app bar con titolo 'Storico'.
/// - Ogni voce di storico è rappresentata da un pulsante grande
///   e ben visibile, che porta alla rispettiva schermata.
/// - Il layout è una semplice colonna verticale con padding uniforme.
///
/// Miglioramenti futuri possibili:
/// - Integrare una TabBar per migliorare l'esperienza utente.
/// - Visualizzare una panoramica combinata di tutte le operazioni
///   recenti direttamente in questa schermata.
///
class StoricoScreen extends StatelessWidget {
  final String email;
  final String password;

  const StoricoScreen({
    super.key,
    required this.email,
    required this.password,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Storico')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildStoricoButton(
              context,
              label: 'Storico Bollette',
              destinazione: StoricoBolletteScreen(
                email: email,
                password: password,
              ),
            ),
            const SizedBox(height: 16),
            _buildStoricoButton(
              context,
              label: 'Storico Multe',
              destinazione: StoricoMulteScreen(
                email: email,
                password: password,
              ),
            ),
            const SizedBox(height: 16),
            _buildStoricoButton(
              context,
              label: 'Storico Spostamenti',
              destinazione: StoricoSpostamentiScreen(
                email: email,
                password: password,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStoricoButton(BuildContext context,
      {required String label, required Widget destinazione}) {
    return SizedBox(
      width: double.infinity,
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