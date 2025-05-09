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
import '../../presentazione/schermate/login_screen.dart';
import '../../servizi/auth_service.dart';

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

  /// 🔄 Metodo che esegue la registrazione:
  /// - Valida il form.
  /// - Esegue la chiamata API tramite UserService.
  /// - Mostra un messaggio di successo o errore.
  /// - Reindirizza al LoginScreen in caso di successo.
  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    // 🔎 Manca controllo coerenza input:
    // ➔ Es. validazione email formale, password sicura, codice fiscale valido ecc.

    try {
      // ✅ Esegue la registrazione passando i dati raccolti
      await AuthService.register(
        name: _nameController.text,
        surname: _surnameController.text,
        email: _emailController.text,
        password: _passwordController.text,
        fiscalCode: _fiscalCodeController.text,
        idCardNumber: _idCardController.text,
      );

      // ✅ Mostra conferma e, dopo la chiusura dello SnackBar, naviga al Login
      final snack = ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Registrazione completata")),
      );
      snack.closed.then((_) => Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      ));
    } catch (e) {
      // ❌ Mostra eventuale errore durante la registrazione
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
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
