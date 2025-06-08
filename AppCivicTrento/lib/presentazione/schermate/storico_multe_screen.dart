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
  final List<Map<String, dynamic>> multe = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    caricaMulte();
  }

  Future<void> caricaMulte() async {
    final gravitaLista = ['leggera', 'media', 'grave'];

    for (final gravita in gravitaLista) {
      try {
        final response = await StoricoService.getStoricoMulte(gravita);
        if (response['gravita'] != null) {
          String punti;
          switch (response['gravita']) {
            case 'grave':
              punti = 'Saldo azzerato';
              break;
            case 'media':
              punti = '-40';
              break;
            case 'leggera':
              punti = '-10';
              break;
            default:
              punti = '-?';
          }

          multe.add({
            'gravita': response['gravita'],
            'data': response['dataUltimaMulta'] ?? DateTime.now().toIso8601String(),
            'punti': punti,
          });
        }
      } catch (e) {
        debugPrint('Errore multa $gravita: $e');
      }
    }

    setState(() {
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
      appBar: AppBar(title: const Text('Storico Multe')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : multe.isEmpty
              ? const Center(child: Text('Nessuna multa trovata.'))
              : ListView.builder(
                  itemCount: multe.length,
                  itemBuilder: (context, index) {
                    final m = multe[index];
                    return ElementoStorico(
                      title: 'Multa (${m['gravita']})',
                      subtitle: formattaData(m['data']),
                      points: m['punti'],
                    );
                  },
                ),
    );
  }
}
