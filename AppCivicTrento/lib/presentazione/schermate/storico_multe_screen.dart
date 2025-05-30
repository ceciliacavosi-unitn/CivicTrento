// ======================================================
// storico_multe_screen.dart (presentazione/schermate/)
//
// Funzione del file:
// - Mostra la lista delle multe ricevute nello storico.
// - Recupera i dati dinamicamente dal backend (fase test).
// ======================================================

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../servizi/storico_service.dart';
import '../widget/storico_elemento.dart';

class StoricoMulteScreen extends StatefulWidget {
  final String email;
  final String password;

  const StoricoMulteScreen({
    super.key,
    required this.email,
    required this.password,
  });

  @override
  State<StoricoMulteScreen> createState() => _StoricoMulteScreenState();
}

class _StoricoMulteScreenState extends State<StoricoMulteScreen> {
  Map<String, dynamic>? multa;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    caricaMulta();
  }

  Future<void> caricaMulta() async {
    try {
      final response = await StoricoService.getStoricoMulte('media');

      setState(() {
        multa = response;
        isLoading = false;
      });
    } catch (e) {
      debugPrint('Errore caricamento multa: $e');
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
      appBar: AppBar(title: const Text('Storico Multe')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : multa == null
              ? const Center(child: Text('Nessuna multa trovata.'))
              : ListView(
                  children: [
                    ElementoStorico(
                      title: 'Multa (${multa!['gravita'] ?? 'non specificata'})',
                      subtitle: formattaData(multa!['dataUltimaMulta'] ?? DateTime.now().toIso8601String()),
                      points: multa!['gravita'] == 'gravi'
                          ? 'Saldo azzerato'
                          : multa!['gravita'] == 'medie'
                              ? '-40'
                              : '-10',
                    )
                  ],
                ),
    );
  }
}
