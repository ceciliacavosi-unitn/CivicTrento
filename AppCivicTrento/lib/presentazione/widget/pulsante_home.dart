// ======================================================
// pulsante_home.dart (presentazione/widget/)
//
// Funzione del file:
// - Widget riutilizzabile che rappresenta un pulsante circolare
//   con icona e etichetta, usato nella schermata principale.
//
// Collegamento alla struttura del progetto:
// - Si trova in `presentazione/widget/`.
// - Importato da `home_screen.dart`.
//
// Dipendenze dirette:
// - Flutter Material.
// ======================================================

import 'package:flutter/material.dart';

///
/// Pulsante della schermata Home.
///
/// Responsabilità:
/// - Mostrare:
///   - Icona (centrale, dentro un cerchio blu scuro).
///   - Etichetta di testo sotto.
/// - Gestire:
///   - Callback `onTap` quando il pulsante viene premuto.
/// - Personalizzabile con colore del testo tramite [color].
///
class PulsanteHome extends StatelessWidget {
  final IconData icon;           // Icona centrale
  final String label;            // Etichetta sotto
  final VoidCallback onTap;      // Callback al tap
  final Color? color;            // Colore personalizzabile per il testo

  const PulsanteHome({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.color, //Parametro opzionale aggiunto
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          // Cerchio con icona
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFF264A67), // Blu scuro
              shape: BoxShape.circle,
            ),
            padding: const EdgeInsets.all(12),
            child: Icon(icon, size: 30, color: Colors.white),
          ),
          const SizedBox(height: 8),
          // Etichetta testuale sotto
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: color ?? Colors.black87, //Usa il colore se presente
            ),
          ),
        ],
      ),
    );
  }
}
