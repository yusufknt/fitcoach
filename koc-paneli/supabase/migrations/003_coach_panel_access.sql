-- Koç, kendi öğrencilerinin profilini okuyabilir
create policy "Koç öğrenci profillerini görebilir"
  on public.profiles for select
  using (
    id in (
      select student_id
      from public.coach_students
      where coach_id = auth.uid()
    )
  );

-- Koç, öğrenci e-postasını ilişki doğrulamasıyla okuyabilir
create or replace function public.coach_student_email(p_student_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.email::text
  from auth.users u
  inner join public.coach_students cs
    on cs.student_id = u.id
    and cs.coach_id = auth.uid()
  where u.id = p_student_id;
$$;

grant execute on function public.coach_student_email(uuid) to authenticated;
