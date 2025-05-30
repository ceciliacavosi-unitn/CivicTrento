// ======================================================
// storico_bollette_screen.dart (presentazione/schermate/)
//
// Funzione del file:
// - Mostra lo storico delle bollette pagate.
// - Recupera i dati dinamicamente dal backend.
// ======================================================

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../servizi/storico_service.dart';
import '../widget/storico_elemento.dart';

class StoricoBolletteScreen extends StatefulWidget {
  final String email;
  final String password;

  const StoricoBolletteScreen({
    super.key,
    required this.email,
    required this.password,
  });

  @override
  State<StoricoBolletteScreen> createState() => _StoricoBolletteScreenState();
}

class _StoricoBolletteScreenState extends State<StoricoBolletteScreen> {
  Map<String, dynamic>? bolletta;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    caricaBolletta();
  }

  Future<void> caricaBolletta() async {
    try {
      final response = await StoricoService.getStoricoBolletta('elettrica');

      setState(() {
        bolletta = response;
        isLoading = false;
      });
    } catch (e) {
      debugPrint('Errore caricamento bolletta: $e');
      setState(() => isLoading = false);
    }
  }

  String formattaData(String iso) {
    try {
      return DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(iso));
    } catch (_) {
      return 'Data sconosciuta';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Storico Bollette')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : bolletta == null
              ? const Center(child: Text('Nessuna bolletta trovata.'))
              : ListView(
                  children: [
                    ElementoStorico(
                      title: 'Pagamento bolletta ${bolletta!['tipo'] ?? 'sconosciuta'}',
                      subtitle: formattaData(DateTime.now().toIso8601String()),
                      points: '+${bolletta!['punti'].toString()}',
                    )
                  ],
                ),
    );
  }
}
