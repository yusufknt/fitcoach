-- Koç kendi klasöründeki program dosyasını silebilir
create policy "Koç program dosyası silebilir"
  on storage.objects for delete
  using (
    bucket_id = 'programs'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
