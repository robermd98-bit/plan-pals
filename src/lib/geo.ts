export function normalizeCity(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Coincidencia por texto: comprueba si el nombre de la ciudad aparece en la ubicación del plan. */
export function locationMatchesCity(location: string, city: string): boolean {
  if (!city) return true;
  return normalizeCity(location).includes(normalizeCity(city));
}

/** Extrae la "ciudad" de una ubicación tipo "Club Pádel Retiro, Madrid" -> "Madrid". */
export function cityFromLocation(location: string): string {
  const parts = location.split(",");
  return parts[parts.length - 1]?.trim() || location.trim();
}
