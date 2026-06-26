insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "İlerleme fotoğraflarına giriş yapanlar erişebilir"
  on storage.objects for select
  using (bucket_id = 'progress-photos' and auth.uid() is not null);

create policy "Koç veya öğrenci ilerleme fotoğrafı yükleyebilir"
  on storage.objects for insert
  with check (bucket_id = 'progress-photos' and auth.uid() is not null);
