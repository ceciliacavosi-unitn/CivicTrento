// ======================================================
// 📄 impostazioni_screen.dart
// Schermata delle Impostazioni dell'app CivicCoins.
//
// 📌 Funzione del file:
// - Visualizza le opzioni di configurazione dell'utente.
// - Attualmente mostra solo un link statico per invitare nuovi utenti.
//
// 📦 Collegamento alla struttura del progetto:
// - Fa parte della cartella `presentazione/schermate/`.
// - Accessibile dalla schermata Home tramite il pulsante Impostazioni.
//
// ✅ Dipendenze dirette:
// - Flutter Material (Scaffold, AppBar, ListView, ListTile).
//
// ======================================================

import 'package:flutter/material.dart';

///
/// Schermata delle Impostazioni.
///
/// 🔑 Responsabilità chiave:
/// - Incapsula le impostazioni utente all’interno di uno Scaffold.
/// - Mostra un semplice link di invito per ora (funzionalità demo).
///
/// 🔗 Collegamenti nel progetto:
/// - Navigabile dalla schermata principale tramite il pulsante Impostazioni.
/// - Pronta per essere ampliata con altre funzionalità future:
///   - Gestione lingua.
///   - Modifica password.
///   - Selezione tema.
///   - Privacy e cancellazione account.
///
class ImpostazioniScreen extends StatelessWidget {
  const ImpostazioniScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Impostazioni'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          ListTile(
            title: Text(
              'Link per invito nuovi utenti: https://example.com/invito',
              style: TextStyle(
                color: Colors.blue,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
