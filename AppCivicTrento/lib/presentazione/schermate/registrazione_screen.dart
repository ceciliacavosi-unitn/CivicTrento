// ======================================================
// 📄 registrazione_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Schermata di registrazione per nuovi utenti.
// - Raccoglie i dati personali e le credenziali di accesso.
// - Esegue la registrazione tramite UserService. 
// - Se completata con successo, reindirizza al login. 
//
// ======================================================

import 'package:flutter/material.dart';

/// 📝 Schermata di registrazione utente per CivicCoins.
class RegistrazioneScreen extends StatefulWidget {
  const RegistrazioneScreen({super.key});

  @override
  State<RegistrazioneScreen> createState() => _RegistrazioneScreenState();
}

class _RegistrazioneScreenState extends State<RegistrazioneScreen> {
  // 🔑 Form key per validare il form
  final _formKey = GlobalKey<FormState>();

  // 📥 Controller per i vari campi del form
  final _nameController = TextEditingController();
  final _surnameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _fiscalCodeController = TextEditingController();
  final _idCardController = TextEditingController();

  /// 🔄 Metodo che simula la registrazione:
  /// - Valida il form.
  /// - Mostra un messaggio di successo fittizio.
  void _register() {
    if (!_formKey.currentState!.validate()) return;

    // 🔎 Manca controllo coerenza input:
    // ➔ Es. validazione email formale, password sicura, codice fiscale valido ecc.

    // ✅ Simulazione di successo
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Registrazione completata (simulata)")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Registrazione")),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // 🖊️ Campi di input principali: nome, cognome, email, password, codice fiscale
                for (var item in [
                  [_nameController, 'Nome'],
                  [_surnameController, 'Cognome'],
                  [_emailController, 'Email'],
                  [_passwordController, 'Password', true],
                  [_fiscalCodeController, 'Codice Fiscale'],
                ])
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: TextFormField(
                      controller: item[0] as TextEditingController,
                      decoration: InputDecoration(labelText: item[1] as String),
                      obscureText: (item.length == 3), // oscura solo la password
                      validator: (v) => v!.trim().isEmpty ? 'Campo obbligatorio' : null,
                    ),
                  ),

                // 🆔 Campo di input per numero carta d'identità
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: TextFormField(
                    controller: _idCardController,
                    decoration: const InputDecoration(labelText: 'Numero Carta d\'Identità'),
                    validator: (v) => v!.trim().isEmpty ? 'Campo obbligatorio' : null,
                  ),
                ),

                const SizedBox(height: 20),

                // 🔘 Pulsante di invio registrazione
                ElevatedButton(
                  onPressed: _register,
                  child: const Text("Registrati"),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

