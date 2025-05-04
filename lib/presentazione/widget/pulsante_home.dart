// ======================================================
// 📄 pulsante_home.dart (presentazione/widget/)
//
// 📌 Funzione del file:
// - Widget riutilizzabile che rappresenta un pulsante circolare
//   con icona e etichetta, usato nella schermata principale.
//
// 📦 Collegamento alla struttura del progetto:
// - Si trova in `presentazione/widget/`.
// - Importato da `home_screen.dart`.
//
// ✅ Dipendenze dirette:
// - Flutter Material.
//
// ======================================================

import 'package:flutter/material.dart';

///
/// 🏠 Pulsante della schermata Home.
///
/// 🔑 Responsabilità:
/// - Mostrare:
///   - ✅ Icona (centrale, dentro un cerchio blu scuro).
///   - ✅ Etichetta di testo sotto.
/// - Gestire:
///   - ✅ Callback `onTap` quando il pulsante viene premuto.
///
/// 🛠️ Dettagli implementativi:
/// - Usa un `GestureDetector` per catturare i tap.
/// - L'icona è grande (30 px) e colorata di bianco.
/// - Il contenitore ha forma circolare e colore di sfondo blu scuro.
/// - L'etichetta ha font size 14 e colore nero (87% opacità).
///
/// 👉 Esempio di utilizzo:
/// ```dart
/// PulsanteHome(
///   icon: Icons.directions_bike,
///   label: 'Spostamenti',
///   onTap: () {
///     Navigator.push(...);
///   },
/// )
/// ```
class PulsanteHome extends StatelessWidget {
  final IconData icon; // Icona da mostrare (es: Icons.person)
  final String label; // Etichetta sotto l'icona
  final VoidCallback onTap; // Funzione callback quando premuto

  const PulsanteHome({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          // 🔘 Contenitore circolare con l'icona
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFF264A67), // Blu scuro
              shape: BoxShape.circle,
            ),
            padding: const EdgeInsets.all(12),
            child: Icon(icon, size: 30, color: Colors.white),
          ),
          const SizedBox(height: 8),
          // 🏷️ Testo sotto l'icona
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}
