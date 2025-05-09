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
// - `presentazione/gestione/theme_provider.dart`: per il tema dinamico.
//
// ======================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart'; // ✅ Aggiunto
import 'package:google_fonts/google_fonts.dart';
import 'presentazione/gestione/theme_provider.dart'; // ✅ Aggiunto

// Import della schermata iniziale: Schermata di Login
import 'presentazione/schermate/login_screen.dart';

void main() {
  // Avvia l'app CivicCoins con il provider per il tema
  runApp(
    ChangeNotifierProvider(
      create: (_) => ThemeProvider(),
      child: const CivicCoinsApp(),
    ),
  );
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
    final themeProvider = Provider.of<ThemeProvider>(context);

    return MaterialApp(
      // Nome dell'app visualizzato in contesti di sistema e multitasking
      title: 'CivicCoins App',

      // Nasconde il banner di debug visibile in alto a destra in modalità sviluppo
      debugShowCheckedModeBanner: false,

      // 🔄 Tema dinamico (chiaro/scuro)
      themeMode: themeProvider.themeMode,

      // Tema chiaro
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFE9E9E9),
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.teal,
          brightness: Brightness.light,
        ),
        textTheme: GoogleFonts.robotoTextTheme().copyWith(
          bodyMedium: const TextStyle(color: Colors.black87),
        ),
        useMaterial3: true,
      ),

      // Tema scuro
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.teal,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),

      // ✅ Schermata iniziale dell'app: la pagina di login
      home: const LoginScreen(),
    );
  }
}
