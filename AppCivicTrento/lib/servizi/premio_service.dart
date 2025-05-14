Future<bool> riscattaPremio(String premioId) async {
  final response = await http.post(
    Uri.parse('${ApiEndpoints.premi}/riscatta/$premioId'),
    headers: {"Content-Type": "application/json"},
  );
  return response.statusCode == 200;
}
