  /* //CODICE CECI -> statico 
// ======================================================
// 📄 premi_screen.dart (da spostare in presentazione/schermate/)
//
// 📌 Funzione del file:
// - Definisce la schermata che mostra la lista dei premi disponibili
//   per il cittadino nell'app CivicCoins.
// - Permette all'utente di riscattare un premio cliccando il pulsante.
//
// 📦 Collegamento alla struttura del progetto:
// - Fa parte dell'interfaccia utente (UI), quindi deve essere posizionato
//   nella cartella `presentazione/schermate/`.
// - NON rappresenta il modello di dominio `Premio`.
//
// ======================================================

import 'package:flutter/material.dart';
import 'package:civiccoins/servizi/premio_service.dart';


/// 🏆 Schermata che mostra la lista di premi riscattabili.
class PremiScreen extends StatelessWidget {
  const PremiScreen({super.key});


  /// 🔖 Elenco statico di premi disponibili.
  /// 👉 Hey, questo array di stringhe potrebbe essere spostato in `costanti.dart`
  /// per mantenerlo centralizzato e modificabile facilmente!
  static const _options = [
    "Sconto abbonamento trasporti",
    "Accesso gratuito a musei",
    "Buono spesa 20€",
    "Sconto su bolletta luce",
    "Biglietti cinema 2x1"
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _options.length,
      itemBuilder: (_, i) => Card(
        margin: const EdgeInsets.symmetric(vertical: 8),
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: ListTile(
          title: Text(_options[i]),
          trailing: ElevatedButton(
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Hai riscattato: ${_options[i]}')),
            ),
            child: const Text('Riscuoti'),
          ),
        ),
      ),
    );
  }
}
*/

//CODICE MATI -> dinamico 

import 'package:flutter/material.dart';
import 'package:civiccoins/servizi/premio_service.dart';

class PremiScreen extends StatefulWidget {
  const PremiScreen({super.key});

  @override
  State<PremiScreen> createState() => _PremiScreenState();
}

class _PremiScreenState extends State<PremiScreen> {
  late Future<List<String>> _premi;

  @override
  void initState() {
    super.initState();
    _premi = PremioService().caricaPremi(); // Simulazione caricamento premi reali
  }
  
  //DA MODIFICARE Quando avremo un backend vero, potremo sostituirla con una GET API call.
  Future<List<String>> caricaPremi() async {
  // Simula il caricamento da backend
  return Future.delayed(const Duration(seconds: 1), () {
    return [
      "Detrazione TARI 50€",
      "Buono spesa 20€",
      "Accesso gratuito musei",
    ];
  });
}


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Premi disponibili")),
      body: FutureBuilder<List<String>>(
        future: _premi,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text("Nessun premio disponibile."));
          }

          final premi = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: premi.length,
            itemBuilder: (_, i) => Card(
              margin: const EdgeInsets.symmetric(vertical: 8),
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                title: Text(premi[i]),
                trailing: ElevatedButton(
                  onPressed: () async {
                    final success = await PremioService().riscattaPremio(premi[i]);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(success
                            ? 'Premio riscattato con successo!'
                            : 'Errore nel riscatto del premio'),
                      ),
                    );
                  },
                  child: const Text('Riscuoti'),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

