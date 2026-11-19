import { createSign } from "node:crypto";

/**
 * Pembaca Google Sheets lewat service account (hanya di server, dipakai lib/peserta.ts).
 * Env: GOOGLE_SA_EMAIL dan GOOGLE_SA_PRIVATE_KEY (isi "private_key" dari berkas JSON service account; "\n" boleh ditulis literal).
 * Spreadsheet harus di-share ke GOOGLE_SA_EMAIL sebagai Viewer. Akses hanya baca (scope spreadsheets.readonly).
 * Tanpa dependensi: JWT RS256 ditandatangani node:crypto lalu ditukar ke access token Google.
 */
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

let cached: { token: string; until: number } | null = null;

export function sheetsConfigured() {
  return Boolean(process.env.GOOGLE_SA_EMAIL && process.env.GOOGLE_SA_PRIVATE_KEY);
}

async function accessToken(): Promise<string> {
  if (cached && cached.until > Date.now()) return cached.token;
  const email = process.env.GOOGLE_SA_EMAIL;
  const key = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("GOOGLE_SA_EMAIL atau GOOGLE_SA_PRIVATE_KEY belum diisi");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }))}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key).toString("base64url");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
  });
  if (!res.ok) throw new Error(`Token Google ditolak (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  // Diperbarui satu menit sebelum kedaluwarsa.
  cached = { token: data.access_token, until: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${SHEETS_URL}/${path}`, { headers: { authorization: `Bearer ${await accessToken()}` } });
  if (!res.ok) throw new Error(`Google Sheets membalas ${res.status} untuk ${path.split("?")[0]}`);
  return (await res.json()) as T;
}

/** Judul semua sheet di satu spreadsheet, urut seperti di tab. */
export async function sheetTitles(spreadsheetId: string): Promise<string[]> {
  const data = await get<{ sheets: { properties: { title: string } }[] }>(`${spreadsheetId}?fields=sheets.properties.title`);
  return data.sheets.map((s) => s.properties.title);
}

/** Nama sheet di notasi A1, dengan kutip tunggal digandakan. */
const quote = (title: string) => `'${title.replace(/'/g, "''")}'`;

/** Indeks kolom (0 = A) ke huruf kolom. */
function columnLetter(i: number): string {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

async function batchGet(spreadsheetId: string, ranges: string[], dimension: "ROWS" | "COLUMNS"): Promise<string[][][]> {
  if (!ranges.length) return [];
  const qs = new URLSearchParams({ majorDimension: dimension, valueRenderOption: "FORMATTED_VALUE" });
  for (const r of ranges) qs.append("ranges", r);
  const data = await get<{ valueRanges: { values?: string[][] }[] }>(`${spreadsheetId}/values:batchGet?${qs}`);
  return data.valueRanges.map((v) => v.values ?? []);
}

export type SheetRows = { title: string; rows: Record<string, string>[] };

/**
 * Membaca hanya kolom yang judulnya ada di `headers` dari setiap sheet di `titles`. Kolom lain (email, nomor HP) tidak pernah diminta.
 * Langkah 1 membaca baris judul; langkah 2 meminta kolom yang cocok saja, mulai baris 2.
 * Judul yang muncul lebih dari sekali diberi akhiran urutan: "Keterangan", "Keterangan#2".
 * Sheet yang tidak memiliki semua judul di `required` dilewati.
 */
export async function readColumns(spreadsheetId: string, titles: string[], headers: readonly string[], required: readonly string[] = headers): Promise<SheetRows[]> {
  const heads = await batchGet(
    spreadsheetId,
    titles.map((t) => `${quote(t)}!1:1`),
    "ROWS",
  );
  const plans = titles
    .map((title, i) => {
      const seen = new Map<string, number>();
      const cols: { key: string; index: number }[] = [];
      (heads[i][0] ?? []).forEach((raw, index) => {
        const name = raw.trim();
        const n = (seen.get(name) ?? 0) + 1;
        seen.set(name, n);
        const key = n === 1 ? name : `${name}#${n}`;
        if (headers.includes(key)) cols.push({ key, index });
      });
      return { title, cols };
    })
    .filter((p) => required.every((h) => p.cols.some((c) => c.key === h)));

  const ranges = plans.flatMap((p) => p.cols.map((c) => `${quote(p.title)}!${columnLetter(c.index)}2:${columnLetter(c.index)}`));
  const columns = await batchGet(spreadsheetId, ranges, "COLUMNS");

  let k = 0;
  return plans.map((p) => {
    const values = p.cols.map((c) => ({ key: c.key, cells: columns[k++]?.[0] ?? [] }));
    const length = Math.max(0, ...values.map((v) => v.cells.length));
    const rows = Array.from({ length }, (_, r) => Object.fromEntries(values.map((v) => [v.key, (v.cells[r] ?? "").trim()])));
    return { title: p.title, rows };
  });
}
