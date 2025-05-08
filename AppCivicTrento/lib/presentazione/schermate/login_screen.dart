// ======================================================
// 📄 login_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Schermata di login per gli utenti CivicCoins.
// - Raccoglie email e password tramite form.
// - Esegue l'autenticazione tramite AuthService.
// - Se il login ha successo:
//     • Memorizza le credenziali globalmente in SistemaAutenticazione.
//     • Reindirizza alla schermata Home.
// - Mostra eventuali errori tramite SnackBar.
// - ➕ In fondo: link per registrarsi se non si ha un account.
//
// ======================================================

import 'package:flutter/material.dart';
import '../../config/costanti.dart'; 
import '../../dominio/gestione/sistema_autenticazione.dart';
import '../../servizi/auth_service.dart';
import 'main_screen.dart';
import 'registrazione_screen.dart'; 

/// 🔐 Schermata di login utente CivicCoins.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // 📥 Controller per raccogliere l'email inserita dall'utente.
  final _emailController = TextEditingController();

  // 🔑 Controller per raccogliere la password inserita dall'utente.
  final _passwordController = TextEditingController();

  // ⏳ Stato di caricamento: true durante la richiesta di login.
  bool _isLoading = false;

  /// 🔄 Funzione che gestisce l'operazione di login:
  /// - Chiama AuthService.login()
  /// - Memorizza le credenziali in SistemaAutenticazione
  /// - Mostra errori o reindirizza alla HomeScreen
  Future<void> _login() async {
    setState(() => _isLoading = true);
    try {
      // ✅ 1️⃣ Esegue la chiamata di login al servizio
      await AuthService.login(
        email: _emailController.text,
        password: _passwordController.text,
      );

      // ✅ 2️⃣ Se ok, memorizza le credenziali globalmente
      SistemaAutenticazione.login(
        _emailController.text,
        _passwordController.text,
      );

      // ✅ 3️⃣ Reindirizza alla schermata Home
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => MainScreen(
            email: _emailController.text,
            password: _passwordController.text,
          ),
        ),
      );
    } catch (e) {
      // ❌ Mostra un messaggio di errore in caso di eccezione
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      // 🔄 Sempre alla fine: disattiva la modalità di caricamento
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Login")),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // 🖼️ Logo dell'app in alto
              Image.asset(
                assetLogo,
                width: 120,
                height: 120,
              ),
              const SizedBox(height: 32),

              // 🖊️ Campo di input per l'email
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: "Email"),
              ),
              const SizedBox(height: 16),

              // 🔐 Campo di input per la password (oscurato)
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: "Password"),
                obscureText: true,
              ),
              const SizedBox(height: 24),

              // 🔄 Mostra un loader durante il login oppure il pulsante "Accedi"
              _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _login,
                      child: const Text("Accedi"),
                    ),

              const SizedBox(height: 24),

              // 🔗 Link per la registrazione se non hai un account
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
    );
  }
}