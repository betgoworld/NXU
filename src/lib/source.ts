/** Deriva a "origem" legível de um lead a partir de UTM e referrer. */
export function deriveSource(utmSource?: string | null, referrer?: string | null): string {
  if (utmSource) return utmSource.toLowerCase().slice(0, 60);
  if (!referrer) return "direto";
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "outro";
  }
  const known: [RegExp, string][] = [
    [/instagram\.com$|^l\.instagram\.com$/, "instagram"],
    [/tiktok\.com$/, "tiktok"],
    [/facebook\.com$|fb\.com$|^l\.facebook\.com$|^lm\.facebook\.com$/, "facebook"],
    [/google\./, "google"],
    [/whatsapp\.com$|wa\.me$/, "whatsapp"],
    [/youtube\.com$|youtu\.be$/, "youtube"],
    [/t\.co$|x\.com$|twitter\.com$/, "x"],
    [/pinterest\./, "pinterest"],
  ];
  for (const [re, name] of known) if (re.test(host)) return name;
  return host.slice(0, 60);
}
