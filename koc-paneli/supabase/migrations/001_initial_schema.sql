-- Kullanıcı profilleri
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('coach', 'student')),
  avatar_url text,
  bio text,
  created_at timestamptz default now() not null
);

-- Paketler
create table public.packages (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references public.profiles on delete cascade not null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration_days integer not null,
  features text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now() not null
);

-- Koç-Öğrenci ilişkisi
create table public.coach_students (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references public.profiles on delete cascade not null,
  student_id uuid references public.profiles on delete cascade not null,
  package_id uuid references public.packages on delete set null,
  start_date date not null,
  end_date date,
  status text default 'active' check (status in ('active', 'paused', 'completed')),
  payment_status text default 'pending' check (payment_status in ('paid', 'pending', 'failed')),
  created_at timestamptz default now() not null,
  unique(coach_id, student_id)
);

-- İlerleme kayıtları
create table public.progress_entries (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles on delete cascade not null,
  coach_id uuid references public.profiles on delete cascade not null,
  date date not null,
  weight numeric(5,2),
  note text,
  custom_metrics jsonb default '{}',
  created_at timestamptz default now() not null
);

-- Programlar (PDF)
create table public.programs (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references public.profiles on delete cascade not null,
  student_id uuid references public.profiles on delete cascade not null,
  title text not null,
  description text,
  file_url text not null,
  file_name text not null,
  created_at timestamptz default now() not null
);

-- Mesajlar
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles on delete cascade not null,
  receiver_id uuid references public.profiles on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now() not null
);

-- Takvim etkinlikleri
create table public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references public.profiles on delete cascade not null,
  student_id uuid references public.profiles on delete set null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  event_type text default 'available' check (event_type in ('available', 'session', 'blocked')),
  meeting_url text,
  created_at timestamptz default now() not null
);

-- Ödemeler
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles on delete cascade not null,
  coach_id uuid references public.profiles on delete cascade not null,
  package_id uuid references public.packages on delete set null,
  amount numeric(10,2) not null,
  currency text default 'TRY',
  payment_provider text,
  provider_payment_id text,
  status text default 'pending' check (status in ('success', 'failed', 'pending', 'refunded')),
  created_at timestamptz default now() not null
);

-- Yeni kullanıcı kaydında otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'İsimsiz'),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.packages enable row level security;
alter table public.coach_students enable row level security;
alter table public.progress_entries enable row level security;
alter table public.programs enable row level security;
alter table public.messages enable row level security;
alter table public.calendar_events enable row level security;
alter table public.payments enable row level security;

-- RLS Policies

-- profiles: herkes kendi profilini okuyabilir/güncelleyebilir
create policy "Kullanıcı kendi profilini görebilir"
  on public.profiles for select using (auth.uid() = id);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on public.profiles for update using (auth.uid() = id);

-- packages: herkes aktif paketleri görebilir, koç kendi paketlerini yönetebilir
create policy "Aktif paketler herkese görünür"
  on public.packages for select using (is_active = true);

create policy "Koç kendi paketlerini yönetebilir"
  on public.packages for all using (auth.uid() = coach_id);

-- coach_students: koç kendi öğrencilerini, öğrenci kendi kaydını görebilir
create policy "Koç kendi öğrencilerini görebilir"
  on public.coach_students for select using (auth.uid() = coach_id);

create policy "Öğrenci kendi kaydını görebilir"
  on public.coach_students for select using (auth.uid() = student_id);

create policy "Koç öğrenci ilişkisi oluşturabilir"
  on public.coach_students for insert with check (auth.uid() = coach_id);

create policy "Koç öğrenci ilişkisini güncelleyebilir"
  on public.coach_students for update using (auth.uid() = coach_id);

-- progress_entries: koç ve ilgili öğrenci görebilir
create policy "İlerleme kayıtlarına erişim"
  on public.progress_entries for select
  using (auth.uid() = student_id or auth.uid() = coach_id);

create policy "Koç ilerleme kaydı ekleyebilir"
  on public.progress_entries for insert
  with check (auth.uid() = coach_id);

create policy "Öğrenci kendi ilerleme kaydını ekleyebilir"
  on public.progress_entries for insert
  with check (auth.uid() = student_id);

-- programs: koç ve ilgili öğrenci görebilir
create policy "Programlara erişim"
  on public.programs for select
  using (auth.uid() = coach_id or auth.uid() = student_id);

create policy "Koç program yükleyebilir"
  on public.programs for insert with check (auth.uid() = coach_id);

create policy "Koç kendi programını silebilir"
  on public.programs for delete using (auth.uid() = coach_id);

-- messages: sender ve receiver görebilir
create policy "Mesajlara erişim"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Mesaj gönderebilir"
  on public.messages for insert with check (auth.uid() = sender_id);

create policy "Receiver mesajı okundu işaretleyebilir"
  on public.messages for update using (auth.uid() = receiver_id);

-- calendar_events: koç ve ilgili öğrenci görebilir
create policy "Takvim etkinliklerine erişim"
  on public.calendar_events for select
  using (auth.uid() = coach_id or auth.uid() = student_id or event_type = 'available');

create policy "Koç takvim etkinliği oluşturabilir"
  on public.calendar_events for all using (auth.uid() = coach_id);

-- Storage bucket'ları oluştur
insert into storage.buckets (id, name, public) values ('programs', 'programs', false);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "Programlara erişim"
  on storage.objects for select
  using (bucket_id = 'programs' and auth.uid() is not null);

create policy "Koç program yükleyebilir"
  on storage.objects for insert
  with check (bucket_id = 'programs' and auth.uid() is not null);

create policy "Avatar herkese açık"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Kullanıcı kendi avatarını yükleyebilir"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() is not null);
