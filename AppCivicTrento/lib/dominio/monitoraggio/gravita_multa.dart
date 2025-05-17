enum GravitaMulta {
  lieve,
  media,
  grave,
}

extension GravitaMultaExtension on GravitaMulta {
  int get punteggio {
    switch (this) {
      case GravitaMulta.lieve:
        return -40;
      case GravitaMulta.media:
        return -40;
      case GravitaMulta.grave:
        return -999999; // Placeholder: backend deve azzerare il saldo
    }
  }

  bool get azzeraSaldo {
    return this == GravitaMulta.grave;
  }
}
