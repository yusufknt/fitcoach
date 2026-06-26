-- Landing page: koç profili herkese okunabilir
create policy "Koç profili herkese görünür"
  on public.profiles for select
  using (role = 'coach');
