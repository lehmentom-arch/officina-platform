# Officina.ch — Karriereplattform für Apotheken (MVP)

Next.js 14 (App Router) + Supabase (Auth, Postgres, Storage). Enthält genau
den Funktionsumfang, den du festgelegt hast:

**Bewerber:** Registrierung, Login, Profil, Lebenslauf hochladen, Jobs
suchen, mit einem Klick bewerben, Favoriten, Job-Alarm, Chat.
**Arbeitgeber:** Registrierung, Firma erstellen, Stellen erstellen,
Bewerbungen ansehen, Statistiken, Chat.
**Admin:** Benutzer verwalten, Inserate freischalten, Rechnungen (Übersicht).
**Preise:** Standard / Premium / Pro.

## 1. Supabase einrichten

1. Auf [supabase.com](https://supabase.com) ein neues Projekt erstellen.
2. Im Dashboard unter **SQL Editor** den Inhalt von `supabase/schema.sql`
   einfügen und ausführen. Das legt alle Tabellen, Trigger und
   Row-Level-Security-Regeln an.
3. Unter **Storage** zwei Buckets anlegen:
   - `resumes` (kann privat bleiben — für den MVP ist `public` am
     einfachsten, damit Links direkt funktionieren; für Produktion später
     auf signierte URLs umstellen)
   - `logos` (public)
4. Unter **Project Settings → API** die Werte `Project URL` und
   `anon public key` kopieren.
5. Ersten Admin-Benutzer anlegen: normal über `/register` registrieren,
   danach in der Tabelle `profiles` das Feld `role` manuell auf `admin`
   setzen (Supabase Table Editor).

## 2. Projekt lokal einrichten

```bash
npm install
cp .env.local.example .env.local
# .env.local mit deinen Supabase-Werten füllen
npm run dev
```

Läuft dann auf `http://localhost:3000`.

## 3. Auf GitHub bringen

```bash
git init
git add .
git commit -m "Officina.ch MVP"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/officina-platform.git
git push -u origin main
```

## 4. Auf Vercel deployen

1. Auf [vercel.com](https://vercel.com) → **Add New Project** → das
   GitHub-Repo auswählen.
2. Bei **Environment Variables** die gleichen zwei Werte wie in
   `.env.local` eintragen: `NEXT_PUBLIC_SUPABASE_URL` und
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy klicken. Vercel erkennt Next.js automatisch.

Ab jetzt deployt Vercel bei jedem `git push` automatisch neu.

## Bekannte Lücken / nächste Schritte

- **Inserat-Freischaltung:** neue Stellen starten mit Status `pending`
  und müssen im Admin-Bereich (`/admin`) freigeschaltet werden, bevor sie
  auf der Startseite erscheinen — das ist Absicht (Qualitätskontrolle),
  aber gut zu wissen, falls ein Testinserat "nicht auftaucht".
- **Zahlungen:** die Preise-Seite zeigt die drei Pläne, ist aber noch nicht
  mit Stripe verbunden. Für echte Zahlungen: Stripe-Checkout-Integration
  ergänzen und bei Erfolg einen Eintrag in `invoices` anlegen.
- **Job-Alarm-Versand:** Kriterien werden gespeichert, der tatsächliche
  E-Mail-Versand braucht noch eine Supabase Edge Function mit Cron-Trigger
  (z. B. täglich neue passende Jobs prüfen und per E-Mail versenden).
- **Kantons-Logos / Kantonsübersicht, News, Blog, Sprachwechsel:**
  aus dem vorherigen Prototyp (v3) noch nicht in dieses echte Projekt
  übernommen — sag Bescheid, wenn ich das als Nächstes eins zu eins
  hier eingebaut soll.
- **KI-Funktionen (Version 2):** KI-Stelleninserate, KI-Lebenslaufbewertung,
  KI-Matching, Video-Stellenanzeigen, Gehaltsvergleich,
  Arbeitgeberbewertungen — bewusst nicht im MVP, wie besprochen.

## Warum dein "Profil erstellen" / "Inserieren" vorher nicht funktioniert hat

Der vorherige Prototyp war ein reines Frontend-Artefakt ohne Datenbank —
Formulardaten hatten nirgends einen Ort, an dem sie gespeichert werden
konnten, und "neue" Stellen erschienen deshalb nie auf der Startseite.
In diesem Projekt speichert jedes Formular direkt in Supabase, und die
Startseite lädt Jobs live aus der Datenbank.
