// ======================================================
// 📄 home_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Schermata principale che mostra:
//     • Le Civic Coins accumulate.
//     • Pulsanti rapidi: Profilo/Dati, Premi, Impostazioni.
//     • Storico generico scrollabile.
//
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
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // 🏅 Titolo Civic Coins
          Text(
            testoTitoloCoins,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: colorePrimario,
            ),
          ),
          const SizedBox(height: 12),

          // 💰 Numero Civic Coins + icona
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                '900',  // 👀 Valore mockup fisso, da rendere dinamico in futuro
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: colorePrimario,
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
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ImpostazioniScreen(),
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
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    testoStoricoGenerico,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: colorePrimario,
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
        ],
      ),
    );
  }
}
