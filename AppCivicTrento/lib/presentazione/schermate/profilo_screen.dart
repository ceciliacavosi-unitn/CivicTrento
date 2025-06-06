// ======================================================
//  profilo_screen.dart (presentazione/schermate/)
//
//  Funzione del file:
// - Mostra i dati specifici del cittadino (Abbonamento, POD, Patente).
// - Permette di aggiungere/modificare/rimuovere ogni campo.
// - Utilizza servizi API per sincronizzare i dati.
//
// ======================================================

import 'package:flutter/material.dart';
import '../../config/costanti.dart';
import '../../servizi/cittadino_service.dart';
import 'edit_field_screen.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../config/api_endpoints.dart'; 


class DatiCittadinoScreen extends StatefulWidget {
  final String email;
  final String password;

  const DatiCittadinoScreen({
    super.key,
    required this.email,
    required this.password,

  });

  @override
  State<DatiCittadinoScreen> createState() => _DatiCittadinoScreenState();
}

class _DatiCittadinoScreenState extends State<DatiCittadinoScreen> {
  bool _loading = true;
  String? _error;

  String _subscriptionCode = '';
  String _podCode = '';
  String _licenseNumber = '';
  bool _consensoUtenze = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  ///  Carica i dati del cittadino tramite UserService.
  Future<void> _loadData() async {
    print('Caricamento dati utente in corso...');
    try {
      final data = await CittadinoService.fetchMyData();
      print('Dati ricevuti dal backend: $data');

      setState(() {
        _subscriptionCode = data['subscription_code'] ?? '';
        _podCode = data['pod_code'] ?? '';
        _licenseNumber = data['driver_license'] ?? '';
        _error = null;
        _loading = false;
      });
    } catch (e) {
      print('Errore nel caricamento dati: $e');
      setState(() {
        _error = 'Errore nel caricamento dati: ${e.toString()}';
        _loading = false;
      });
    }
  }

  ///  Modifica o aggiunge un valore specifico.
  Future<void> _editValue(String label, String currentValue) async {
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
        final field = _fieldKeyFromLabel(label);
        if (currentValue.isEmpty) {
          print('➕ Inserimento nuovo valore per $field: $newValue');
          await CittadinoService.insertData(
            field: field,
            value: newValue,
          );
        } else {
          print('Modifica valore esistente per $field: $newValue');
          await CittadinoService.modifyData(
            field: field,
            value: newValue,
          );
        }
        await _loadData();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$label aggiornato con successo')),
        );
      } catch (e) {
        print('Errore nella modifica del campo $label: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Errore: ${e.toString()}')),
        );
        setState(() => _loading = false);
      }
    }
  }

  /// Rimuove un valore chiamando l’API DELETE.
  Future<void> _removeValue(String label) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Conferma rimozione'),
        content: Text('Vuoi davvero rimuovere $label?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annulla'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Rimuovi'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    final fieldKey = _fieldKeyFromLabel(label);
    print('🗑️ Rimozione campo $fieldKey');

    setState(() => _loading = true);

    try {
      await CittadinoService.deleteData(field: fieldKey);
      await _loadData();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$label rimosso con successo')),
      );
    } catch (e) {
      print('Errore nella rimozione del campo $label: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Errore: ${e.toString()}')),
      );
      setState(() => _loading = false);
    }
  }

  /// Converte un'etichetta visiva nel nome del campo API.
  String _fieldKeyFromLabel(String label) {
    return {
      labelCodiceAbbonamento: 'subscription_code',
      labelCodicePOD: 'pod_code',
      labelNumeroPatente: 'driver_license',
    }[label]!;
  }

  /// Costruisce la riga con dati + bottoni Azione (Modifica/Rimuovi).
  Widget _buildRow(String label, String value) {
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
          if (!isEmpty) ...[
            TextButton(
              onPressed: _loading ? null : () => _editValue(label, value),
              child: const Text('Modifica'),
            ),
            TextButton(
              onPressed: _loading ? null : () => _removeValue(label),
              child: const Text('Rimuovi'),
            ),
          ],
          if (isEmpty)
            TextButton(
              onPressed: _loading ? null : () => _editValue(label, value),
              child: const Text('Aggiungi'),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dati Cittadino'),
        backgroundColor: colorePrimario,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : (_error != null)
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildRow(labelCodiceAbbonamento, _subscriptionCode),
                      _buildRow(labelCodicePOD, _podCode),
                      _buildRow(labelNumeroPatente, _licenseNumber),
                      CheckboxListTile(
                        title: Text(
                          "Autorizzo l’app CivicTrento ad accedere e trattare i miei dati relativi ai consumi energetici per finalità di monitoraggio e premialità, secondo quanto descritto nell’informativa sulla privacy.",
                          style: TextStyle(fontSize: 13),
                        ),
                        value: _consensoUtenze,
                        onChanged: (val) => setState(() => _consensoUtenze = val!),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () async {
                          if (_podCode.trim().isEmpty || !_consensoUtenze) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text("Inserisci il codice POD e dai il consenso")),
                            );
                            return;
                          }

                          final response = await http.post(
                            Uri.parse('$baseUrl/cittadino/utenza'),
                            headers: {'Content-Type': 'application/json'},
                            body: jsonEncode({
                              'idUtente': widget.email,
                              'utenza': 'luce',
                              'codicePOD': _podCode,
                              'fornitore': _subscriptionCode,
                              'consenso': _consensoUtenze
                            }),
                          );

                          if (response.statusCode == 200) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text("Dati utenza salvati con successo")),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text("Errore: ${response.body}")),
                            );
                          }
                        },
                        child: const Text("Salva Dati Utenza"),
                      ),
                    ],
                  ),
                ),
    );
  }
}
