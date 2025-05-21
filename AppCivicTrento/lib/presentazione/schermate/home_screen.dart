// ======================================================
// home_screen.dart (versione aggiornata)
//
// Mostra lo storico dei comportamenti civici usando email/password,
//     formattando i dati secondo i punteggi configurati in storico.json.
// ======================================================

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/costanti.dart';
import '../../servizi/storico_service.dart';
import '../widget/pulsante_home.dart';
import '../widget/storico_elemento.dart';
import 'main_screen.dart';
import 'profilo_screen.dart';
import 'impostazioni_screen.dart';

class HomeScreen extends StatefulWidget {
  final String email;
  final String password;

  const HomeScreen({
    super.key,
    required this.email,
    required this.password,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Map<String, dynamic>> storico = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    caricaStorico();
  }

  String formattaData(String iso) {
    return DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(iso));
  }

  Future<void> caricaStorico() async {
    try {
      final email = widget.email;
      final password = widget.password;

      final unificato = <Map<String, dynamic>>[];

      // Voto elettorale
      final voto = await StoricoService.getStoricoVoto(email: email, password: password);
      if (voto['punti'] != null) {
        unificato.add({
          'titolo': 'Voto elettorale',
          'data': '2025-04-10T09:30:00', // ← data fissa da json
          'punti': '+100',
          'showDot': true,
        });
      }

      // Bolletta
      final bolletta = await StoricoService.getStoricoBolletta(
        email: email,
        password: password,
        tipo: 'elettrica',
      );

      if (bolletta['tipo'] != null) {
        final tipo = bolletta['tipo'];
        final punti = {
          'acqua': 10,
          'elettrica': 15,
          'gas': 15,
        }[tipo] ?? 0;

        unificato.add({
          'titolo': 'Pagamento bolletta $tipo',
          'data': '2025-04-01T10:00:00',
          'punti': '+$punti',
        });
      }

      // Spostamento sostenibile
      final movimento = await StoricoService.getStoricoMovimento(email: email, password: password);
      if (movimento['distanza_km'] != null) {
        final distanza = double.tryParse(movimento['distanza_km'].toString()) ?? 0;
        final punti = distanza <= 5 ? 0.5 : 1.0;

        unificato.add({
          'titolo': 'Percorso sostenibile (${distanza.toStringAsFixed(1)} km)',
          'data': '2025-04-03T08:45:00',
          'punti': '+${punti.toString()}',
        });
      }

      // Abbonamento mezzi pubblici
      final trasporti = await StoricoService.getStoricoTrasporti(email: email, password: password);
      if (trasporti['punti'] != null) {
        unificato.add({
          'titolo': 'Abbonamento mezzi pubblici',
          'data': '2025-03-15T12:00:00',
          'punti': '+50',
        });
      }

      // Multe
      final multa = await StoricoService.getStoricoMulte(email: email, password: password);
      if (multa['gravita'] != null) {
        final gravita = multa['gravita'];
        final dataMulta = multa['dataUltimaMulta'] ?? '2025-03-28T14:20:00';
        String punti;
        if (gravita == 'gravi') {
          punti = 'saldo azzerato';
        } else if (gravita == 'medie') {
          punti = '-40';
        } else {
          punti = 'errore';
        }

        unificato.add({
          'titolo': 'Multa ($gravita)',
          'data': dataMulta,
          'punti': punti,
        });
      }

      unificato.sort((a, b) => DateTime.parse(b['data']).compareTo(DateTime.parse(a['data'])));

      setState(() {
        storico = unificato;
        isLoading = false;
      });
    } catch (e) {
      debugPrint('Errore caricamento storico: $e');
      setState(() => isLoading = false);
    }
  }


  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accentColor = theme.colorScheme.onSurfaceVariant;

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            testoTitoloCoins,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: accentColor,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '800',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: accentColor,
                ),
              ),
              const SizedBox(width: 8),
              Image.asset(
                assetCivicCoins,
                width: 32,
                height: 32,
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              PulsanteHome(
                icon: Icons.person,
                label: 'Aggiungi/Modifica Dati',
                color: accentColor,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DatiCittadinoScreen(
                        email: widget.email,
                        password: widget.password,
                      ),
                    ),
                  );
                },
              ),
              PulsanteHome(
                icon: Icons.card_giftcard,
                label: 'Premi',
                color: accentColor,
                onTap: () {
                  final state = context.findAncestorStateOfType<MainScreenState>()!;
                  state.selectTab(1);
                },
              ),
            ],
          ),
          const SizedBox(height: 16),
          Center(
            child: PulsanteHome(
              icon: Icons.settings,
              label: 'Impostazioni',
              color: accentColor,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const ImpostazioniScreen(),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(12),
              ),
              child: isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : storico.isEmpty
                      ? const Center(child: Text('Nessuna attività registrata.'))
                      : ListView.builder(
                          itemCount: storico.length,
                          itemBuilder: (context, index) {
                            final e = storico[index];
                            return ElementoStorico(
                              title: e['titolo'],
                              subtitle: formattaData(e['data']),
                              points: e['punti'],
                              showDot: e['showDot'] ?? false,
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}
