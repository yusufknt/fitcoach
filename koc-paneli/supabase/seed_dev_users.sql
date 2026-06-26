-- Geliştirme ortamı: test kullanıcıları + koç-öğrenci ilişkisi
-- Supabase SQL Editor'da çalıştırın (migration değil, tek seferlik seed)

-- 1) Roller
update public.profiles
set role = 'coach', full_name = coalesce(full_name, 'Test Koç')
where id = (select id from auth.users where email = 'coach@test.com');

update public.profiles
set role = 'student', full_name = coalesce(full_name, 'Test Öğrenci')
where id = (select id from auth.users where email = 'student@test.com');

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role": "coach"}'::jsonb
where email = 'coach@test.com';

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role": "student"}'::jsonb
where email = 'student@test.com';

-- 2) Örnek paket (koç için, yoksa oluştur)
insert into public.packages (coach_id, name, description, price, duration_days, features, is_active)
select
  coach.id,
  'Başlangıç Paketi',
  '3 aylık online koçluk programı',
  2999.00,
  90,
  array['Haftalık görüşme', 'Program takibi', 'Mesajlaşma desteği'],
  true
from public.profiles coach
inner join auth.users u on u.id = coach.id and u.email = 'coach@test.com'
where not exists (
  select 1 from public.packages p
  where p.coach_id = coach.id and p.name = 'Başlangıç Paketi'
);

-- 3) Koç ↔ öğrenci ilişkisi (dashboard ve öğrenci listesi bunu okur)
insert into public.coach_students (
  coach_id,
  student_id,
  package_id,
  start_date,
  status,
  payment_status
)
select
  coach.id,
  student.id,
  pkg.id,
  current_date,
  'active',
  'paid'
from public.profiles coach
inner join auth.users uc on uc.id = coach.id and uc.email = 'coach@test.com'
cross join public.profiles student
inner join auth.users us on us.id = student.id and us.email = 'student@test.com'
left join lateral (
  select id from public.packages
  where coach_id = coach.id and is_active = true
  order by created_at asc
  limit 1
) pkg on true
where coach.role = 'coach' and student.role = 'student'
on conflict (coach_id, student_id) do update set
  status = excluded.status,
  payment_status = excluded.payment_status,
  package_id = coalesce(excluded.package_id, public.coach_students.package_id),
  start_date = coalesce(public.coach_students.start_date, excluded.start_date);
