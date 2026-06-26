# ✅ KOÇ PANELİ — PROJE YAPISI & GÖREV LİSTESİ

## 🎯 Projenin Amacı

Online koçluk yapan kişilere (fitness, yaşam, kariyer vb.) özel bir platform.
Üç ana parçadan oluşur:

1. **Koçun Tanıtım Websitesi** — Yeni öğrencilerin gelip paket satın aldığı yüz.
2. **Koç Paneli** — Koçun öğrencilerini yönettiği, takip ettiği, iletişim kurduğu alan.
3. **Öğrenci Paneli** — Öğrencinin programlarını gördüğü, ilerlemesini takip ettiği, koçuyla iletişime geçtiği alan.

---

## 🧩 Modüller & Ne Yapacakları

### MODÜL 1 — Koçun Tanıtım Websitesi (Public)

**Amaç:** Ziyaretçiyi öğrenciye dönüştürmek.

- Hero bölümü: Koçun adı, sloganı, fotoğrafı, kısa tanıtım
- Hakkımda bölümü: Deneyim, sertifikalar, başarılar
- Paketler bölümü: 2-4 farklı koçluk paketi (fiyat, süre, özellikler)
- Referanslar bölümü: Öğrenci yorumları/testimonial'lar
- SSS bölümü
- İletişim/CTA bölümü
- Sağ üstte giriş butonu (koç ve öğrenci aynı butondan giriyor, role göre yönleniyor)

**Paket Satın Alma Akışı:**
1. Öğrenci pakete tıklar
2. Kayıt formu çıkar (ad, soyad, email, şifre)
3. Ödeme sayfasına yönlendirilir (İyzico/Stripe)
4. Ödeme başarılıysa öğrenci paneli oluşturulur
5. Öğrenciye hoşgeldin emaili gönderilir
6. Koça yeni öğrenci bildirimi gelir

---

### MODÜL 2 — Giriş Sayfası

- Tek giriş sayfası (/giris)
- Email + şifre ile giriş
- Rol tespiti otomatik yapılır (coach/student)
- Koç → /coach/dashboard'a yönlendirilir
- Öğrenci → /student/dashboard'a yönlendirilir
- "Şifremi Unuttum" özelliği
- Mobil uyumlu, şık tasarım

---

### MODÜL 3 — Koç Paneli

#### 3A. Dashboard (Genel Bakış)
- Toplam aktif öğrenci sayısı
- Bu ay yeni gelen öğrenci sayısı
- Okunmamış mesaj sayısı
- Yaklaşan randevu/görüşme listesi
- Son aktiviteler akışı (kim ne zaman ilerleme kaydetti, kim mesaj attı vb.)
- Aylık gelir özeti (isteğe bağlı)

#### 3B. Öğrenciler
- Tüm öğrencilerin listesi (arama ve filtre özelliğiyle)
- Her öğrenci kartında: isim, fotoğraf, paket adı, başlangıç tarihi, son aktivite, durum
- Öğrenciye tıklandığında detay sayfası açılır

**Öğrenci Detay Sayfası:**
- Kişisel bilgiler (ad, email, paket, tarihler)
- İlerleme grafiği (ağırlık, performans metrikleri — koçun tanımladığı)
- Yüklenen programlar listesi
- Mesajlaşma geçmişi
- Notlar/günlük kayıtlar
- Randevu geçmişi

#### 3C. Program Yükleme (PDF)
- Öğrenci seçme
- Başlık ve açıklama yazma
- PDF dosyası sürükle-bırak veya seç
- Yükleme sonrası öğrencinin paneline düşer
- Daha önce yüklenen programları listeleme ve silme

#### 3D. Mesajlaşma
- Sol tarafta öğrenci listesi (okunmamış mesaj rozeti ile)
- Sağ tarafta konuşma arayüzü (WhatsApp benzeri)
- Metin mesajı gönderme
- Supabase Realtime ile anlık iletişim

#### 3E. Takvim
- Aylık/haftalık takvim görünümü (FullCalendar)
- Koç müsait saatlerini işaretler (yeşil bloklar)
- Öğrenciye özel randevu oluşturur (mavi bloklar)
- Randevu oluştururken: öğrenci seçimi, saat, açıklama, online görüşme linki (Zoom/Meet)
- Randevu oluşturunca öğrencinin takviminde görünür
- Geçmiş randevuları görüntüleme

#### 3F. Ayarlar
- Profil fotoğrafı yükleme
- Biyografi düzenleme
- Şifre değiştirme
- Website içeriğini düzenleme (hero metni, paketler vb.)

---

### MODÜL 4 — Öğrenci Paneli

#### 4A. Dashboard
- Koç bilgisi ve fotoğrafı
- Paket bilgisi (hangi paket, ne kadar kaldı)
- Yaklaşan randevu
- Son yüklenen programlar
- Okunmamış mesaj bildirimi
- Motivasyon/streak bilgisi (kaç gündür aktif)

#### 4B. Programlarım
- Koçun yüklediği PDF programların listesi
- Tarih, başlık, açıklama
- PDF'i tarayıcıda görüntüleme ve indirme

#### 4C. İlerlemem
- Grafik: zaman içindeki ilerleme (ağırlık, performans vb.)
- Öğrenci kendi ilerleme verisini girebilir (koç da girebilir)
- Tarihli notlar/kayıtlar
- Fotoğraf yükleme (before/after — opsiyonel)

#### 4D. Mesajlar
- Koçuyla birebir mesajlaşma
- Anlık bildirim (yeni mesaj rozeti)

#### 4E. Takvim
- Koçun müsait saatlerini görme
- Randevularını görme
- Randevu detayları (saat, açıklama, görüşme linki)

#### 4F. İlk Kayıt (Onboarding) Akışı
- Çok adımlı form (Boy, yaş, cinsiyet, deneyim, hedef, vücut ölçüleri, sakatlık/supplement bilgileri, başlangıç fotoğrafları)
- Middleware ile onboarding'i tamamlamamış öğrencilerin otomatik yönlendirilmesi ve koruma
- Koç panelinde öğrenci detayında bu verilerin "Profil" sekmesi altında gösterilmesi

---

## 📋 GÖREV LİSTESİ (TODO)

### Faz 1 — Temel Altyapı
- [ ] Next.js projesi oluştur (TypeScript + Tailwind + App Router)
- [ ] shadcn/ui kurulumu ve tema ayarları
- [ ] Supabase projesi oluştur
- [ ] Veritabanı tablolarını oluştur (migration dosyaları)
- [ ] Row Level Security kurallarını yaz
- [ ] Supabase Auth entegrasyonu
- [ ] Middleware ile route koruma (coach/student rolleri)
- [ ] Ortam değişkenlerini ayarla

### Faz 2 — Koçun Websitesi
- [ ] Ana sayfa tasarımı ve kodlaması
  - [ ] Header / Navigation (sağ üstte giriş butonu)
  - [ ] Hero bölümü
  - [ ] Hakkımda bölümü
  - [ ] Paketler bölümü
  - [ ] Testimonial/referanslar bölümü
  - [ ] SSS bölümü
  - [ ] Footer
- [ ] Mobil responsive düzenlemeler
- [ ] SEO meta tagları

### Faz 3 — Auth Sistemi
- [ ] Giriş sayfası (/giris)
- [ ] Şifremi unuttum akışı
- [ ] Yeni öğrenci kayıt formu (paket satın alma ile entegre)
- [ ] Logout işlevi
- [ ] Auth state yönetimi (Context veya Zustand)

### Faz 4 — Ödeme Sistemi
- [ ] İyzico sandbox entegrasyonu
- [ ] Paket seçimi → ödeme sayfası akışı
- [ ] Ödeme başarı/hata sayfaları
- [ ] Ödeme sonrası öğrenci kaydı oluşturma (Supabase)
- [ ] Webhook ile ödeme doğrulama
- [ ] Email bildirimi (öğrenciye hoşgeldin, koça yeni öğrenci)

### Faz 5 — Koç Paneli
- [ ] Koç panel layout'u (sidebar navigation)
- [ ] Dashboard sayfası (istatistikler, son aktiviteler)
- [ ] Öğrenciler listesi sayfası
- [ ] Öğrenci detay sayfası
- [ ] İlerleme grafiği bileşeni (Recharts)
- [ ] Program yükleme (PDF upload to Supabase Storage)
- [ ] Mesajlaşma modülü (Realtime)
- [ ] Takvim modülü (FullCalendar)
- [ ] Koç ayarları sayfası

### Faz 6 — Öğrenci Paneli
- [ ] Öğrenci panel layout'u
- [ ] Öğrenci dashboard sayfası
- [x] Öğrenci ilk kayıt (onboarding) akışı, fotoğraf yükleme ve Profilim sayfası (öğrenci & koç görünümü)
- [ ] Programlarım sayfası (PDF viewer)
- [ ] İlerlemem sayfası (grafik + veri girişi)
- [ ] Mesajlar sayfası
- [ ] Takvim sayfası (müsaitlik ve randevular)

### Faz 7 — Test & Canlıya Alma
- [ ] Manuel test senaryoları (koç + öğrenci akışları)
- [ ] Mobil test (iOS + Android)
- [ ] Vercel deployment
- [ ] Supabase Cloud production ayarları
- [ ] Domain bağlama
- [ ] İyzico production anahtarları

---

## 🎨 Tasarım Rehberi

```
Renk Paleti (Koça göre özelleştirilebilir):
  Primary:    #6366F1  (indigo) — çağdaş, güvenilir
  Secondary:  #8B5CF6  (violet)
  Accent:     #F59E0B  (amber) — CTA butonları
  Success:    #10B981  (yeşil)
  Background: #0F0F10  (koyu) veya #FAFAFA (açık)

Tipografi:
  Başlıklar:  Inter veya Plus Jakarta Sans (bold)
  Metin:      Inter (regular/medium)

Tasarım Prensipler:
  - Minimal ve temiz arayüz
  - Koçun kişiliğini yansıtan hero tasarımı
  - Mobil öncelikli geliştirme
  - Hızlı yükleme süreleri
  - Erişilebilirlik (WCAG AA)
```

---

## 🔔 Bildirim Sistemi

| Durum | Koça Bildirim | Öğrenciye Bildirim |
|-------|--------------|-------------------|
| Yeni öğrenci kaydı | ✅ Panel + Email | ✅ Hoşgeldin emaili |
| Yeni mesaj | ✅ Panel rozeti | ✅ Panel rozeti |
| PDF program yüklendi | — | ✅ Panel bildirimi |
| Yeni randevu eklendi | — | ✅ Panel + Email |
| Randevu yaklaşıyor (24h önce) | ✅ Email | ✅ Email |

---

## ⚠️ Önemli Notlar & Kararlar

1. **Tek Koç Sistemi**: Uygulama şimdilik tek bir koç için tasarlanmış. Çoklu koç desteği ilerleyen fazda eklenebilir.
2. **Ödeme Sistemi**: Türkiye için İyzico, uluslararası için Stripe önerilir. Başlangıçta ikisinden biri seçilmeli.
3. **Email Bildirimleri**: Supabase'in yerleşik email sistemi veya Resend.com kullanılabilir.
4. **Mesajlaşma**: Supabase Realtime yeterli olacaktır, Socket.io gerekmez.
5. **PDF Viewer**: `react-pdf` kütüphanesi tarayıcı içi görüntüleme için kullanılacak.
6. **Takvim**: FullCalendar'ın React versiyonu (premium değil, açık kaynak sürümü yeterli).
7. **İlerleme Metrikleri**: Koçun türüne göre değişebilir (fitness: kg, spor: rep/set, yaşam koçluğu: özel). `custom_metrics (jsonb)` alanı ile esnek yapı sağlandı.