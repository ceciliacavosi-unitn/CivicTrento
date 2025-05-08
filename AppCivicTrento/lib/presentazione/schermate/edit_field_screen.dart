// ======================================================
// 📄 edit_field_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Schermata semplice e generica per modificare un singolo campo di testo.
// - Riceve:
//     • label: la descrizione del campo (es. "Nome").
//     • initialValue: il valore precompilato del campo.
// - Alla conferma ("Salva"), restituisce il nuovo valore con Navigator.pop().
//
// ======================================================

import 'package:flutter/material.dart';

/// ✏️ Schermata per modificare un singolo campo di input.
///
/// Parametri obbligatori:
/// - [label]: titolo del campo da modificare.
/// - [initialValue]: valore iniziale del campo.
class EditSingleFieldScreen extends StatefulWidget {
  final String label;
  final String initialValue;

  const EditSingleFieldScreen({
    super.key,
    required this.label,
    required this.initialValue,
  });

  @override
  State<EditSingleFieldScreen> createState() => _EditSingleFieldScreenState();
}

class _EditSingleFieldScreenState extends State<EditSingleFieldScreen> {
  // Controller per gestire il valore inserito nel TextField.
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    // Inizializza il controller con il valore iniziale passato al widget.
    _controller = TextEditingController(text: widget.initialValue);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Modifica ${widget.label}'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Campo di input per la modifica del valore.
            TextField(
              controller: _controller,
              decoration: InputDecoration(labelText: widget.label),
            ),
            const SizedBox(height: 20),

            // Pulsante per confermare e salvare la modifica.
            ElevatedButton(
              onPressed: () => Navigator.pop(context, _controller.text),
              child: const Text('Salva'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    // Libera le risorse del controller.
    _controller.dispose();
    super.dispose();
  }
}
