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
  bool _loading = false; // 🔄 Nessun caricamento da remoto
  String? _error;

  // 🔧 Dati temporanei simulati
  String _subscriptionCode = '';
  String _podCode = '';
  String _licenseNumber = '';

  /// 🗑️ Rimuove un valore (lo resetta a stringa vuota).
  Future<void> _removeValue(String label) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Conferma rimozione'),
        content: Text('Vuoi davvero rimuovere $label?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annulla')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Rimuovi')),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() {
      if (label == labelCodiceAbbonamento) _subscriptionCode = '';
      if (label == labelCodicePOD) _podCode = '';
      if (label == labelNumeroPatente) _licenseNumber = '';
    });

    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$label rimosso')));
  }

  /// 🧱 Costruisce la riga con dati + bottoni Azione (Modifica/Rimuovi).
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

