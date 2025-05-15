import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/costanti.dart';
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
import '../../servizi/utente_service.dart';
import '../../dominio/gestione/sistema_autenticazione.dart'; // ✅ import necessario

class MainScreen extends StatefulWidget {
  const MainScreen({super.key, required this.email, required this.password});

  final String email;
  final String password;

  @override
  State<MainScreen> createState() => MainScreenState();
}

class MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;
  String? _initials;

  late String email;
  late String password;

  late List<Widget> _screens;

  final _titles = const [
    'Home',
    'Elenco Ricompense',
    'Dati Personali',
    'Storico Multe',
    'Storico Bollette',
    'Storico Spostamenti',
    'Impostazioni',
  ];

  void selectTab(int tabIndex) {
    setState(() {
      _selectedIndex = tabIndex;
    });
  }

  @override
  void initState() {
    super.initState();

    // ✅ Recupera da SistemaAutenticazione
    email = SistemaAutenticazione.email ?? widget.email;
    password = SistemaAutenticazione.password ?? widget.password;

    _screens = _buildScreens();
    _fetchUserInitials();
  }

  List<Widget> _buildScreens() {
    return [
      HomeScreen(email: email, password: password),
      const PremiScreen(),
      DatiCittadinoScreen(email: email, password: password),
      const StoricoMulteScreen(),
      const StoricoBolletteScreen(),
      const StoricoSpostamentiScreen(),
      const ImpostazioniScreen(),
    ];
  }

  Future<void> _fetchUserInitials() async {
    try {
      final profile = await UtenteService.fetchProfile(
        email: email,
        password: password,
      );
      final nome = profile['nome'] ?? '';
      final cognome = profile['cognome'] ?? '';
      setState(() {
        _initials = '${nome.isNotEmpty ? nome[0] : ''}${cognome.isNotEmpty ? cognome[0] : ''}'.toUpperCase();
      });
    } catch (e) {
      setState(() {
        _initials = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(80),
        child: AppBar(
          backgroundColor: theme.scaffoldBackgroundColor,
          elevation: 0,
          centerTitle: true,
          leading: Builder(
            builder: (context) => IconButton(
              icon: Icon(Icons.menu, size: 30, color: theme.iconTheme.color),
              onPressed: () => Scaffold.of(context).openDrawer(),
            ),
          ),
          title: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.asset(assetLogo, height: 44),
              const SizedBox(width: 12),
              Text(
                testoAppName,
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: GestureDetector(
                onTap: () async {
                  final nuovaPassword = await Navigator.push<String?>(
                    context,
                    MaterialPageRoute(
                      builder: (_) => AccountScreen(
                        email: email,
                        password: password,
                      ),
                    ),
                  );

                  if (nuovaPassword != null && nuovaPassword != password) {
                    print("🔐 Password aggiornata: $nuovaPassword");

                    // ✅ Salva globalmente
                    SistemaAutenticazione.login(email, nuovaPassword);

                    setState(() {
                      password = nuovaPassword;
                      _screens = _buildScreens();
                    });

                    _fetchUserInitials();
                  }
                },
                child: _initials != null
                    ? CircleAvatar(
                        radius: 18,
                        backgroundColor: theme.primaryColor,
                        foregroundColor: theme.colorScheme.onPrimary,
                        child: Text(
                          _initials!,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      )
                    : Icon(Icons.account_circle, size: 34, color: theme.iconTheme.color),
              ),
            ),
          ],
        ),
      ),
      drawer: Drawer(
        backgroundColor: theme.scaffoldBackgroundColor,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(color: theme.colorScheme.primary),
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
                setState(() => _selectedIndex = 3);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Image.asset(assetIconLight, width: 24, height: 24),
              title: const Text('Storico Bollette'),
              onTap: () {
                setState(() => _selectedIndex = 4);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Image.asset(assetIconBike, width: 24, height: 24),
              title: const Text('Storico Spostamenti'),
              onTap: () {
                setState(() => _selectedIndex = 5);
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
