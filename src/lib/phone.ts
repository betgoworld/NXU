/** Utilitários de telefone brasileiro (WhatsApp). Sem dependências — usado no cliente e no servidor. */

export const BR_COUNTRY_CODE = "+55";

/** Aplica a máscara (00) 00000-0000 enquanto a pessoa digita. */
export function maskBrPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length < 3) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const split = d.length === 11 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

/**
 * Normaliza para E.164 (+5522999999999). Retorna null se inválido.
 * Aceita entrada com ou sem +55, com máscara, espaços ou traços.
 */
export function normalizeBrPhone(input: string): string | null {
  let d = (input || "").replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) return null;
  if (d.length !== 10 && d.length !== 11) return null;

  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99 || d[1] === "0") return null;

  const subscriber = d.slice(2);
  if (subscriber.length === 9 && subscriber[0] !== "9") return null; // celular começa com 9
  if (subscriber.length === 8 && !/[2-5]/.test(subscriber[0])) return null; // fixo começa com 2–5
  if (/^(\d)\1+$/.test(subscriber)) return null; // 99999-9999, 00000-0000…

  return `${BR_COUNTRY_CODE}${d}`;
}

export function isValidName(name: string): boolean {
  const n = name.trim().replace(/\s+/g, " ");
  return n.length >= 2 && n.length <= 80 && /\p{L}/u.test(n);
}
