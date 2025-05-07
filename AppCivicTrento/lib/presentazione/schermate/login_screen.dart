// ======================================================
// 📄 login_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Schermata di login per gli utenti CivicCoins.
// - Raccoglie email e password tramite form.
// - Accetta qualsiasi input (mock).
// - Reindirizza direttamente alla schermata Home (MainScreen).
// - ➕ In fondo: link per registrarsi se non si ha un account.
//
// ======================================================

import 'package:flutter/material.dart';
import '../../config/costanti.dart';
import 'main_screen.dart';
import 'registrazione_screen.dart';

/// 🔐 Schermata di login utente CivicCoins.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;

  /// 🔄 Gestisce il login simulato solo se il form è valido.
  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    await Future.delayed(const Duration(seconds: 1)); // ⏱️ Simula attesa

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => MainScreen(
          email: _emailController.text,
          password: _passwordController.text,
        ),
      ),
    );

    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Login")),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // 🖼️ Logo dell'app
                Image.asset(
                  assetLogo,
                  width: 120,
                  height: 120,
                ),
                const SizedBox(height: 32),

                // 📧 Campo email
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: "Email"),
                  validator: (value) =>
                      value == null || value.trim().isEmpty ? 'Campo obbligatorio' : null,
                ),
                const SizedBox(height: 16),

                // 🔒 Campo password
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: "Password"),
                  obscureText: true,
                  validator: (value) =>
                      value == null || value.trim().isEmpty ? 'Campo obbligatorio' : null,
                ),
                const SizedBox(height: 24),

                // 🔘 Pulsante login o loader
                _isLoading
                    ? const CircularProgressIndicator()
                    : ElevatedButton(
                        onPressed: _login,
                        child: const Text("Accedi"),
                      ),

                const SizedBox(height: 24),

                // 🔗 Link per registrarsi
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const RegistrazioneScreen()),
                    );
                  },
                  child: const Text(
                    "Non hai ancora un account? Registrati",
                    style: TextStyle(
                      color: Colors.blue,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}