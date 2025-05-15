// ======================================================
// account_screen.dart (presentazione/schermate/)
//
// Funzione del file:
// - Mostra e permette di modificare i dati anagrafici/account:
//   Nome
//   Cognome
//   Email
//   Password
//   Codice fiscale
//   Numero carta d'identità
//
// - Usa UtenteService per caricare e salvare i dati.
// ======================================================

import 'package:flutter/material.dart';
import '../../config/costanti.dart';
import '../../servizi/utente_service.dart';
import 'edit_field_screen.dart';

class AccountScreen extends StatefulWidget {
  final String email;
  final String password;

  const AccountScreen({
    super.key,
    required this.email,
    required this.password,
  });

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  bool _loading = true;
  String? _error;

  String _name = '';
  String _surname = '';
  String _email = '';
  String _password = '';
  String _fiscalCode = '';
  String _idCardNumber = '';

  @override
  void initState() {
    super.initState();
    _password = widget.password; // inizializza subito
    _loadProfile();
  }

  ///  Carica i dati anagrafici tramite UtenteService
  Future<void> _loadProfile() async {
    print(" [_loadProfile] Email: ${widget.email}, Password: $_password");
    try {
      final data = await UtenteService.fetchProfile(
        email: widget.email,
        password: _password,
      );

      print(" Profilo caricato: $data");

      setState(() {
        _name = data['nome'] ?? '';
        _surname = data['cognome'] ?? '';
        _email = data['email'] ?? '';
        _fiscalCode = data['CF'] ?? '';
        _idCardNumber = data['cartaID'] ?? '';
        _error = null;
        _loading = false;
      });
    } catch (e) {
      print(" Errore nel caricamento profilo: $e");
      setState(() {
        _error = 'Errore nel caricamento dati: ${e.toString()}';
        _loading = false;
      });
    }
  }

  ///  Modifica un campo specifico
  Future<void> _editField(String label, String currentValue, String fieldKey) async {
    final newValue = await Navigator.push<String?>(
      context,
      MaterialPageRoute(
        builder: (_) => EditSingleFieldScreen(
          label: label,
          initialValue: currentValue,
        ),
      ),
    );

    if (newValue != null && newValue != currentValue) {
      setState(() => _loading = true);
      try {
        print(" Modifica $fieldKey → $newValue (con password attuale: $_password)");

        await UtenteService.modifyProfile(
          email: widget.email,
          password: _password,
          field: fieldKey,
          newValue: newValue,
        );

        if (fieldKey == 'password') {
          print(" Password aggiornata localmente");
          _password = newValue; //  aggiorna la password locale
        }

        await _loadProfile();

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$label aggiornato con successo')),
        );
      } catch (e) {
        print(" Errore nella modifica di $fieldKey: $e");
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Errore: ${e.toString()}')),
        );
        setState(() => _loading = false);
      }
    }
  }

  Widget _buildRow(String label, String value, String fieldKey) {
    final isEmpty = value.trim().isEmpty;
    final isPassword = fieldKey == 'password';
    final displayValue = isEmpty
      ? '(vuoto)'
      : (isPassword ? '●' * value.length : value);

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Expanded(
            child: Text(
              '$label: $displayValue',
              style: const TextStyle(fontSize: 16),
            ),
          ),
          TextButton(
            onPressed: _loading ? null : () => _editField(label, value, fieldKey),
            child: Text(isEmpty ? 'Aggiungi' : 'Modifica'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Account'),
        backgroundColor: colorePrimario,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : (_error != null)
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : Padding(
                  padding: const EdgeInsets.all(24),
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildRow('Nome', _name, 'nome'),
                        _buildRow('Cognome', _surname, 'cognome'),
                        _buildRow('Email', _email, 'email'),
                        _buildRow('Password', _password, 'password'),
                        _buildRow('Codice Fiscale', _fiscalCode, 'CF'),
                        _buildRow('Carta d\'Identità', _idCardNumber, 'cartaID'),
                      ],
                    ),
                  ),
                ),
    );
  }
}