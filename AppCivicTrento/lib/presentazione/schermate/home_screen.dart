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
import '../../servizi/utente_service.dart';
import '../../servizi/cittadino_service.dart';
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
  int saldo = 800;

  @override
  void initState() {
    super.initState();
    caricaStorico();
    caricaSaldo();
  }

  String formattaData(String iso) {
    return DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(iso));
  }

  Future<void> caricaSaldo() async {
    try {
      final profilo = await UtenteService.fetchProfile();
      debugPrint('PROFILO: $profilo');
      final valore = int.tryParse(profilo['saldo'].toString()) ?? 0;
      debugPrint('SALDO PARSATO: $valore');
      setState(() {
        saldo = valore;
      });
    } catch (e) {
      debugPrint('Errore caricamento saldo: $e');
    }
  }


  Future<void> caricaStorico() async {
    try {
      final risultato = await CittadinoService.fetchStorico();
      final List<dynamic> storicoApi = risultato['storico'] ?? [];


      final unificato = storicoApi.map<Map<String, dynamic>>((voce) {
        final azione = voce['azione'] ?? 'Azione sconosciuta';
        final data = voce['data'] ?? DateTime.now().toIso8601String();
        final punti = voce['saldo']?.toString() ?? '';
        String dettagliTesto = '';

        switch (azione) {
          case 'Pagamento bolletta':
            dettagliTesto = 'Tipo: ${voce['tipo']}\nImporto: ${voce['importo']}\nPunti: $punti';
            break;
          case 'Percorso sostenibile':
            dettagliTesto = 'Distanza: ${voce['distanza_km']} km\nPunti: $punti';
            break;
          case 'Multa':
            dettagliTesto = 'Gravità: ${voce['gravita']}\nMotivo: ${voce['motivo'] ?? 'non specificato'}\nPunti: $punti';
            break;
          case 'Voto elettorale':
            dettagliTesto = 'Elezione: ${voce['tipo'] ?? 'non specificato'}\nPunti: $punti';
            break;
          case 'Abbonamento mezzi pubblici':
            dettagliTesto = 'Codice: ${voce['codice'] ?? 'N/A'}\nPunti: $punti';
            break;
          case 'Saldo Iniziale':
            dettagliTesto = 'Assegnazione automatica saldo iniziale.\nPunti: $punti';
            break;
          case 'Bonus annuale':
            dettagliTesto = 'Anno: ${voce['anno'] ?? 'corrente'}\nPunti: $punti';
            break;
          default:
            final dettagli = Map<String, dynamic>.from(voce)
              ..remove('azione')
              ..remove('data');
            dettagliTesto = dettagli.entries.map((e) => '${e.key}: ${e.value}').join('\n');
        }

        return {
          'titolo': azione,
          'data': data,
          'punti': punti,
          'sottotitolo': dettagliTesto,
          'showDot': false,
        };
      }).toList();

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
                saldo.toString(),
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
