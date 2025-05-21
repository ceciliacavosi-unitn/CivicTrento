// ======================================================
// storico_elemento.dart (presentazione/widget/)
//
// Funzione del file:
// - Rappresenta un singolo elemento della lista dello storico
//   (operazioni registrate come multe, bollette, spostamenti).
//
// Collegamento alla struttura del progetto:
// - Si trova in `presentazione/widget/`.
// - Utilizzato da:
//   - storico_bollette_screen.dart
//   - storico_multe_screen.dart
//   - storico_spostamenti_screen.dart
//
// Dipendenze dirette:
// - Flutter Material (UI base).
// - Asset locale: `assets/images/civic_coin.png` (icona moneta).
//
// ======================================================

import 'package:flutter/material.dart';

///
/// 🪙 Widget che rappresenta un singolo elemento visivo dello storico.
///
/// Responsabilità principali:
/// - Visualizzare:
///   - Titolo (nome dell’operazione o evento registrato).
///   - Data/ora (sottotitolo).
///   - Punti guadagnati o persi (con + o -).
///   - Icona CivicCoins accanto ai punti.
/// - Colora dinamicamente i punti:
///   - Verde ➔ punti positivi (premio guadagnato).
///   - Rosso ➔ punti negativi (ad esempio penalità o storno).
/// - Mostra un piccolo dot rosso opzionale (es. per notificare stato nuovo/non letto).
///
/// Dettagli implementativi:
/// - È costruito su `ListTile`, incapsulato in un `Material` con bordi arrotondati.
/// - Asset immagine caricato da locale (verifica che sia incluso in `pubspec.yaml`).
/// - Opzionale: estendibile con gesture (onTap, onLongPress…) in futuro.
///
/// Esempio di utilizzo:
/// ```dart
/// ElementoStorico(
///   title: 'Pagamento bolletta elettrica',
///   subtitle: '27/03/2025 09:00',
///   points: '+3',
/// )
/// ```
class ElementoStorico extends StatelessWidget {
  final String title;      // Titolo principale (es: Pagamento multa)
  final String subtitle;   // Data/ora o dettagli secondari
  final String points;     // Punti (+3, -2 ecc.)
  final bool showDot;      // Mostra un dot rosso opzionale accanto al titolo

  const ElementoStorico({
    super.key,
    required this.title,
    required this.subtitle,
    required this.points,
    this.showDot = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context); // Recupera il tema corrente
    final isNegative = points.startsWith('-'); // Determina se è una penalità
    final cleanPts = points.replaceAll(RegExp(r'[^0-9+-]'), ''); // Pulisce simboli

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0, horizontal: 4.0),
      child: Material(
        color: theme.colorScheme.surface, // Sfondo adattivo al tema
        elevation: 1.5,
        borderRadius: BorderRadius.circular(12),
        child: ListTile(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),

          //TITOLO: principale + dot opzionale
          title: Row(
            children: [
              Text(
                title,
                style: theme.textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              if (showDot)
                Padding(
                  padding: const EdgeInsets.only(left: 6),
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),

          // SOTTOTITOLO: data o dettagli secondari
          subtitle: Text(
            subtitle,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),

          // TRAILING: punti + icona CivicCoin
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Punti (con colore dinamico)
              Text(
                cleanPts,
                style: TextStyle(
                  color: isNegative ? Colors.red : Colors.green,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),

              const SizedBox(width: 4),

              // Icona CivicCoin (asset locale)
              ColorFiltered(
                colorFilter: ColorFilter.mode(
                  isNegative ? Colors.red : Colors.green,
                  BlendMode.srcIn, // Colora l'icona in base ai punti
                ),
                child: Image.asset(
                  'assets/images/civic_coin.png',
                  width: 20,
                  height: 20,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
