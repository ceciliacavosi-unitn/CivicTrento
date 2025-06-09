// ======================================================
// premi_screen.dart (presentazione/schermate/)
//
// Funzione del file:
// - Mostra i premi disponibili caricati dal backend.
// - Permette di riscattare un premio con un tap.
//
// Debug incluso:
// - Caricamento premi, errori, premi visualizzati e riscatto.
// ======================================================

import 'package:flutter/material.dart';
import 'package:civiccoins/servizi/premio_service.dart';

class PremiScreen extends StatefulWidget {
  const PremiScreen({super.key});

  @override
  State<PremiScreen> createState() => _PremiScreenState();
}

class _PremiScreenState extends State<PremiScreen> {
  late Future<List<Map<String, dynamic>>> _premi;

  @override
  void initState() {
    super.initState();
    print("🔄 [initState] Avvio caricamento premi...");
    _premi = PremioService().fetchPremi();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Premi disponibili")),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _premi,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            print("[FutureBuilder] In attesa dei dati...");
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            print("[FutureBuilder] Errore: ${snapshot.error}");
            return Center(child: Text("Errore: ${snapshot.error}"));
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            print("[FutureBuilder] Nessun premio trovato");
            return const Center(child: Text("Nessun premio disponibile."));
          }

          final premi = snapshot.data!;
          print("[FutureBuilder] Premi ricevuti: ${premi.length}");

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: premi.length,
            itemBuilder: (_, i) {
              final premio = premi[i];
              final id = premio['id'].toString();
              final nome = premio['nome'];
              final descrizione = premio['descrizione'];
              final costo = premio['costoCivicCoins'];

              print("Premio $i → ID: $id | Nome: $nome | Costo: $costo");

              return Card(
                margin: const EdgeInsets.symmetric(vertical: 8),
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ListTile(
                  title: Text(nome),
                  subtitle: Text("$descrizione\nCosto: $costo CivicCoins"),
                  isThreeLine: true,
                  trailing: ElevatedButton(
                    onPressed: () async {
                      print("[Riscuoti] Toccato premio con ID: $id");
                      final success = await PremioService().riscattaPremio(id);
                      print(success
                          ? "Premio $id riscattato con successo"
                          : "Errore durante il riscatto di $id");

                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            success
                                ? 'Premio riscattato con successo!'
                                : 'Errore nel riscatto del premio',
                          ),
                        ),
                      );
                    },
                    child: const Text("Riscuoti"),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
