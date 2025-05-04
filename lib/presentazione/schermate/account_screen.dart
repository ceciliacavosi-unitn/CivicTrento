// ======================================================
// 📄 account_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Mostra e permette di modificare i dati anagrafici/account:
//   ✅ Nome
//   ✅ Cognome
//   ✅ Email
//   ✅ Password
//   ✅ Codice fiscale
//   ✅ Numero carta d'identità
//
// - Usa UtenteService per caricare e salvare i dati.
//
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
    _loadProfile();
  }

  /// 🔄 Carica i dati anagrafici tramite UtenteService
  Future<void> _loadProfile() async {
    try {
      final data = await UtenteService.fetchProfile(
        email: widget.email,
        password: widget.password,
      );

      setState(() {
        _name = data['name'] ?? '';
        _surname = data['surname'] ?? '';
        _email = data['email'] ?? '';
        _fiscalCode = data['fiscal_code'] ?? '';
        _idCardNumber = data['id_card_number'] ?? '';
        _password = widget.password;
        _error = null;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Errore nel caricamento dati: ${e.toString()}';
        _loading = false;
      });
    }
  }

  /// ✏️ Modifica un campo specifico
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
        await UtenteService.modifyProfile(
          email: widget.email,
          password: widget.password,
          field: fieldKey,
          newValue: newValue,
        );
        await _loadProfile();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$label aggiornato con successo')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Errore: ${e.toString()}')),
        );
        setState(() => _loading = false);
      }
    }
  }

  Widget _buildRow(String label, String value, String fieldKey) {
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
                        _buildRow('Nome', _name, 'name'),
                        _buildRow('Cognome', _surname, 'surname'),
                        _buildRow('Email', _email, 'email'),
                        _buildRow('Password', _password, 'password'),
                        _buildRow('Codice Fiscale', _fiscalCode, 'fiscal_code'),
                        _buildRow('Carta d\'Identità', _idCardNumber, 'id_card_number'),
                      ],
                    ),
                  ),
                ),
    );
  }
}
