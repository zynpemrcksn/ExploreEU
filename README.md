# 🌍 ExploreEU

ExploreEU is a Drupal-based travel platform designed for students and young travelers who want to explore Europe.

The project was developed as part of my internship project in 2026.

---

# 🇬🇧 English

## 📌 About the Project

ExploreEU is a Drupal-based web application that I developed to help students and young travelers plan and organize their trips across Europe more easily.

The platform brings together city guides, travel planning tools, user experiences, communities, community events, a personal calendar, travel tips, user account features, and an AI-powered travel assistant in a single application.

I developed ExploreEU during my internship while learning and applying the Drupal ecosystem and related development tools. Throughout the project, I worked on research, development, testing, debugging, responsive design, and iterative improvement.

## ✨ Key Features

- 🏙️ **City Guides** — Detailed information about European cities including daily budget, transportation, safety, student life, internet/SIM, payment methods, emergency information, and recommended stay.
- ✈️ **Plan Your Trip** — A multi-step travel planning experience based on the user's travel preferences.
- 📅 **Calendar** — A personal calendar for tracking travel plans and Community events.
- 🤖 **AI Travel Assistant** — A travel-focused chatbot integrated with the Gemini API.
- 📝 **Experiences** — Users can share city experiences, browse posts, comment, and filter experiences by city.
- 👥 **Community** — Student communities connected to cities, with Join and Leave functionality.
- 🎉 **Community Events** — Events connected to communities that can be added to the user's personal calendar.
- 💡 **Travel Tips** — Travel-related articles and detailed informational content.
- 👤 **User System** — Registration, login, password operations, and account management.
- 💬 **Contact** — Contact form for communicating through the platform.
- 📱 **Responsive Design** — Interface adapted for desktop, laptop, tablet, and mobile screens.

## 🛠️ Technologies Used

- Drupal 11
- PHP
- Twig
- JavaScript
- HTML5 & CSS3
- AJAX
- Drupal Form API
- Drupal Entity API / Entity Query
- Docker
- DDEV
- Linux
- Git & GitHub
- Gemini API
- FullCalendar
- Webform
- Pathauto & Token

## 🏗️ Project Structure

ExploreEU uses Drupal's modular architecture together with a custom theme and custom modules.

```text
web/
├── modules/
│   └── custom/
│       ├── exploreeu_chatbot/
│       ├── exploreeu_community/
│       └── exploreeu_trip_planner/
│
└── themes/
    └── custom/
        └── exploreeu/
            ├── css/
            ├── js/
            └── templates/
```

### Custom Theme

`web/themes/custom/exploreeu`

The ExploreEU custom theme contains project-specific Twig templates, CSS styles, JavaScript behaviors, and Drupal theme integrations.

### Custom Modules

**ExploreEU Trip Planner**  
Contains the application logic related to travel planning features.

**ExploreEU Chatbot**  
Provides the Gemini API integration used by the AI Travel Assistant.

**ExploreEU Community**  
Handles Community membership, Join/Leave operations, Community Events, and calendar integration.

---

# 🇹🇷 Türkçe

## 📌 Proje Hakkında

ExploreEU, Avrupa'yı keşfetmek isteyen öğrenci ve genç gezginlerin seyahatlerini daha kolay planlayabilmeleri amacıyla geliştirdiğim Drupal tabanlı bir web uygulamasıdır.

Platform; şehir rehberleri, seyahat planlama araçları, kullanıcı deneyimleri, topluluklar, topluluk etkinlikleri, kişisel takvim, seyahat ipuçları, kullanıcı hesabı özellikleri ve yapay zekâ destekli seyahat asistanını tek bir uygulama altında bir araya getirmektedir.

ExploreEU'yu 2026 yılındaki staj sürecimde geliştirirken Drupal ekosistemini ve ilgili geliştirme araçlarını uygulamalı olarak öğrendim. Proje boyunca araştırma, geliştirme, test, hata ayıklama, responsive tasarım ve iyileştirme süreçleri üzerinde çalıştım.

## ✨ Temel Özellikler

- 🏙️ **Şehir Rehberleri** — Avrupa şehirleri için günlük bütçe, ulaşım, güvenlik, öğrenci yaşamı, internet/SIM, ödeme yöntemleri, acil durum bilgileri ve önerilen konaklama süresi gibi detaylı bilgiler.
- ✈️ **Plan Your Trip** — Kullanıcının seyahat tercihlerine göre seyahat planı oluşturmasını sağlayan çok adımlı planlama yapısı.
- 📅 **Takvim** — Seyahat planlarının ve Community etkinliklerinin kişisel takvim üzerinden takip edilmesi.
- 🤖 **AI Travel Assistant** — Gemini API entegrasyonu ile çalışan seyahat odaklı chatbot.
- 📝 **Experiences** — Kullanıcıların şehir deneyimlerini paylaşabilmesi, gönderileri görüntüleyebilmesi, yorum yapabilmesi ve deneyimleri şehirlere göre filtreleyebilmesi.
- 👥 **Community** — Şehirlere bağlı öğrenci topluluklarının görüntülenmesi ve kullanıcıların topluluklara katılıp ayrılabilmesi.
- 🎉 **Community Events** — Topluluklara bağlı etkinliklerin görüntülenmesi ve kişisel takvime eklenebilmesi.
- 💡 **Travel Tips** — Seyahatle ilgili bilgilendirici içerikler ve detay sayfaları.
- 👤 **Kullanıcı Sistemi** — Kayıt, giriş, şifre işlemleri ve kullanıcı hesabı yönetimi.
- 💬 **İletişim** — Platform üzerinden iletişim formu gönderilebilmesi.
- 📱 **Responsive Tasarım** — Masaüstü, laptop, tablet ve mobil ekranlara uyum sağlayan arayüz.

## 🛠️ Kullanılan Teknolojiler

- Drupal 11
- PHP
- Twig
- JavaScript
- HTML5 & CSS3
- AJAX
- Drupal Form API
- Drupal Entity API / Entity Query
- Docker
- DDEV
- Linux
- Git & GitHub
- Gemini API
- FullCalendar
- Webform
- Pathauto & Token

## 🏗️ Proje Yapısı

ExploreEU, Drupal'ın modüler yapısını özel tema ve özel modüllerle birlikte kullanmaktadır.

```text
web/
├── modules/
│   └── custom/
│       ├── exploreeu_chatbot/
│       ├── exploreeu_community/
│       └── exploreeu_trip_planner/
│
└── themes/
    └── custom/
        └── exploreeu/
            ├── css/
            ├── js/
            └── templates/
```

### Özel Tema

`web/themes/custom/exploreeu`

ExploreEU özel teması; projeye ait Twig şablonlarını, CSS stillerini, JavaScript davranışlarını ve Drupal tema entegrasyonlarını içermektedir.

### Özel Modüller

**ExploreEU Trip Planner**  
Seyahat planlama özellikleriyle ilgili uygulama mantığını içerir.

**ExploreEU Chatbot**  
AI Travel Assistant için kullanılan Gemini API entegrasyonunu sağlar.

**ExploreEU Community**  
Community üyelik sistemi, Join/Leave işlemleri, Community Events ve takvim entegrasyonunu yönetir.

---

# 📸 Screenshots / Ekran Görüntüleri

## 🏠 Home

![ExploreEU Home](docs/screenshots/home-1.png)

![ExploreEU Home](docs/screenshots/home-2.png)

## ✈️ Plan Your Trip

![Plan Your Trip](docs/screenshots/plan-your-trip.png)

### Trip Planning

![Plan Your Trip](docs/screenshots/plan-your-trip-1.png)

### Transportation

![Transportation Selection](docs/screenshots/plan-your-trip-transport-1.png)

![Transportation Details](docs/screenshots/plan-your-trip-transport-2.png)

### Stay

![Stay Selection](docs/screenshots/plan-your-trip-stay-2.png)

### Weather

![Weather Information](docs/screenshots/plan-your-trip-weather.png)

### Trip Summary

![Trip Summary](docs/screenshots/plan-your-trip-summary.png)

## 📅 Calendar

![ExploreEU Calendar](docs/screenshots/calendar.png)

## 🤖 AI Travel Assistant

![ExploreEU AI Chatbot](docs/screenshots/chatbot.png)

## 📝 Experiences

![Experiences List](docs/screenshots/experiences-list.png)

![Experience Detail](docs/screenshots/experiences-detail.png)

## 👥 Community

![Community List](docs/screenshots/community-list.png)

![Community Detail](docs/screenshots/community-detail-1.png)

![Join Community](docs/screenshots/join-community-modal.png)

## 💡 Travel Tips

![Travel Tips](docs/screenshots/travel-tips.png)

![Travel Tip Detail](docs/screenshots/travel-tips-detail.png)

## 👤 User Account

![My Account](docs/screenshots/my-account.png)

---

# 🚀 Local Development / Yerel Geliştirme

The project was developed locally using **Docker and DDEV**.

Proje yerel geliştirme ortamında **Docker ve DDEV** kullanılarak geliştirilmiştir.

## Requirements / Gereksinimler

- Docker
- DDEV
- Git
- Composer

## Clone the Repository / Repoyu Klonlama

```bash
git clone https://github.com/zynpemrcksn/ExploreEU.git
cd ExploreEU
```

## Start DDEV / DDEV'i Başlatma

```bash
ddev start
```

## Install PHP Dependencies / PHP Bağımlılıklarını Yükleme

```bash
ddev composer install
```

## Rebuild Drupal Cache / Drupal Önbelleğini Temizleme

```bash
ddev drush cr
```

> **Note / Not:** Environment-specific credentials and API keys are not included in the repository. Sensitive values such as API keys must be configured locally using environment variables.
>
> Ortama özel kimlik bilgileri ve API anahtarları repository içerisinde paylaşılmamaktadır. API anahtarları gibi hassas değerlerin yerel ortamda environment variable kullanılarak yapılandırılması gerekir.

---

# 👩‍💻 Developer / Geliştirici

**Zeynep Sude Emreciksin**

Developed as an internship project — 2026.  
Staj projesi kapsamında geliştirilmiştir — 2026.

---

## 🔐 Security / Güvenlik

API keys, credentials, and other sensitive environment-specific information are excluded from version control.

API anahtarları, kimlik bilgileri ve ortama özel hassas bilgiler versiyon kontrolüne dahil edilmemektedir.
