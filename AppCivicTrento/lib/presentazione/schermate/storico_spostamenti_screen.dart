//======================================================
// storico_spostamenti_screen.dart (presentazione/schermate/)
//
// Funzione del file:
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
  List<Map<String, dynamic>> spostamenti = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    caricaSpostamenti();
  }

  Future<void> caricaSpostamenti() async {
    try {
      final response = await StoricoService.getTuttiSpostamenti(); // nuova funzione che restituisce una lista
      setState(() {
        spostamenti = response;
        isLoading = false;
      });
    } catch (e) {
      debugPrint('Errore caricamento spostamenti: $e');
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
          : spostamenti.isEmpty
              ? const Center(child: Text('Nessuno spostamento trovato.'))
              : ListView.builder(
                  itemCount: spostamenti.length,
                  itemBuilder: (context, index) {
                    final s = spostamenti[index];
                    final distanza = double.tryParse(s['distanza_km'].toString()) ?? 0;
                    final punti = distanza > 5 ? 1.0 : 0.5;
                    return ElementoStorico(
                      title: 'Spostamento (${distanza.toStringAsFixed(1)} km)',
                      subtitle: formattaData(s['data']),
                      points: '+${punti.toString()}',
                    );
                  },
                ),
    );
  }
}
