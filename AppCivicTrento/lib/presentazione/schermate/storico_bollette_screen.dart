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

class StoricoBolletteScreen extends StatefulWidget{
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
  List<Map<String, dynamic>> bollette = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    caricaBolletta();
  }

  Future<void> caricaBolletta() async {
    final tipi = ['acqua', 'gas', 'elettrica'];
    final results = <Map<String, dynamic>>[];

    for (final tipo in tipi) {
      try {
        final response = await StoricoService.getStoricoBolletta(tipo);
        if (response['tipo'] != null) {
          results.add({
            'tipo': response['tipo'],
            'punti': response['punti'] ?? 0,
            'data': response['data'] ?? DateTime.now().toIso8601String(),
          });
        }
      } catch (e) {
        debugPrint('Errore bolletta $tipo: $e');
      }
    }

    setState(() {
      bollette = results;
      isLoading = false;
    });
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
          : bollette.isEmpty
              ? const Center(child: Text('Nessuna bolletta trovata.'))
              : ListView.builder(
                  itemCount: bollette.length,
                  itemBuilder: (context, index) {
                    final b = bollette[index];
                    return ElementoStorico(
                      title: 'Pagamento bolletta ${b['tipo']}',
                      subtitle: formattaData(b['data']),
                      points: '+${b['punti'].toString()}',
                    );
                  },
                ),
    );
  }
}