// ======================================================
// 📄 main_screen.dart (presentazione/schermate/)
//
// 📌 Funzione del file:
// - Gestisce la navigazione principale a tab.
// - Include le schermate: Home, Premi, Profilo, Storico (Multe, Bollette, Spostamenti), Impostazioni.
// - Ha anche un Drawer laterale per navigazione rapida.
//
// ======================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/costanti.dart'; // ✅ Importa le costanti
import '../widget/pulsante_home.dart';
import '../widget/storico_elemento.dart';
import 'home_screen.dart';
import 'impostazioni_screen.dart';
import 'profilo_screen.dart';
import 'premi_screen.dart';
import 'storico_bollette_screen.dart';
import 'storico_multe_screen.dart';
import 'storico_spostamenti_screen.dart';
import '../../dominio/premi/premio.dart';
import 'account_screen.dart';
/*import '../../dominio/storico/bollette.dart';
import '../../dominio/storico/multe.dart';
import '../../dominio/storico/spostamenti.dart';
import '../../dominio/utenti/utente.dart';*/
import '../../servizi/utente_service.dart';

class MainScreen extends StatefulWidget {
  final String email, password;
  const MainScreen({super.key, required this.email, required this.password});

  @override
  State<MainScreen> createState() => MainScreenState();
}

class MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;
  String? _initials;

  void selectTab(int tabIndex) {
    setState(() {
      _selectedIndex = tabIndex;
    });
  }

  late final List<Widget> _screens;

  final _titles = const [
    'Home',
    'Elenco Ricompense',
    'Dati Personali',
    'Storico Multe',
    'Storico Bollette',
    'Storico Spostamenti',
    'Impostazioni',
  ];

  @override
  void initState() {
    super.initState();
    _screens = [
      HomeScreen(email: widget.email, password: widget.password),
      const PremiScreen(),
      const StoricoMulteScreen(),
      const StoricoBolletteScreen(),
      const StoricoSpostamentiScreen(),
      const ImpostazioniScreen(),
      DatiCittadinoScreen(email: widget.email, password: widget.password),
    ];
    _fetchUserInitials();
  }

  Future<void> _fetchUserInitials() async {
    try {
      final profile = await UtenteService.fetchProfile(
        email: widget.email,
        password: widget.password,
      );
      final name = profile['name'] ?? '';
      final surname = profile['surname'] ?? '';
      setState(() {
        _initials = '${name.isNotEmpty ? name[0] : ''}${surname.isNotEmpty ? surname[0] : ''}'.toUpperCase();
      });
    } catch (e) {
      setState(() {
        _initials = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: coloreSfondoChiaro,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(80),
        child: AppBar(
          backgroundColor: coloreSfondoChiaro,
          elevation: 0,
          centerTitle: true,
          leading: Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.menu, size: 30, color: Colors.black),
              onPressed: () => Scaffold.of(context).openDrawer(),
            ),
          ),
          title: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.asset(assetLogo, height: 44),
              const SizedBox(width: 12),
              const Text(
                testoAppName,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ],
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => AccountScreen(
                        email: widget.email,
                        password: widget.password,
                      ),
                    ),
                  );
                },
                child: _initials != null
                    ? CircleAvatar(
                        radius: 18,
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        child: Text(
                          _initials!,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      )
                    : const Icon(Icons.account_circle, size: 34, color: Colors.black),
              ),
            ),
          ],
        ),
      ),
      drawer: Drawer(
        backgroundColor: coloreSfondoChiaro,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: colorePrimario),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(assetLogo, height: 80, color: Colors.white),
                  const SizedBox(height: 12),
                  Text(
                    testoAppName,
                    style: GoogleFonts.contrailOne(
                      textStyle: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: Image.asset(assetCivicCoins, width: 24, height: 24),
              title: const Text('Home'),
              onTap: () {
                setState(() => _selectedIndex = 0);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Image.asset(assetIconPolice, width: 24, height: 24),
              title: const Text('Storico Multe'),
              onTap: () {
                setState(() => _selectedIndex = 2);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Image.asset(assetIconLight, width: 24, height: 24),
              title: const Text('Storico Bollette'),
              onTap: () {
                setState(() => _selectedIndex = 3);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Image.asset(assetIconBike, width: 24, height: 24),
              title: const Text('Storico Spostamenti'),
              onTap: () {
                setState(() => _selectedIndex = 4);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
      body: SafeArea(child: _screens[_selectedIndex]),
    );
  }
}
