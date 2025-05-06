// ======================================================
// 📄 main.dart
// Punto di ingresso dell'app CivicCoins.
//
// 📌 Funzione del file:
// - Definisce la root dell'app Flutter CivicCoins.
// - Imposta il tema globale e le configurazioni principali.
// - Specifica quale schermata viene mostrata per prima.
//
// 📦 Collegamento alla struttura del progetto:
// - Questo file si trova alla radice di `lib/` e rappresenta
//   il cuore dell'inizializzazione dell'app.
// - Collega la parte di interfaccia utente (presentazione)
//   con la configurazione iniziale.
//
// ✅ Dipendenze dirette:
// - `presentazione/schermate/schermata_login.dart`: la schermata iniziale.
// - `config`: le configurazioni (opzionale, se si vorranno integrare a tema).
//
// ======================================================

import 'package:flutter/material.dart';
// Pacchetto Google Fonts (non ancora usato qui, previsto per futuri ampliamenti)
import 'package:google_fonts/google_fonts.dart';

// Import della schermata iniziale: Schermata di Login
import 'presentazione/schermate/login_screen.dart';

void main() {
  // Avvia l'app CivicCoins
  runApp(const CivicCoinsApp());
}

///
/// Classe principale che rappresenta l'app CivicCoins.
///
/// 🔑 Responsabilità chiave:
/// - Costruisce l'albero widget principale dell'applicazione.
/// - Definisce:
///   - Titolo dell'app (per sistema/OS)
///   - Tema grafico globale (colori, font, Material Design 3)
///   - Schermata iniziale da visualizzare al lancio.
///
/// 🔗 Connessioni nel progetto:
/// - Questo widget è il **contenitore di tutto** ciò che riguarda
///   la parte visiva (UI) e viene esteso nel resto del progetto.
/// - Si appoggia principalmente ai file nella cartella
///   `presentazione/schermate/`.
///
class CivicCoinsApp extends StatelessWidget {
  const CivicCoinsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // Nome dell'app visualizzato in contesti di sistema e multitasking
      title: 'CivicCoins App',

      // Nasconde il banner di debug visibile in alto a destra in modalità sviluppo
      debugShowCheckedModeBanner: false,

      // Tema globale: definisce i colori, la palette e lo stile dei testi
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFE9E9E9), // Colore sfondo base
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.teal, // Colore principale (accent color)
          brightness: Brightness.light, // Modalità chiara
        ),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: Colors.black87),
        ),
        useMaterial3: true, // Abilita il design Material 3
      ),

      // ✅ Schermata iniziale dell'app: la pagina di login
      home: const LoginScreen(),
    );
  }
}
