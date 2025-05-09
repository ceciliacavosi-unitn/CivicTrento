// ======================================================
// 📄 profilo_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Mostra i dati specifici del cittadino (Abbonamento, POD, Patente).
// - Permette di aggiungere/modificare/rimuovere ogni campo.
// - Utilizza servizi API per sincronizzare i dati.
//
// ======================================================

import 'package:flutter/material.dart';
import '../../config/costanti.dart';  // ✅ Importa le costanti
import '../../servizi/cittadino_service.dart';
import 'edit_field_screen.dart';

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

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  /// 🔄 Carica i dati del cittadino tramite UserService.
  Future<void> _loadData() async {
    try {
      final data = await CittadinoService.fetchMyData(
        email: widget.email,
        password: widget.password,
      );

      setState(() {
        _subscriptionCode = data['subscription_code'] ?? '';
        _podCode = data['pod_code'] ?? '';
        _licenseNumber = data['driver_license'] ?? '';
        _error = null;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Errore nel caricamento dati: \${e.toString()}';
        _loading = false;
      });
    }
  }

  /// ✏️ Modifica o aggiunge un valore specifico.
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
        if (currentValue.isEmpty) {
          await CittadinoService.insertData(
            email: widget.email,
            password: widget.password,
            field: _fieldKeyFromLabel(label),
            value: newValue,
          );
        } else {
          await CittadinoService.modifyData(
            email: widget.email,
            password: widget.password,
            field: _fieldKeyFromLabel(label),
            value: newValue,
          );
        }
        await _loadData();
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

  /// 🗑️ Rimuove un valore chiamando l’API DELETE.
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

    setState(() => _loading = true);

    try {
      await CittadinoService.deleteData(
        email: widget.email,
        password: widget.password,
        field: fieldKey,
      );
      await _loadData();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$label rimosso con successo')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Errore: ${e.toString()}')),
      );
      setState(() => _loading = false);
    }
  }


  /// 📊 Converte un'etichetta visiva nel nome del campo API.
  String _fieldKeyFromLabel(String label) {
    return {
      labelCodiceAbbonamento: 'subscription_code',
      labelCodicePOD: 'pod_code',
      labelNumeroPatente: 'driver_license',
    }[label]!;
  }

  /// 🧱️ Costruisce la riga con dati + bottoni Azione (Modifica/Rimuovi).
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
                    ],
                  ),
                ),
    );
  }
}
