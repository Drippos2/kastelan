# Penzión Kastelán Bojnice - PRD

## Problem Statement
Vytvoriť profesionálnu a modernú funkčnú webovú stránku pre Penzión Kastelán Bojnice s prepínaním jazykov (SK/EN/DE), kontaktným formulárom, Google Maps integráciou, rezervačným systémom, recenziami hostí a admin panelom.

## User Personas
- **Turisti** - hľadajú ubytovanie blízko Bojnického zámku
- **Rodiny** - potrebujú štvorlôžkové izby
- **Firemní klienti** - skupinové pobyty so zľavou
- **Zahraniční návštevníci** - potrebujú anglickú/nemeckú verziu
- **Admin/Majiteľ** - spravuje rezervácie, recenzie a správy

## Core Requirements
- Responzívna landing page s modernným dizajnom
- 3 jazykové mutácie (SK, EN, DE) s vlajkami
- Sekcie: Hero, O nás, Izby, Kuchyňa, Exteriér, Služby, Aktivity, Cenník, Rezervácie, Recenzie, Kontakt
- Kontaktný formulár s ukladaním do MongoDB
- Rezervačný systém s výberom izby, dátumov a kontaktných údajov
- Recenzie hostí s hviezdičkovým hodnotením
- Admin panel na správu rezervácií a recenzií
- Google Maps embed
- Smooth scrolling navigácia
- Galéria fotografií pre jednotlivé izby

## What's Been Implemented

### Phase 1 - Základná stránka (December 2025)
- [x] FastAPI backend s kontaktným API endpointom
- [x] React frontend s kompletnou landing page
- [x] Prepínanie jazykov SK/EN/DE s vlajkami
- [x] Všetky základné sekcie
- [x] Kontaktný formulár s validáciou a ukladaním do DB
- [x] Google Maps integrácia

### Phase 2 - Rozšírené izby a galéria (December 2025)
- [x] Premenovanie izieb na IZBA Č.1 až IZBA Č.5
- [x] Galéria fotografií pre IZBU Č.1 (11 fotiek)
- [x] Sekcia KUCHYŇA s fotkami
- [x] Sekcia EXTERIÉR s fotkami
- [x] Responzívny dizajn pre PC aj mobile
- [x] Image gallery modal s navigáciou a thumbnails

### Phase 3 - Pokročilý dizajn a UX (January 2026)
- [x] Ken Burns/Fade Hero slideshow s 2s intervalmi
- [x] IntersectionObserver fade-in animácie
- [x] 3D card hover efekty
- [x] Zlatý gradient text glow pre "Kastelán"
- [x] Vlastné ikony v päte (modrý FB, zelený telefón, oranžový email)
- [x] Vlastné fotografie v sekcii O nás (Námestie, Vyhliadka, ZOO)

### Phase 4 - Mobilná optimalizácia (February 2026)
- [x] Mobilný prepínač jazykov viditeľný a funkčný
- [x] Hamburger menu na mobile funguje správne

### Phase 5 - Rezervácie, Recenzie a Admin (April 2026)
- [x] Rezervačný formulár s výberom izby, kalendárovými dátumami, počtom hostí
- [x] Recenzie hostí s hviezdičkami (1-5) a formulárom na pridanie
- [x] Schvaľovanie recenzií - zobrazujú sa len po admin schválení
- [x] Admin panel s JWT autentifikáciou
- [x] Admin správa: potvrdiť/zrušiť rezervácie, schváliť/zamietnuť recenzie, zobraziť správy
- [x] Hero tlačidlá "Rezervácie" a "Recenzie" s navigáciou
- [x] Navigácia v hlavičke rozšírená o Rezervácie a Recenzie
- [x] 4 vzorové recenzie pre úvodné zobrazenie
- [x] Kompletné preklady SK/EN/DE pre všetky nové sekcie
- [x] Email notifikácia pri novej rezervácii cez Resend (na info@penzionkastelan.sk)

## Technical Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Lucide React, date-fns
- **Backend**: FastAPI, Motor (MongoDB async driver), bcrypt, PyJWT
- **Database**: MongoDB (collections: users, reservations, reviews, contact_messages)

## API Endpoints
- POST `/api/contact` - kontaktný formulár
- POST `/api/reservations` - vytvorenie rezervácie
- POST `/api/reviews` - vytvorenie recenzie
- GET `/api/reviews` - verejné schválené recenzie
- POST `/api/admin/login` - admin prihlásenie (JWT)
- GET `/api/admin/reservations` - zoznam rezervácií (auth)
- PUT `/api/admin/reservations/{id}/status` - zmena stavu (auth)
- DELETE `/api/admin/reservations/{id}` - zmazanie (auth)
- GET `/api/admin/reviews` - všetky recenzie (auth)
- PUT `/api/admin/reviews/{id}/approve` - schválenie/zamietnutie (auth)
- DELETE `/api/admin/reviews/{id}` - zmazanie (auth)
- GET `/api/admin/contacts` - kontaktné správy (auth)

## Prioritized Backlog

### P0 (Done)
- Landing page so všetkými sekciami
- Prepínanie jazykov
- Kontaktný formulár
- Galéria pre IZBY
- Mobilný prepínač jazykov
- Rezervačný systém
- Recenzie hostí
- Admin panel

### P1 (Future)
- Emailové notifikácie pri novej rezervácii
- Online platby za rezervácie

### P2 (Future)
- Kalendár dostupnosti izieb
- Automatický email potvrdenia pre hostí
