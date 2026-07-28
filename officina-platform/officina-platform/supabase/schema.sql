-- ==========================================================
-- Officina.ch — Supabase Schema
-- Im Supabase Dashboard unter "SQL Editor" ausführen.
-- ==========================================================

-- 1) PROFILES (1 Zeile pro auth.users, Rolle: candidate | employer | admin)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('candidate','employer','admin')) default 'candidate',
  first_name text,
  last_name text,
  email text,
  profession text,       -- apotheker | pharma_assistent | praktikum
  canton text,
  languages text[],
  cv_url text,
  created_at timestamptz default now()
);

-- Trigger: bei neuer Registrierung automatisch ein Profil anlegen
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'candidate'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2) COMPANIES
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  canton text,
  place text,
  description text,
  logo_url text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- 3) JOBS
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  title text not null,
  profession text not null,       -- apotheker | pharma_assistent | praktikum
  canton text,
  place text,
  employment_type text,           -- Festanstellung | Teilzeit | Praktikum | Springer
  description text,
  status text not null default 'pending' check (status in ('pending','published','closed')),
  is_springer boolean default false,
  springer_duration text,
  created_at timestamptz default now()
);

-- 4) APPLICATIONS
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  candidate_id uuid references profiles(id) on delete cascade,
  status text not null default 'new' check (status in ('new','review','interview','rejected','hired')),
  cover_note text,
  created_at timestamptz default now(),
  unique (job_id, candidate_id)
);

-- 5) FAVORITES
create table if not exists favorites (
  candidate_id uuid references profiles(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (candidate_id, job_id)
);

-- 6) JOB ALERTS
create table if not exists job_alerts (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references profiles(id) on delete cascade,
  canton text,
  profession text,
  created_at timestamptz default now()
);

-- 7) MESSAGES (Chat je Bewerbung)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- 8) INVOICES (Platzhalter für Admin/Abrechnung)
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  plan text not null check (plan in ('standard','premium','pro')),
  amount_chf numeric not null,
  status text not null default 'open' check (status in ('open','paid','overdue')),
  created_at timestamptz default now()
);

-- ==========================================================
-- Storage Buckets (im Dashboard unter Storage anlegen, falls
-- das SQL-Kommando in deinem Projekt nicht direkt läuft):
--   resumes  (private)
--   logos    (public)
-- ==========================================================

-- ==========================================================
-- ROW LEVEL SECURITY
-- ==========================================================
alter table profiles enable row level security;
alter table companies enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table favorites enable row level security;
alter table job_alerts enable row level security;
alter table messages enable row level security;
alter table invoices enable row level security;

-- Profiles: jede:r sieht/bearbeitet nur das eigene Profil
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Companies: Arbeitgeber sieht/verwaltet eigene Firma, alle dürfen veröffentlichte Firmen lesen
create policy "companies_select_all" on companies for select using (true);
create policy "companies_insert_own" on companies for insert with check (auth.uid() = owner_id);
create policy "companies_update_own" on companies for update using (auth.uid() = owner_id);

-- Jobs: veröffentlichte Jobs sind öffentlich lesbar, Besitzer verwaltet eigene Jobs
create policy "jobs_select_published" on jobs for select using (
  status = 'published' or company_id in (select id from companies where owner_id = auth.uid())
);
create policy "jobs_insert_own_company" on jobs for insert with check (
  company_id in (select id from companies where owner_id = auth.uid())
);
create policy "jobs_update_own_company" on jobs for update using (
  company_id in (select id from companies where owner_id = auth.uid())
);

-- Applications: Kandidat:in sieht eigene Bewerbungen, Arbeitgeber sieht Bewerbungen auf eigene Jobs
create policy "applications_select" on applications for select using (
  candidate_id = auth.uid()
  or job_id in (select j.id from jobs j join companies c on j.company_id = c.id where c.owner_id = auth.uid())
);
create policy "applications_insert_own" on applications for insert with check (candidate_id = auth.uid());
create policy "applications_update_employer" on applications for update using (
  job_id in (select j.id from jobs j join companies c on j.company_id = c.id where c.owner_id = auth.uid())
);

-- Favorites: nur eigene
create policy "favorites_all_own" on favorites for all using (candidate_id = auth.uid());

-- Job alerts: nur eigene
create policy "alerts_all_own" on job_alerts for all using (candidate_id = auth.uid());

-- Messages: nur Beteiligte der zugehörigen Bewerbung
create policy "messages_select" on messages for select using (
  application_id in (
    select a.id from applications a
    left join jobs j on a.job_id = j.id
    left join companies c on j.company_id = c.id
    where a.candidate_id = auth.uid() or c.owner_id = auth.uid()
  )
);
create policy "messages_insert" on messages for insert with check (sender_id = auth.uid());

-- Invoices: nur die eigene Firma sieht ihre Rechnungen (Admin-Zugriff separat über Service Role)
create policy "invoices_select_own_company" on invoices for select using (
  company_id in (select id from companies where owner_id = auth.uid())
);
