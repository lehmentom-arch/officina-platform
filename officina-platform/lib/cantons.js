// Zentrale Liste aller 26 Schweizer Kantone mit Wikimedia-Commons-Flaggenbild.
// flagFile verweist auf Special:FilePath (offizieller Hotlink-Weg von Wikimedia) —
// falls ein Dateiname doch nicht exakt stimmt, greift in der UI ein Fallback auf
// ein Kürzel-Badge, sodass nie ein kaputtes Bild sichtbar wird.

export const CANTONS = [
  { code: "ZH", name: "Zürich", flagFile: "Flag of Canton of Zürich.svg" },
  { code: "BE", name: "Bern", flagFile: "Flag of Canton of Bern.svg" },
  { code: "LU", name: "Luzern", flagFile: "Flag of Canton of Lucerne.svg" },
  { code: "UR", name: "Uri", flagFile: "Flag of Canton of Uri.svg" },
  { code: "SZ", name: "Schwyz", flagFile: "Flag of Canton of Schwyz.svg" },
  { code: "OW", name: "Obwalden", flagFile: "Flag of Canton of Obwalden.svg" },
  { code: "NW", name: "Nidwalden", flagFile: "Flag of Canton of Nidwalden.svg" },
  { code: "GL", name: "Glarus", flagFile: "Flag of Canton of Glarus.svg" },
  { code: "ZG", name: "Zug", flagFile: "Flag of Canton of Zug.svg" },
  { code: "FR", name: "Freiburg", flagFile: "Flag of Canton of Fribourg.svg" },
  { code: "SO", name: "Solothurn", flagFile: "Flag of Canton of Solothurn.svg" },
  { code: "BS", name: "Basel-Stadt", flagFile: "Flag of Canton of Basel-Stadt.svg" },
  { code: "BL", name: "Basel-Landschaft", flagFile: "Flag of Canton of Basel-Landschaft.svg" },
  { code: "SH", name: "Schaffhausen", flagFile: "Flag of Canton of Schaffhausen.svg" },
  { code: "AR", name: "Appenzell Ausserrhoden", flagFile: "Flag of Canton of Appenzell Ausserrhoden.svg" },
  { code: "AI", name: "Appenzell Innerrhoden", flagFile: "Flag of Canton of Appenzell Innerrhoden.svg" },
  { code: "SG", name: "St. Gallen", flagFile: "Flag of Canton of St. Gallen.svg" },
  { code: "GR", name: "Graubünden", flagFile: "Flag of Canton of Graubünden.svg" },
  { code: "AG", name: "Aargau", flagFile: "Flag of Canton of Aargau.svg" },
  { code: "TG", name: "Thurgau", flagFile: "Flag of Canton of Thurgau.svg" },
  { code: "TI", name: "Tessin", flagFile: "Flag of Canton of Ticino.svg" },
  { code: "VD", name: "Waadt", flagFile: "Flag of Canton of Vaud.svg" },
  { code: "VS", name: "Wallis", flagFile: "Flag of Canton of Valais.svg" },
  { code: "NE", name: "Neuenburg", flagFile: "Flag of Canton of Neuchâtel.svg" },
  { code: "GE", name: "Genf", flagFile: "Flag of Canton of Geneva.svg" },
  { code: "JU", name: "Jura", flagFile: "Flag of Canton of Jura.svg" },
];

export function flagUrl(flagFile, width = 60) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(flagFile)}?width=${width}`;
}
