// ======================================================
// 📄 impostazioni_screen.dart
// Schermata delle Impostazioni dell'app CivicCoins.
//
// 📌 Funzione del file:
// - Permette di:
//     ✅ Cambiare tema
//     ✅ Invitare utenti
//     ✅ Effettuare logout
//     ✅ Cancellare account e dati civici
// ======================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../gestione/theme_provider.dart';
import '../../servizi/auth_service.dart';
import '../../servizi/cittadino_service.dart';
import '../schermate/login_screen.dart';
import '../../dominio/gestione/sistema_autenticazione.dart';

class ImpostazioniScreen extends StatefulWidget {
  const ImpostazioniScreen({super.key});

  @override
  State<ImpostazioniScreen> createState() => _ImpostazioniScreenState();
}

class _ImpostazioniScreenState extends State<ImpostazioniScreen> {
  bool isDarkMode = false;

  @override
  void initState() {
    super.initState();
    _loadThemePreference();
  }

  Future<void> _loadThemePreference() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      isDarkMode = prefs.getBool('darkMode') ?? false;
    });
  }

  void _toggleTheme(bool value) {
    setState(() => isDarkMode = value);
    Provider.of<ThemeProvider>(context, listen: false).toggleTheme(value);
  }

  Future<void> _logout() async {
    try {
      await AuthService.logout(email: SistemaAutenticazione.email!);
      SistemaAutenticazione.logout();
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Logout effettuato con successo")),
      );
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Errore durante il logout: $e")),
      );
    }
  }

  /// ❌ Cancella definitivamente account e dati civici
  void _deleteAccount() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Conferma cancellazione'),
        content: const Text('Vuoi cancellare definitivamente il tuo account e tutti i dati?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annulla'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                final email = SistemaAutenticazione.email!;
                final password = SistemaAutenticazione.password!;

                // ❌ Rimuove ogni campo dati cittadino
                await CittadinoService.deleteAllData(
                  email: SistemaAutenticazione.email!,
                  password: SistemaAutenticazione.password!,
                );

                // ❌ Elimina account
                await AuthService.deleteAccount(email: email, password: password);
                SistemaAutenticazione.logout();

                final prefs = await SharedPreferences.getInstance();
                await prefs.clear();

                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Account eliminato con successo"), backgroundColor: Colors.red),
                );
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              } catch (e) {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text("Errore nella cancellazione: $e"), backgroundColor: Colors.red),
                );
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Conferma'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Impostazioni')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const ListTile(
            title: Text('Invita nuovi utenti', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(
              'https://civiccoins.app/invito',
              style: TextStyle(color: Colors.blue, decoration: TextDecoration.underline),
            ),
          ),
          SwitchListTile(
            title: const Text('Tema scuro'),
            value: isDarkMode,
            onChanged: _toggleTheme,
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Logout'),
            onTap: _logout,
          ),
          const SizedBox(height: 24),
          const Text(
            'Danger Zone',
            style: TextStyle(color: Colors.red, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          ListTile(
            leading: const Icon(Icons.delete, color: Colors.red),
            title: const Text('Cancellazione account', style: TextStyle(color: Colors.red)),
            onTap: _deleteAccount,
          ),
        ],
      ),
    );
  }
}
