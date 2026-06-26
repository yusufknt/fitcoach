-- Aylık gelişim raporları tablosu
create table if not exists public.monthly_reports (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  coach_id uuid references public.profiles(id) on delete cascade not null,
  report_month date not null, -- Raporun ait olduğu ayın ilk günü (örn. 2026-05-01)
  coach_comment text,
  is_published boolean default false not null,
  pdf_path text, -- Supabase Storage'daki PDF yolu (monthly-reports bucket)
  metrics_summary jsonb default '{}'::jsonb not null, -- Aylık hesaplanan ortalamalar/grafik özetleri
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(student_id, report_month) -- Bir öğrenciye bir ay için tek rapor
);

-- RLS etkinleştirme
alter table public.monthly_reports enable row level security;

-- Politikalar
create policy "Koç kendi öğrencilerinin raporlarını yönetebilir"
  on public.monthly_reports for all
  using (auth.uid() = coach_id);

create policy "Öğrenci kendi yayınlanmış raporlarını görebilir"
  on public.monthly_reports for select
  using (auth.uid() = student_id and is_published = true);

-- Storage bucket oluştur
insert into storage.buckets (id, name, public)
values ('monthly-reports', 'monthly-reports', false)
on conflict (id) do nothing;

-- Rapor PDF'leri için storage politikaları
create policy "Giriş yapanlar rapor PDF'lerini okuyabilir"
  on storage.objects for select
  using (bucket_id = 'monthly-reports' and auth.uid() is not null);

create policy "Koç rapor PDF'i yükleyebilir"
  on storage.objects for insert
  with check (bucket_id = 'monthly-reports' and auth.uid() is not null);
