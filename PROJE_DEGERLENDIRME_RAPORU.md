# 📊 KOÇ PANELİ (FITCOACH) — PROJE DEĞERLENDİRME & STRATEJİK YOL HARİTASI
*Hazırlayan: Genel Müdür (Proje Geliştirme & Satış)*
*Tarih: 25 Haziran 2026*

---

## 1. 🎯 Yönetici Özeti & Ürün Vizyonu

**Koç Paneli (Fitcoach / Kinetic Performance)**, online ve birebir hizmet veren koçların (fitness, beslenme, yaşam koçluğu vb.) öğrenci yönetim süreçlerini dijitalleştiren, ölçeklenebilir ve modern bir SaaS adayıdır. Proje, koçun kendi tanıtım web sitesi ile öğrenci ve koç panellerini bir araya getirerek uçtan uca bir deneyim sunmayı amaçlamaktadır.

Şu anki teknik altyapı son derece modern (Next.js 14+ App Router, Tailwind CSS, Supabase PostgreSQL, Realtime Chat, Recharts) ve görsel tasarım dili premium kalitededir. Ancak projenin "satılabilir" ve ticari olarak faturalandırılabilir bir ürün (SaaS) olması için kapatılması gereken kritik boşluklar bulunmaktadır.

---

## 2. 👥 Alıcı Kitlesi (Hedef Pazar)

Projenin pazarlanabileceği ve gelir elde edilebileceği hedef kitleler üç ana grupta toplanmaktadır:

| Hedef Kitle Grubu | İhtiyaçları | Satış Yaklaşımı (B2B / B2C) |
| :--- | :--- | :--- |
| **Bireysel Fitness & Beslenme Koçları** | WhatsApp/Excel karmaşasından kurtulmak, profesyonel görünmek, ödemeleri otomatikleştirmek. | **SaaS Üyeliği (Monthly Subscription)**: Koçlara aylık/yıllık panel kullanım üyeliği satışı. |
| **Butik Spor Salonları & Stüdyolar** | Üyelerin gelişimini ve ders randevularını tek bir panelden takip etmek. | **White-Label Çözüm**: Salona özel logo ve domain ile lisanslama satışı. |
| **Diyetisyenler & Yaşam Koçları** | Form toplama, ilerleme grafikleri çizme ve danışanla canlı mesajlaşma. | **Dikey Özelleştirilmiş Paketler**: Ölçü takibi yerine alışkanlık takibine odaklanan modüller. |

---

## 3. 💸 Satılabilirliği Artırmak İçin Eklenmesi Gereken Özellikler (Sales Boosters)

Projenin rakip platformlar (örn. Trainerize, TrueCoach vb.) karşısında pazar payı kazanabilmesi için şu stratejik özellikler eklenmelidir:

1. **İnteraktif Antrenman ve Diyet Planlayıcı (Workout & Diet Builder)**
   * *Mevcut Durum:* Sadece statik PDF yükleniyor.
   * *Gereken:* Koçun panel içinden egzersizleri seçip set/tekrar girdiği, öğrencinin ise antrenmanı yaparken "tamamlandı" işaretleyip veri girebildiği dinamik bir planlayıcı.
2. **Ödeme Altyapısı Entegrasyonu (Checkout Flow)**
   * *Gereken:* Ziyaretçilerin koçun web sitesinden paket seçip Stripe veya İyzico ile ödeme yaparak anında sisteme kaydedilebileceği tam entegre ödeme ekranları.
3. **Kişiselleştirilebilir Domain Desteği (Custom Domain)**
   * *Gereken:* Profesyonel koçların kendi alan adlarını (örn. `kocum.com`) sisteme bağlayabilmesi.
4. **Mobil Uygulama (PWA veya React Native)**
   * *Gereken:* Öğrencilerin antrenman esnasında tarayıcı yerine telefondan doğrudan uygulamaya girebilmesi için mobil uygulama veya kusursuz bir PWA (Progressive Web App) desteği.
5. **Grup Koçluğu ve Toplu Program Gönderimi**
   * *Gereken:* Koçun 100 öğrencisine tek tek program yüklemek yerine, belirlediği bir gruba tek tuşla program atayabilmesi.

---

## 4. ⚙️ Teknik Değerlendirme (Durum Analizi)

### ✅ Çalışan Modüller
Projede şu an başarıyla çalışan ve teknik mimarisi tamamlanmış kısımlar:
* **Güvenli Kimlik Doğrulama & Rol Yönetimi**: Supabase Auth ve Next.js Middleware ile koç ve öğrenci rolleri ayrımı kusursuz çalışıyor.
* **Canlı Mesajlaşma (Chat)**: Supabase Realtime altyapısı sayesinde anlık sohbet modülü aktif.
* **Öğrenci Kayıt (Onboarding) Süreci**: İlk girişte boy, kilo, hedef, sakatlık bilgileri ve başlangıç fotoğrafları toplama formu tamamlanmış.
* **İlerleme Grafikleri**: Recharts ile kilo ve ölçü değişimleri grafiksel olarak görselleştiriliyor.
* **Gelişim Raporu Üretimi (Monthly Reports)**: Aylık verileri toplayıp otomatik PDF raporu oluşturma ve bunu Supabase Storage'a yükleme sistemi çalışıyor.

### ❌ Çalışmayan, Eksik veya Düzeltilmesi Gereken Yanlar

* **Ödeme ve Paket Satın Alma Akışı (Tamamen Eksik)**: `.env` dosyasında İyzico değişkenleri yer alsa da, kod tarafında ödeme tetikleyicisi, API route'ları ve ödeme sonrası otomatik öğrenci/profil oluşturma logic'leri kodlanmamıştır. Web sitesindeki "Satın Al" butonu doğrudan `/giris` sayfasına yönlendirmektedir.
* **Manuel Öğrenci Ekleme & Davet Sistemi (Eksik)**: Koç panelinde yeni bir öğrenci ekleme veya öğrenciye kayıt olması için özel davet linki (invite link) gönderme özelliği bulunmuyor. Öğrenciler sisteme manuel veritabanı müdahalesi olmadan dahil olamamaktadır.
* **Web Sitesi & Paket Düzenleme Sayfası (Mocked/Çalışmıyor)**: Koç panelindeki `Ayarlar -> Web Sitesi` sekmesi tamamen görsel şablonlardan oluşmaktadır. Koçun paket fiyatlarını, özelliklerini ve web sitesindeki başlıkları panelden dinamik olarak güncellemesini sağlayan backend/API entegrasyonu tamamlanmamıştır.
* **Public Rotalarda Eksiklikler**: `architecture.md` dosyasında belirtilen `/paketler` rotası klasör yapısında bulunmamaktadır. Landing page tek sayfa olarak çalışmakta, paket detay sayfaları eksiktir.

---

## 5. 🚀 Geliştirme Yol Haritası (Milestones)

Projenin hızlıca MVP (Minimum Viable Product) seviyesinden satılabilir bir ürüne dönüşmesi için 3 aşamalı aksiyon planı:

### 🗓️ AŞAMA 1: Kritik Satış Altyapısı (Süre: 2 Hafta)
* **Ödeme Entegrasyonu**: İyzico/Stripe API entegrasyonunun tamamlanması. Ödeme sonrası Supabase Auth üzerinden otomatik öğrenci hesabı oluşturulması.
* **Manuel Öğrenci Davet Sistemi**: Koç panelinde "Öğrenci Davet Et" butonu eklenmesi. Benzersiz bir link (`/kayit?invite=uuid`) üretilerek öğrencinin doğrudan ilgili pakete kayıt olabilmesi.
* **Genel Kayıt Formu (/kayit)**: Dışarıdan gelen öğrencilerin sisteme kaydolmasını sağlayacak formun devreye alınması.

### 🗓️ AŞAMA 2: Yönetim ve Özelleştirme (Süre: 2 Hafta)
* **Dinamik Paket & Site Yönetimi**: Koç panelindeki ayarlar sekmesindeki "Web Sitesi" ve "Paket" düzenleyicilerin aktifleştirilmesi (Supabase CRUD entegrasyonu).
* **Gelişmiş Bildirim Altyapısı**: E-posta şablonlarının (Resend entegrasyonu ile) devreye alınması. Yeni üye kaydı, yeni yüklenen program ve yaklaşan randevu maillerinin gönderilmesi.

### 🗓️ AŞAMA 3: Etkileşim ve Mobilite (Süre: 3 Hafta)
* **İnteraktif Antrenman Girişi**: PDF yüklemenin yanına alternatif olarak, panel üzerinden egzersiz veritabanından set ve tekrar bazlı antrenman programı oluşturma arayüzü eklenmesi.
* **PWA Kurulumu**: Mobil tarayıcılarda uygulamanın telefona indirilebilir hale getirilmesi.
* **Çoklu Koç Desteği (Opsiyonel)**: Platformun tek koçlu bir yapıdan, birden fazla koçun üye olup kendi web sitesini oluşturabileceği çok kiracılı (Multi-tenant) bir SaaS modeline geçirilmesi.

---

## 6. 💡 Satış & Pazarlama Stratejisi (GM Tavsiyeleri)

1. **"Önce Ücretsiz Kullan, Sonra Öde" Modeli (Freemium)**: Koçlara ilk 3 öğrenciye kadar platformu tamamen ücretsiz sunarak sisteme alışmalarını sağlayalım. Öğrenci sayısı arttıkça aylık abonelik paketlerine geçiş yaptıralım.
2. **Kişiselleştirilmiş (Branded) Deneyim Vurgusu**: Satış yaparken en büyük argümanımız: *"Kendi adınıza ait profesyonel web siteniz ve takip paneliniz olsun, WhatsApp ve PDF dağınıklığından kurtulun."* olmalıdır.
3. **Instagram Entegrasyonu**: Online koçların en büyük müşteri kaynağı Instagram'dır. Koçlara profillerine ekleyecekleri link ağacını (Linktree benzeri) doğrudan bu panelle entegre sunarak satın alma dönüşüm oranını yükseltebiliriz.
