// ======================================================
// 📄 premi_screen.dart (da spostare in presentazione/schermate/)
//
// 📌 Funzione del file:
// - Definisce la schermata che mostra la lista dei premi disponibili
//   per il cittadino nell'app CivicCoins.
// - Permette all'utente di riscattare un premio cliccando il pulsante.
//
// 📦 Collegamento alla struttura del progetto:
// - Fa parte dell'interfaccia utente (UI), quindi deve essere posizionato
//   nella cartella `presentazione/schermate/`.
// - NON rappresenta il modello di dominio `Premio`.
//
// ======================================================

import 'package:flutter/material.dart';

/// 🏆 Schermata che mostra la lista di premi riscattabili.
class PremiScreen extends StatelessWidget {
  const PremiScreen({super.key});

  /// 🔖 Elenco statico di premi disponibili.
  /// 👉 Hey, questo array di stringhe potrebbe essere spostato in `costanti.dart`
  /// per mantenerlo centralizzato e modificabile facilmente!
  static const _options = [
    "Sconto abbonamento trasporti",
    "Accesso gratuito a musei",
    "Buono spesa 20€",
    "Sconto su bolletta luce",
    "Biglietti cinema 2x1"
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _options.length,
      itemBuilder: (_, i) => Card(
        margin: const EdgeInsets.symmetric(vertical: 8),
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: ListTile(
          title: Text(_options[i]),
          trailing: ElevatedButton(
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Hai riscattato: ${_options[i]}')),
            ),
            child: const Text('Riscuoti'),
          ),
        ),
      ),
    );
  }
}
