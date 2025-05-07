import 'package:flutter/material.dart';
import '../../config/costanti.dart'; // puoi lasciarlo se definisce `colorePrimario`

// ======================================================
// 📄 account_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Mostra un'interfaccia mock dei dati anagrafici/account:
//   ✅ Nome
//   ✅ Cognome
//   ✅ Email
//   ✅ Password
//   ✅ Codice fiscale
//   ✅ Numero carta d'identità
//
// - Non usa alcun servizio esterno (solo dati locali di esempio)
// - Utile per demo o prototipi offline
// ======================================================

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  /// 🔧 Costruisce una riga con il valore del campo e il pulsante Modifica/Aggiungi
  Widget _buildRow(BuildContext context, String label, String value) {
    final isEmpty = value.trim().isEmpty;
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Expanded(
            child: Text(
              '$label: ${isEmpty ? '(vuoto)' : value}',
              style: const TextStyle(fontSize: 16),
            ),
          ),
          TextButton(
            onPressed: () {
              // 📛 Solo messaggio dimostrativo (modifica disabilitata)
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Funzione di modifica disabilitata')),
              );
            },
            child: Text(isEmpty ? 'Aggiungi' : 'Modifica'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Dati di esempio per visualizzare l’interfaccia compilata
    const name = 'Mario';
    const surname = 'Rossi';
    const email = 'mario.rossi@example.com';
    const password = '********';
    const fiscalCode = 'RSSMRA80A01H501U';
    const idCardNumber = 'AA1234567';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Account'),
        backgroundColor: colorePrimario,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildRow(context, 'Nome', name),
              _buildRow(context, 'Cognome', surname),
              _buildRow(context, 'Email', email),
              _buildRow(context, 'Password', password),
              _buildRow(context, 'Codice Fiscale', fiscalCode),
              _buildRow(context, 'Carta d\'Identità', idCardNumber),
            ],
          ),
        ),
      ),
    );
  }
}

