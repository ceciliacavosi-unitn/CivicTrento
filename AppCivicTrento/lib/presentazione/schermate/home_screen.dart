// ======================================================
// 📄 home_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Schermata principale che mostra:
//     • Le Civic Coins accumulate.
//     • Pulsanti rapidi: Profilo/Dati, Premi, Impostazioni.
//     • Storico generico scrollabile.
// ======================================================

import 'package:flutter/material.dart';
import '../../config/costanti.dart';  // ✅ Importa le costanti
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
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accentColor = theme.colorScheme.onSurfaceVariant;

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // 🏅 Titolo Civic Coins
          Text(
            testoTitoloCoins,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: accentColor,
            ),
          ),
          const SizedBox(height: 12),

          // 💰 Numero Civic Coins + icona
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

          // 🚀 Due pulsanti rapidi (Profilo/Dati & Premi)
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

          // ⚙️ Pulsante Impostazioni
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

          // 📜 Storico Generico scrollabile
          Expanded(
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(12),
              ),
              child: DefaultTextStyle(
                style: theme.textTheme.bodyMedium!.copyWith(
                  color: accentColor,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      testoStoricoGenerico,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: ListView(
                        children: const [
                          ElementoStorico(
                            title: 'Voto amministrativo',
                            subtitle: '01/04/2025 10:00',
                            points: '+100',
                            showDot: true,
                          ),
                          ElementoStorico(
                            title: 'Multa per sosta vietata',
                            subtitle: '29/03/2025 08:45',
                            points: '-40',
                          ),
                          ElementoStorico(
                            title: 'Camminata monitorata',
                            subtitle: '28/03/2025 18:30',
                            points: '+2',
                          ),
                          ElementoStorico(
                            title: 'Bolletta elettrica\ngen/feb',
                            subtitle: '27/03/2025 09:00',
                            points: '+15',
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
