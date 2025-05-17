//======================================================
// 📄 storico_spostamenti_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Mostra lo storico degli spostamenti registrati dinamicamente.
// - Attualmente gestisce un singolo spostamento simulato.
// ======================================================

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../servizi/storico_service.dart';
import '../widget/storico_elemento.dart';

class StoricoSpostamentiScreen extends StatefulWidget {
  final String email;
  final String password;

  const StoricoSpostamentiScreen({
    super.key,
    required this.email,
    required this.password,
  });

  @override
  State<StoricoSpostamentiScreen> createState() => _StoricoSpostamentiScreenState();
}

class _StoricoSpostamentiScreenState extends State<StoricoSpostamentiScreen> {
  Map<String, dynamic>? spostamento;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    caricaSpostamento();
  }

  Future<void> caricaSpostamento() async {
    try {
      final response = await StoricoService.getStoricoMovimento(
        email: widget.email,
        password: widget.password,
      );

      setState(() {
        spostamento = response;
        isLoading = false;
      });
    } catch (e) {
      debugPrint('❌ Errore caricamento spostamento: $e');
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
      appBar: AppBar(title: const Text('Storico Spostamenti')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : spostamento == null
              ? const Center(child: Text('Nessuno spostamento trovato.'))
              : ListView(
                  children: [
                    ElementoStorico(
                      title:
                          'Spostamento (${spostamento!['distanza_km']} km)',
                      subtitle: formattaData(DateTime.now().toIso8601String()),
                      points: double.tryParse(spostamento!['distanza_km'].toString()) != null
                          ? '+${(double.parse(spostamento!['distanza_km'].toString()) > 5 ? 1.0 : 0.5)}'
                          : '+0',
                    )
                  ],
                ),
    );
  }
}
