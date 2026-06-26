# 🏗️ KOÇ PANELİ — TEKNİK MİMARİ DOKÜMANI

## Proje Genel Bakış

Online koçluk yapan kişilere özel, öğrenci takip ve yönetim sistemi. Koçun kendi websitesi + koç paneli + öğrenci paneli üçlüsünden oluşan full-stack bir web uygulaması.

---

## 📁 Klasör Yapısı

```
koc-paneli/
├── frontend/                  # Next.js uygulaması
│   ├── app/
│   │   ├── (public)/          # Herkese açık sayfalar
│   │   │   ├── page.tsx       # Koçun ana websitesi (landing page)
│   │   │   ├── paketler/      # Paket listesi ve satın alma
│   │   │   └── giris/         # Giriş sayfası
│   │   ├── (coach)/           # Koç paneli (auth korumalı)
│   │   │   ├── dashboard/     # Genel bakış
│   │   │   ├── ogrenciler/    # Öğrenci listesi
│   │   │   │   └── [id]/      # Öğrenci detay sayfası
│   │   │   ├── mesajlar/      # Mesajlaşma
│   │   │   ├── takvim/        # Takvim ve randevu yönetimi
│   │   │   └── ayarlar/       # Profil ve ayarlar
│   │   ├── (student)/         # Öğrenci paneli (auth korumalı)
│   │   │   ├── dashboard/     # Öğrenci ana sayfası
│   │   │   ├── programlar/    # PDF programlar
│   │   │   ├── ilerleme/      # İlerleme grafikleri
│   │   │   ├── mesajlar/      # Koça mesaj
│   │   │   └── takvim/        # Randevu takvimi
│   │   └── api/               # Next.js API routes (BFF katmanı)
│   ├── components/
│   │   ├── ui/                # shadcn/ui bileşenleri
│   │   ├── coach/             # Koç paneline özel bileşenler
│   │   ├── student/           # Öğrenci paneline özel bileşenler
│   │   └── shared/            # Ortak bileşenler
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   ├── auth.ts            # Auth helpers
│   │   └── utils.ts           # Yardımcı fonksiyonlar
│   └── types/                 # TypeScript tip tanımları
│
├── supabase/
│   ├── migrations/            # Veritabanı migration dosyaları
│   └── seed.sql               # Örnek veri
│
└── docs/                      # Proje dökümantasyonu
```

---

## 🛠️ Kullanılacak Teknolojiler

### Frontend
| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Next.js** | 14+ (App Router) | Ana framework, SSR/SSG |
| **TypeScript** | 5+ | Tip güvenliği |
| **Tailwind CSS** | 3+ | Stil sistemi |
| **shadcn/ui** | Latest | UI bileşen kütüphanesi |
| **Framer Motion** | Latest | Animasyonlar |
| **Recharts** | Latest | İlerleme grafikleri |
| **React Hook Form** | Latest | Form yönetimi |
| **Zod** | Latest | Form validasyonu |
| **FullCalendar** | Latest | Takvim bileşeni |
| **React PDF Viewer** | Latest | PDF görüntüleme |

### Backend & Veritabanı
| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| **Supabase** | Backend as a Service (PostgreSQL + Auth + Storage + Realtime) |
| **Supabase Auth** | Kullanıcı kimlik doğrulama (koç + öğrenci rolleri) |
| **Supabase Storage** | PDF dosya yükleme ve saklama |
| **Supabase Realtime** | Anlık mesajlaşma |
| **Row Level Security (RLS)** | Veri erişim güvenliği |

### Ödeme Sistemi
| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| **İyzico** veya **Stripe** | Ödeme altyapısı (Türkiye için İyzico önerilir) |

### Deployment & DevOps
| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| **Vercel** | Frontend deployment |
| **Supabase Cloud** | Database & backend hosting |
| **GitHub** | Versiyon kontrol |

---

## 🗄️ Veritabanı Şeması

### Tablolar

```sql
-- Kullanıcılar (Supabase Auth ile entegre)
profiles
  id (uuid, FK -> auth.users)
  full_name (text)
  role (enum: 'coach', 'student')
  avatar_url (text)
  bio (text)                    -- Koç için biyografi
  created_at (timestamp)

-- Paketler (Koçun oluşturduğu paketler)
packages
  id (uuid)
  coach_id (uuid, FK -> profiles)
  name (text)                   -- Paket adı
  description (text)
  price (numeric)
  duration_days (int)           -- Paket süresi
  features (text[])             -- Paket özellikleri listesi
  is_active (boolean)
  created_at (timestamp)

-- Öğrenci-Koç İlişkisi
coach_students
  id (uuid)
  coach_id (uuid, FK -> profiles)
  student_id (uuid, FK -> profiles)
  package_id (uuid, FK -> packages)
  start_date (date)
  end_date (date)
  status (enum: 'active', 'paused', 'completed')
  payment_status (enum: 'paid', 'pending', 'failed')
  created_at (timestamp)

-- İlerleme Kayıtları
progress_entries
  id (uuid)
  student_id (uuid, FK -> profiles)
  coach_id (uuid, FK -> profiles)
  date (date)
  weight (numeric)              -- Ağırlık (fitness koçlar için)
  note (text)
  custom_metrics (jsonb)        -- Esnek metrikler (koça göre özelleştirilebilir)
  created_at (timestamp)

-- Programlar (PDF dosyaları)
programs
  id (uuid)
  coach_id (uuid, FK -> profiles)
  student_id (uuid, FK -> profiles)
  title (text)
  description (text)
  file_url (text)               -- Supabase Storage URL
  file_name (text)
  created_at (timestamp)

-- Mesajlar
messages
  id (uuid)
  sender_id (uuid, FK -> profiles)
  receiver_id (uuid, FK -> profiles)
  content (text)
  is_read (boolean)
  created_at (timestamp)

-- Takvim Etkinlikleri
calendar_events
  id (uuid)
  coach_id (uuid, FK -> profiles)
  student_id (uuid, FK -> profiles, nullable)  -- null ise koçun müsait saati
  title (text)
  description (text)
  start_time (timestamp)
  end_time (timestamp)
  event_type (enum: 'available', 'session', 'blocked')
  meeting_url (text)            -- Zoom/Meet linki
  created_at (timestamp)

-- Öğrenci Profil Bilgileri (Onboarding)
student_profiles
  id (uuid)
  student_id (uuid, FK -> profiles)
  height_cm (numeric)
  birth_date (date)
  gender (enum: 'male', 'female')
  experience (enum: 'beginner', '1-3years', '3plus')
  goal (enum: 'muscle_gain', 'fat_loss', 'recomposition', 'strength')
  initial_weight (numeric)
  chest_cm (numeric)
  waist_cm (numeric)
  hip_cm (numeric)
  neck_cm (numeric)
  right_upper_arm_cm (numeric)
  left_upper_arm_cm (numeric)
  right_thigh_cm (numeric)
  left_thigh_cm (numeric)
  right_calf_cm (numeric)
  left_calf_cm (numeric)
  body_fat_percentage (numeric)
  photo_front_path (text)     -- Supabase Storage path (onboarding-photos)
  photo_side_path (text)      -- Supabase Storage path (onboarding-photos)
  photo_back_path (text)      -- Supabase Storage path (onboarding-photos)
  injuries (text)
  supplements (text)
  onboarding_completed (boolean)
  created_at (timestamp)
  updated_at (timestamp)

-- Ödemeler
payments
  id (uuid)
  student_id (uuid, FK -> profiles)
  coach_id (uuid, FK -> profiles)
  package_id (uuid, FK -> packages)
  amount (numeric)
  currency (text)               -- 'TRY' veya 'USD'
  payment_provider (text)       -- 'iyzico' veya 'stripe'
  provider_payment_id (text)    -- Ödeme sağlayıcısından dönen ID
  status (enum: 'success', 'failed', 'pending', 'refunded')
  created_at (timestamp)
```

---

## 🔐 Kimlik Doğrulama & Yetkilendirme

```
Kullanıcı Rolleri:
├── coach      → Koç paneline erişim
└── student    → Öğrenci paneline erişim

Auth Akışı:
1. Kullanıcı /giris sayfasına gider
2. Email + şifre ile giriş yapar
3. Supabase Auth token döner
4. profiles tablosundaki role kontrol edilir
5. Role göre yönlendirme: /coach/dashboard veya /student/dashboard

Row Level Security (RLS) Kuralları:
- Koç sadece kendi öğrencilerinin verilerine erişebilir
- Öğrenci sadece kendi verisini görebilir
- Mesajlar sadece sender ve receiver tarafından okunabilir
```

---

## 🔄 Gerçek Zamanlı Özellikler (Supabase Realtime)

- **Mesajlaşma**: Yeni mesaj geldiğinde anlık bildirim
- **İlerleme güncellemeleri**: Koç veri girdiğinde öğrenci paneli güncellenir
- **Program yükleme**: PDF yüklendiğinde öğrenciye bildirim

---

## 📂 Supabase Storage Klasör Yapısı

```
storage/
├── avatars/
│   └── {user_id}/avatar.jpg
├── programs/
│   └── {coach_id}/{student_id}/{program_id}.pdf
├── progress-photos/
│   ├── {coach_id}/{student_id}/{uuid}-before.jpg  # İlerleme fotoğrafları
│   └── {student_id}/{uuid}-{kind}.jpg             # Başlangıç (onboarding) fotoğrafları
└── coach-assets/
    └── {coach_id}/           # Koç websitesi için görseller
```

---

## 🌐 Sayfa Rotaları

```
Public (Koçun Websitesi):
  /                    → Landing page (koç tanıtım)
  /paketler            → Paket listesi
  /giris               → Login sayfası

Koç Paneli (auth: coach):
  /coach/dashboard     → Genel bakış
  /coach/ogrenciler    → Öğrenci listesi
  /coach/ogrenciler/[id] → Öğrenci detayı
  /coach/mesajlar      → Mesajlaşma
  /coach/takvim        → Takvim yönetimi
  /coach/programlar    → Program yükleme
  /coach/ayarlar       → Profil & ayarlar

Öğrenci Paneli (auth: student):
  /student/onboarding  → İlk kayıt/onboarding formu (onboarding_completed değilse zorunlu)
  /student/dashboard   → Ana sayfa
  /student/programlar  → Yüklenen PDF'ler
  /student/ilerleme    → İlerleme grafikleri
  /student/mesajlar    → Koça mesaj
  /student/takvim      → Randevu takvimi
```

---

## ⚙️ Ortam Değişkenleri (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# İyzico (Ödeme)
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Geliştirme Ortamı Kurulumu

```bash
# 1. Repo klonla
git clone https://github.com/username/koc-paneli.git
cd koc-paneli/frontend

# 2. Bağımlılıkları yükle
npm install

# 3. .env.local dosyasını oluştur ve doldur
cp .env.example .env.local

# 4. Supabase migration'ları çalıştır
npx supabase db push

# 5. Geliştirme sunucusunu başlat
npm run dev
```