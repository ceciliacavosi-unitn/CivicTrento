// ======================================================
// informativa_privacy_screen.dart
//
// Schermata che mostra l'informativa privacy completa.
// Accessibile durante la registrazione o dalle impostazioni.
// ======================================================

import 'package:flutter/material.dart';

class InformativaPrivacyScreen extends StatelessWidget {
  const InformativaPrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Informativa Privacy"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Text(
            '''
Ai sensi del Regolamento (UE) 2016/679 (GDPR), i dati personali forniti saranno trattati per finalità legate alla registrazione e all’utilizzo dell’app CivicCoins.

1. **Finalità del trattamento**:
   - Creazione account e autenticazione
   - Monitoraggio comportamenti civici
   - Calcolo e visualizzazione dei punteggi
   - Eventuale contatto per aggiornamenti e premi

2. **Dati raccolti**:
   - Dati identificativi (nome, cognome, email)
   - Credenziali (password crittografata)
   - Codice fiscale e numero carta d’identità
   - Eventuali dati sulle attività civiche

3. **Base giuridica**:
   Il trattamento è basato sul consenso dell’interessato.

4. **Diritti dell’utente**:
   L’utente ha diritto di accedere, modificare o cancellare i propri dati in qualsiasi momento.

5. **Titolare del trattamento**:
   Comune di

Per maggiori dettagli, contattare: 
            ''',
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ),
    );
  }
}
