import { useState, useEffect, useCallback } from "react";
import "./App.css";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";
import AdminPanel from './AdminPanel';
import { Calendar } from "./components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Badge } from "./components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./components/ui/dropdown-menu";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { format } from "date-fns";
import { sk, enUS, de } from "date-fns/locale";
import {
  MapPin,
  Phone,
  Mail,
  Wifi,
  Tv,
  Coffee,
  ShowerHead,
  Car,
  Flame,
  TreePine,
  Bike,
  Castle,
  Clock,
  Users,
  BedDouble,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Send,
  Check,
  Globe,
  Star,
  Home,
  UtensilsCrossed,
  Facebook,
  CalendarDays,
  MessageSquare,
  UserCheck,
  Shield,
  LogOut,
  Trash2,
  CheckCircle,
  XCircle,
  ClipboardList
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = process.env.REACT_APP_API_URL || "https://kastelan.onrender.com/api";


// Translations
const translations = {
  SK: {
    nav: {
      about: "O nás",
      rooms: "Izby",
      kitchen: "Kuchyňa",
      exterior: "Exteriér",
      services: "Služby",
      activities: "Aktivity",
      pricing: "Cenník",
      reservation: "Rezervácie",
      reviews: "Recenzie",
      contact: "Kontakt"
    },
    hero: {
      overline: "Ubytovanie pod Bojnickým zámkom",
      title: "Penzión Kastelán",
      subtitle: "Bojnice",
      description: "Vychutnajte si komfort a pohostinnosť v srdci historických Bojníc. Ideálne miesto pre oddych aj aktívnu dovolenku.",
      cta: "Rezervovať",
      learnMore: "Zistiť viac"
    },
    about: {
      overline: "O penzióne",
      title: "Váš domov v Bojniciach",
      description: "Penzión Kastelán sa nachádza v tichom a príjemnom prostredí priamo pod Bojnickým zámkom, jednou z najvýznamnejších historických pamiatok Slovenska. Vďaka výbornej polohe je ideálnym miestom pre oddych aj aktívnu dovolenku.",
      feature1: "3 min od centra",
      feature2: "10 min od zámku",
      feature3: "Parkovanie v areáli"
    },
    rooms: {
      overline: "Ubytovanie",
      title: "Naše izby",
      description: "Kapacita 12 lôžok v 5 komfortne zariadených izbách",
      room: "Izba",
      amenities: "Vybavenie",
      bathroom: "Vlastná kúpeľňa",
      wifi: "Wi-Fi pripojenie",
      tv: "LED Smart TV",
      minibar: "Minibar",
      crib: "Detská postieľka na požiadanie",
      checkIn: "Check-in: od 14:00",
      checkOut: "Check-out: do 10:00",
      viewGallery: "Zobraziť galériu",
      photosAvailable: "fotografií",
      comingSoon: "Fotografie čoskoro"
    },
    kitchen: {
      overline: "Vybavenie",
      title: "Kuchyňa",
      description: "Plne vybavená kuchyňa k dispozícii pre našich hostí",
      comingSoon: "Fotografie čoskoro"
    },
    exterior: {
      overline: "Okolie penziónu",
      title: "Exteriér",
      description: "Krásne prostredie a záhrada pre váš relax",
      comingSoon: "Fotografie čoskoro"
    },
      services: {
      overline: "Služby",
      title: "Čo ponúkame",
      parking: "Parkovanie",
      parkingDesc: "Bezpečné parkovanie v uzavretom areáli",
      garden: "Záhrada",
      gardenDesc: "Možnosť grilovania a záhradných posedení",
      ebike: "E-bicykle",
      ebikeDesc: "10% zľava na požičanie e-bicyklov",
      restaurant: "Stravovanie",
      restaurantDesc: "Reštaurácie na námestí (cca 250 m)",
      gumiland: "Gumiland",
      gumilandDesc: "Zábavný park pre deti aj dospelých (cca 200 m)"
    },
    activities: {
      overline: "Okolie",
      title: "Aktivity a výlety",
      description: "Bojnice ponúkajú množstvo možností na oddych aj zábavu",
      castle: "Bojnický zámok",
      castleDesc: "Historické expozície a prehliadky",
      zoo: "ZOO Bojnice",
      zooDesc: "Zoologická záhrada pre celú rodinu",
      spa: "Kúpele a wellness",
      spaDesc: "Termálne kúpalisko a procedúry",
      falcon: "Sokoliarske vystúpenia",
      falconDesc: "Unikátne predstavenia v amfiteátri",
      horse: "E-Bicykle",
      horseDesc: "Aktivity pre milovnikov bicyklov",
      museum: "Múzeum praveku",
      museumDesc: "Prepoštská jaskyňa"
    },
    pricing: {
      overline: "Cenník",
      title: "Ceny ubytovania",
      single: "Jednolôžková izba",
      double: "Dvojlôžková izba",
      quad: "Štvorlôžková izba",
      perNight: "/ noc",
      season: "sezóna",
      offSeason: "mimo sezóny",
      spa: "Kúpeľný poplatok",
      adult: "Dospelý",
      child: "Dieťa (6-18 rokov)",
      company: "Pre firmy: od 18€ / osoba / noc po dohode"
    },
    contact: {
      overline: "Kontakt",
      title: "Napíšte nám",
      description: "Máte otázky alebo si chcete rezervovať pobyt? Neváhajte nás kontaktovať.",
      name: "Meno a priezvisko",
      email: "E-mail",
      phone: "Telefón (voliteľné)",
      message: "Správa",
      send: "Odoslať správu",
      sending: "Odosielam...",
      success: "Správa bola úspešne odoslaná!",
      error: "Chyba pri odosielaní. Skúste to prosím znova.",
      phone_label: "Telefón",
      email_label: "E-mail",
      smoking: "V penzióne je fajčenie povolené len vo vyhradených priestoroch."
    },
    footer: {
      rights: "Všetky práva vyhradené",
      address: "Bojnice, Slovensko"
    },
    gallery: {
      close: "Zavrieť",
      photo: "Fotografia"
    },
    reservation: {
      overline: "Rezervácia",
      title: "Rezervujte si pobyt",
      description: "Vyberte si izbu a termín a my sa o zvyšok postaráme",
      room: "Izba",
      selectRoom: "Vyberte izbu",
      checkIn: "Dátum príchodu",
      checkOut: "Dátum odchodu",
      guests: "Počet hostí",
      guestName: "Meno a priezvisko",
      guestEmail: "E-mail",
      guestPhone: "Telefón",
      note: "Poznámka (voliteľné)",
      submit: "Odoslať rezerváciu",
      submitting: "Odosielam...",
      success: "Rezervácia bola úspešne odoslaná! Ozveme sa vám čo najskôr.",
      error: "Chyba pri odosielaní. Skúste to prosím znova.",
      selectDate: "Vyberte dátum",
      room1: "Izba č.1 (2 lôžka)",
      room2: "Izba č.2 (2 lôžka)",
      room3: "Izba č.3 (4 lôžka)",
      room4: "Izba č.4 (2 lôžka)",
      room5: "Izba č.5 (2 lôžka)",
      heroBtn: "Rezervácie"
    },
    reviews: {
      overline: "Recenzie",
      title: "Čo hovoria naši hostia",
      description: "Prečítajte si skúsenosti našich spokojných hostí",
      addReview: "Napísať recenziu",
      yourName: "Vaše meno",
      yourRating: "Hodnotenie",
      yourReview: "Vaša recenzia",
      submit: "Odoslať recenziu",
      submitting: "Odosielam...",
      success: "Recenzia bola odoslaná! Po schválení sa zobrazí na stránke.",
      error: "Chyba pri odosielaní recenzie.",
      noReviews: "Zatiaľ žiadne recenzie. Buďte prvý!",
      heroBtn: "Recenzie"
    },
    admin: {
      title: "Administrácia",
      login: "Prihlásenie",
      email: "E-mail",
      password: "Heslo",
      loginBtn: "Prihlásiť sa",
      logout: "Odhlásiť sa",
      reservations: "Rezervácie",
      reviews: "Recenzie",
      contacts: "Správy",
      status: "Stav",
      pending: "Čakajúca",
      confirmed: "Potvrdená",
      cancelled: "Zrušená",
      approve: "Schváliť",
      reject: "Zamietnuť",
      delete: "Zmazať",
      noData: "Žiadne údaje",
      approved: "Schválená",
      notApproved: "Neschválená"
    }
  },
  EN: {
    nav: {
      about: "About",
      rooms: "Rooms",
      kitchen: "Kitchen",
      exterior: "Exterior",
      services: "Services",
      activities: "Activities",
      pricing: "Prices",
      reservation: "Reservations",
      reviews: "Reviews",
      contact: "Contact"
    },
    hero: {
      overline: "Accommodation near Bojnice Castle",
      title: "Penzión Kastelán",
      subtitle: "Bojnice",
      description: "Enjoy comfort and hospitality in the heart of historic Bojnice. The ideal place for relaxation and active holidays.",
      cta: "Book Now",
      learnMore: "Learn More"
    },
    about: {
      overline: "About Us",
      title: "Your Home in Bojnice",
      description: "Penzión Kastelán is located in a quiet and pleasant environment right under Bojnice Castle, one of the most significant historical monuments in Slovakia. Thanks to its excellent location, it is an ideal place for relaxation and active holidays.",
      feature1: "3 min from center",
      feature2: "10 min from castle",
      feature3: "On-site parking"
    },
    rooms: {
      overline: "Accommodation",
      title: "Our Rooms",
      description: "Capacity of 12 beds in 5 comfortably furnished rooms",
      room: "Room",
      amenities: "Amenities",
      bathroom: "Private bathroom",
      wifi: "Wi-Fi connection",
      tv: "LED Smart TV",
      minibar: "Minibar",
      crib: "Baby crib on request",
      checkIn: "Check-in: from 2:00 PM",
      checkOut: "Check-out: until 10:00 AM",
      viewGallery: "View gallery",
      photosAvailable: "photos",
      comingSoon: "Photos coming soon"
    },
    kitchen: {
      overline: "Facilities",
      title: "Kitchen",
      description: "Fully equipped kitchen available for our guests",
      comingSoon: "Photos coming soon"
    },
    exterior: {
      overline: "Surroundings",
      title: "Exterior",
      description: "Beautiful environment and garden for your relaxation",
      comingSoon: "Photos coming soon"
    },
      services: {
      overline: "Services",
      title: "What We Offer",
      parking: "Parking",
      parkingDesc: "Secure parking within a private gated area",
      garden: "Garden",
      gardenDesc: "BBQ facilities and cozy garden seating",
      ebike: "E-bikes",
      ebikeDesc: "10% discount on electric bike rentals",
      restaurant: "Dining",
      restaurantDesc: "Restaurants at the main square (approx. 250 m)",
      gumiland: "Gumiland",
      gumilandDesc: "Amusement park for kids and adults (only 200 m away)"
    },
    activities: {
      overline: "Surroundings",
      title: "Activities and Trips",
      description: "Bojnice offers many options for relaxation and entertainment",
      castle: "Bojnice Castle",
      castleDesc: "Historical exhibitions and tours",
      zoo: "Bojnice ZOO",
      zooDesc: "Zoological garden for the whole family",
      spa: "Spa & Wellness",
      spaDesc: "Thermal pool and treatments",
      falcon: "Falconry Shows",
      falconDesc: "Unique shows in the amphitheater",
      horse: "Horseback Riding",
      horseDesc: "Activities for horse lovers",
      museum: "Prehistory Museum",
      museumDesc: "Prepoštská Cave"
    },
    pricing: {
      overline: "Pricing",
      title: "Accommodation Prices",
      single: "Single Room",
      double: "Double Room",
      quad: "Quadruple Room",
      perNight: "/ night",
      season: "season",
      offSeason: "off-season",
      spa: "Spa Tax",
      adult: "Adult",
      child: "Child (6-18 years)",
      company: "For companies: from €18 / person / night by agreement"
    },
    contact: {
      overline: "Contact",
      title: "Get in Touch",
      description: "Have questions or want to book a stay? Don't hesitate to contact us.",
      name: "Full Name",
      email: "Email",
      phone: "Phone (optional)",
      message: "Message",
      send: "Send Message",
      sending: "Sending...",
      success: "Message sent successfully!",
      error: "Error sending message. Please try again.",
      phone_label: "Phone",
      email_label: "Email",
      smoking: "Smoking is only allowed in designated areas."
    },
    footer: {
      rights: "All rights reserved",
      address: "Bojnice, Slovakia"
    },
    gallery: {
      close: "Close",
      photo: "Photo"
    },
    reservation: {
      overline: "Reservation",
      title: "Book Your Stay",
      description: "Choose a room and dates and we'll take care of the rest",
      room: "Room",
      selectRoom: "Select room",
      checkIn: "Check-in date",
      checkOut: "Check-out date",
      guests: "Number of guests",
      guestName: "Full name",
      guestEmail: "Email",
      guestPhone: "Phone",
      note: "Note (optional)",
      submit: "Submit reservation",
      submitting: "Submitting...",
      success: "Reservation submitted successfully! We'll contact you shortly.",
      error: "Error submitting reservation. Please try again.",
      selectDate: "Select date",
      room1: "Room 1 (2 beds)",
      room2: "Room 2 (2 beds)",
      room3: "Room 3 (4 beds)",
      room4: "Room 4 (2 beds)",
      room5: "Room 5 (2 beds)",
      heroBtn: "Reservations"
    },
    reviews: {
      overline: "Reviews",
      title: "What Our Guests Say",
      description: "Read experiences from our satisfied guests",
      addReview: "Write a review",
      yourName: "Your name",
      yourRating: "Rating",
      yourReview: "Your review",
      submit: "Submit review",
      submitting: "Submitting...",
      success: "Review submitted! It will appear after approval.",
      error: "Error submitting review.",
      noReviews: "No reviews yet. Be the first!",
      heroBtn: "Reviews"
    },
    admin: {
      title: "Administration",
      login: "Login",
      email: "Email",
      password: "Password",
      loginBtn: "Sign in",
      logout: "Sign out",
      reservations: "Reservations",
      reviews: "Reviews",
      contacts: "Messages",
      status: "Status",
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      approve: "Approve",
      reject: "Reject",
      delete: "Delete",
      noData: "No data",
      approved: "Approved",
      notApproved: "Not approved"
    }
  },
  DE: {
    nav: {
      about: "Über uns",
      rooms: "Zimmer",
      kitchen: "Küche",
      exterior: "Außenbereich",
      services: "Service",
      activities: "Aktivitäten",
      pricing: "Preise",
      reservation: "Reservierungen",
      reviews: "Bewertungen",
      contact: "Kontakt"
    },
    hero: {
      overline: "Unterkunft beim Schloss Bojnice",
      title: "Penzión Kastelán",
      subtitle: "Bojnice",
      description: "Genießen Sie Komfort und Gastfreundschaft im Herzen des historischen Bojnice. Der ideale Ort für Erholung und aktiven Urlaub.",
      cta: "Jetzt buchen",
      learnMore: "Mehr erfahren"
    },
    about: {
      overline: "Über die Pension",
      title: "Ihr Zuhause in Bojnice",
      description: "Das Penzión Kastelán befindet sich in ruhiger und angenehmer Umgebung direkt unter dem Schloss Bojnice, einem der bedeutendsten historischen Denkmäler der Slowakei. Dank seiner ausgezeichneten Lage ist es ein idealer Ort für Erholung und aktiven Urlaub.",
      feature1: "3 Min. vom Zentrum",
      feature2: "10 Min. vom Schloss",
      feature3: "Parkplatz vor Ort"
    },
    rooms: {
      overline: "Unterkunft",
      title: "Unsere Zimmer",
      description: "Kapazität von 12 Betten in 5 komfortabel eingerichteten Zimmern",
      room: "Zimmer",
      amenities: "Ausstattung",
      bathroom: "Eigenes Bad",
      wifi: "WLAN-Verbindung",
      tv: "LED Smart TV",
      minibar: "Minibar",
      crib: "Babybett auf Anfrage",
      checkIn: "Check-in: ab 14:00 Uhr",
      checkOut: "Check-out: bis 10:00 Uhr",
      viewGallery: "Galerie anzeigen",
      photosAvailable: "Fotos",
      comingSoon: "Fotos folgen"
    },
    kitchen: {
      overline: "Ausstattung",
      title: "Küche",
      description: "Voll ausgestattete Küche für unsere Gäste verfügbar",
      comingSoon: "Fotos folgen"
    },
    exterior: {
      overline: "Umgebung",
      title: "Außenbereich",
      description: "Schöne Umgebung und Garten für Ihre Entspannung",
      comingSoon: "Fotos folgen"
    },
      services: {
      overline: "Dienstleistungen",
      title: "Was wir bieten",
      parking: "Parkplatz",
      parkingDesc: "Sicherer Parkplatz auf dem abgeschlossenen Gelände",
      garden: "Garten",
      gardenDesc: "Grillmöglichkeit und gemütliche Sitzbereiche im Garten",
      ebike: "E-Bikes",
      ebikeDesc: "10% Rabatt auf den E-Bike-Verleih",
      restaurant: "Verpflegung",
      restaurantDesc: "Restaurants direkt am Stadtplatz (ca. 250 m)",
      gumiland: "Gumiland",
      gumilandDesc: "Freizeitpark für Kinder und Erwachsene (nur 200 m entfernt)"
    },
    activities: {
      overline: "Umgebung",
      title: "Aktivitäten und Ausflüge",
      description: "Bojnice bietet viele Möglichkeiten zur Erholung und Unterhaltung",
      castle: "Schloss Bojnice",
      castleDesc: "Historische Ausstellungen und Führungen",
      zoo: "Zoo Bojnice",
      zooDesc: "Zoologischer Garten für die ganze Familie",
      spa: "Wellness & Spa",
      spaDesc: "Thermalbad und Behandlungen",
      falcon: "Falknerei-Shows",
      falconDesc: "Einzigartige Shows im Amphitheater",
      horse: "Reiten",
      horseDesc: "Aktivitäten für Pferdeliebhaber",
      museum: "Urgeschichtsmuseum",
      museumDesc: "Prepoštská-Höhle"
    },
    pricing: {
      overline: "Preisliste",
      title: "Unterkunftspreise",
      single: "Einzelzimmer",
      double: "Doppelzimmer",
      quad: "Vierbettzimmer",
      perNight: "/ Nacht",
      season: "Saison",
      offSeason: "Nebensaison",
      spa: "Kurtaxe",
      adult: "Erwachsener",
      child: "Kind (6-18 Jahre)",
      company: "Für Firmen: ab 18€ / Person / Nacht nach Vereinbarung"
    },
    contact: {
      overline: "Kontakt",
      title: "Kontaktieren Sie uns",
      description: "Haben Sie Fragen oder möchten Sie einen Aufenthalt buchen? Zögern Sie nicht, uns zu kontaktieren.",
      name: "Vollständiger Name",
      email: "E-Mail",
      phone: "Telefon (optional)",
      message: "Nachricht",
      send: "Nachricht senden",
      sending: "Wird gesendet...",
      success: "Nachricht erfolgreich gesendet!",
      error: "Fehler beim Senden. Bitte versuchen Sie es erneut.",
      phone_label: "Telefon",
      email_label: "E-Mail",
      smoking: "Rauchen ist nur in ausgewiesenen Bereichen gestattet."
    },
    footer: {
      rights: "Alle Rechte vorbehalten",
      address: "Bojnice, Slowakei"
    },
    gallery: {
      close: "Schließen",
      photo: "Foto"
    },
    reservation: {
      overline: "Reservierung",
      title: "Buchen Sie Ihren Aufenthalt",
      description: "Wählen Sie ein Zimmer und Termine und wir kümmern uns um den Rest",
      room: "Zimmer",
      selectRoom: "Zimmer auswählen",
      checkIn: "Anreisedatum",
      checkOut: "Abreisedatum",
      guests: "Anzahl der Gäste",
      guestName: "Vollständiger Name",
      guestEmail: "E-Mail",
      guestPhone: "Telefon",
      note: "Anmerkung (optional)",
      submit: "Reservierung absenden",
      submitting: "Wird gesendet...",
      success: "Reservierung erfolgreich gesendet! Wir melden uns bald.",
      error: "Fehler beim Senden. Bitte versuchen Sie es erneut.",
      selectDate: "Datum auswählen",
      room1: "Zimmer 1 (2 Betten)",
      room2: "Zimmer 2 (2 Betten)",
      room3: "Zimmer 3 (4 Betten)",
      room4: "Zimmer 4 (2 Betten)",
      room5: "Zimmer 5 (2 Betten)",
      heroBtn: "Reservierungen"
    },
    reviews: {
      overline: "Bewertungen",
      title: "Was unsere Gäste sagen",
      description: "Lesen Sie Erfahrungen unserer zufriedenen Gäste",
      addReview: "Bewertung schreiben",
      yourName: "Ihr Name",
      yourRating: "Bewertung",
      yourReview: "Ihre Bewertung",
      submit: "Bewertung absenden",
      submitting: "Wird gesendet...",
      success: "Bewertung gesendet! Sie wird nach Genehmigung angezeigt.",
      error: "Fehler beim Senden der Bewertung.",
      noReviews: "Noch keine Bewertungen. Seien Sie der Erste!",
      heroBtn: "Bewertungen"
    },
    admin: {
      title: "Verwaltung",
      login: "Anmeldung",
      email: "E-Mail",
      password: "Passwort",
      loginBtn: "Anmelden",
      logout: "Abmelden",
      reservations: "Reservierungen",
      reviews: "Bewertungen",
      contacts: "Nachrichten",
      status: "Status",
      pending: "Ausstehend",
      confirmed: "Bestätigt",
      cancelled: "Storniert",
      approve: "Genehmigen",
      reject: "Ablehnen",
      delete: "Löschen",
      noData: "Keine Daten",
      approved: "Genehmigt",
      notApproved: "Nicht genehmigt"
    }
  }
};

// Room data with photos
const roomsData = [
  {
    id: 1,
    photos: [
      "/images/izba1/izba1.jpg",
      "/images/izba1/izba2.jpg",
      "/images/izba1/izba3.jpg",
      "/images/izba1/izba4.jpg",
      "/images/izba1/izba5.jpg",
      "/images/izba1/izba6.jpg",

      "/images/izba1/1.jpg",
      "/images/izba1/1.2.jpg",
      "/images/izba1/1.3.jpg",
      "/images/izba1/1.4.jpg",
      "/images/izba1/1.5.jpg",
      "/images/izba1/1.6.jpg",
      "/images/izba1/1.7.jpg",
      "/images/izba1/1.8.jpg",
      "/images/izba1/1.9.jpg",
      "/images/izba1/1.10.jpg",
      "/images/izba1/1.11.jpg"
    ],
    type: "double",
    beds: 2
  },
  {
    id: 2,
    photos: [
      "/images/izba2/izba1.jpg",
      "/images/izba2/izba2.jpg",

      "/images/izba2/1.jpg",
      "/images/izba2/2.jpg",
      "/images/izba2/3.jpg",
      "/images/izba2/4.jpg",
      "/images/izba2/5.jpg",
      "/images/izba2/6.jpg",
      "/images/izba2/7.jpg",
      "/images/izba2/8.jpg",
      "/images/izba2/9.jpg",
      "/images/izba2/10.jpg"
    ],
    type: "double",
    beds: 2
  },
  {
    id: 3,
    photos: [
      "/images/izba3/izba1.jpg",
      "/images/izba3/izba2.jpg",
      "/images/izba3/izba3.jpg",
      "/images/izba3/izba4.jpg",
      "/images/izba3/izba5.jpg",
      "/images/izba3/izba6.jpg",
      "/images/izba3/izba7.jpg",
      "/images/izba3/izba8.jpg",
      "/images/izba3/izba9.jpg",
      "/images/izba3/izba10.jpg",

      "/images/izba3/1.jpg",
      "/images/izba3/2.jpg",
      "/images/izba3/3.jpg",
      "/images/izba3/4.jpg",
      "/images/izba3/5.jpg",
      "/images/izba3/6.jpg",
      "/images/izba3/7.jpg",
      "/images/izba3/8.jpg",
      "/images/izba3/9.jpg"
    ],
    type: "quad",
    beds: 4
  },
  {
    id: 4,
    photos: [
      "/images/izba4/izba1.jpg",
      "/images/izba4/izba2.jpg",
      "/images/izba4/izba3.jpg",
      "/images/izba4/izba4.jpg",

      "/images/izba4/1.jpg",
      "/images/izba4/2.jpg",
      "/images/izba4/3.jpg",
      "/images/izba4/4.jpg",
      "/images/izba4/5.jpg",
      "/images/izba4/6.jpg",
      "/images/izba4/7.jpg"
    ],
    type: "double",
    beds: 2
  },
  {
    id: 5,
    photos: [
      "/images/izba5/izba1.jpg",
      "/images/izba5/izba2.jpg",
      "/images/izba5/izba3.jpg",
      "/images/izba5/izba4.jpg",

      "/images/izba5/1.jpg",
      "/images/izba5/2.jpg",
      "/images/izba5/3.jpg",
      "/images/izba5/4.jpg",
      "/images/izba5/5.jpg",
      "/images/izba5/6.jpg"
    ],
    type: "double",
    beds: 2
  }
];

// Flag components
const FlagSK = () => (
  <img 
    src="/images/flag-sk.webp" 
    alt="Slovensky" 
    width="24" 
    height="16" 
    className="rounded-sm shadow-sm object-cover"
  />
);

const FlagEN = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" className="rounded-sm shadow-sm">
    <rect width="24" height="16" fill="#012169"/>
    <path d="M0,0 L24,16 M24,0 L0,16" stroke="#fff" strokeWidth="2.5"/>
    <path d="M0,0 L24,16 M24,0 L0,16" stroke="#C8102E" strokeWidth="1.5"/>
    <path d="M12,0 V16 M0,8 H24" stroke="#fff" strokeWidth="4"/>
    <path d="M12,0 V16 M0,8 H24" stroke="#C8102E" strokeWidth="2.5"/>
  </svg>
);

const FlagDE = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" className="rounded-sm shadow-sm">
    <rect width="24" height="5.33" fill="#000"/>
    <rect y="5.33" width="24" height="5.33" fill="#DD0000"/>
    <rect y="10.67" width="24" height="5.33" fill="#FFCC00"/>
  </svg>
);

// Image Gallery Modal Component
const ImageGallery = ({ images, isOpen, onClose, roomName, t }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
      if (e.key === 'ArrowRight') setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      data-testid="gallery-modal"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        data-testid="gallery-close-btn"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="font-heading text-xl">{roomName}</h3>
        <p className="text-white/70 text-sm">{t.gallery.photo} {currentIndex + 1} / {images.length}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
        }}
        className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        data-testid="gallery-prev-btn"
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>

      <div 
        className="max-w-5xl max-h-[80vh] px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={`${roomName} - ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
        }}
        className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        data-testid="gallery-next-btn"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>

      {/* Thumbnails */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
              idx === currentIndex ? 'border-[#3B82F6] opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

// Room Card Component
const RoomCard = ({ room, t, onOpenGallery }) => {
  const hasPhotos = room.photos.length > 0;
  const mainImage = hasPhotos 
    ? room.photos[0] 
    : "https://images.unsplash.com/photo-1647792855184-af42f1720b91?crop=entropy&cs=srgb&fm=jpg&w=800";

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#065F46]/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={mainImage}
          alt={`${t.rooms.room} č.${room.id}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {hasPhotos && (
          <button
            onClick={() => onOpenGallery(room)}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full text-sm font-medium text-[#065F46] hover:bg-white transition-colors shadow-lg"
            data-testid={`room-${room.id}-gallery-btn`}
          >
            <span>{room.photos.length} {t.rooms.photosAvailable}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {!hasPhotos && (
          <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-sm text-white">
            {t.rooms.comingSoon}
          </div>
        )}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#3B82F6] text-white text-sm font-medium rounded-full">
          {t.rooms.room} č.{room.id}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-2xl text-[#065F46]">
            {t.rooms.room} č.{room.id}
          </h3>
          <div className="flex items-center gap-2 text-[#334155]">
            <BedDouble className="w-5 h-5" />
            <span className="text-sm">{room.beds} {room.beds === 1 ? 'lôžko' : room.beds < 5 ? 'lôžka' : 'lôžok'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF9F0] rounded-lg text-xs text-[#334155]">
            <ShowerHead className="w-3.5 h-3.5" /> WC + sprcha
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF9F0] rounded-lg text-xs text-[#334155]">
            <Wifi className="w-3.5 h-3.5" /> Wi-Fi
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF9F0] rounded-lg text-xs text-[#334155]">
            <Tv className="w-3.5 h-3.5" /> Smart TV
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3E6] rounded-lg text-xs text-[#8B5E3C]">
            <span className="text-base">&#128062;</span> Malé plemená
          </span>
        </div>
      </div>
    </div>
  );
};

// Hero slideshow images
const heroImages = [
  "/images/hero/1.jpg",
  "/images/hero/2.jpg", 
  "/images/hero/3.jpg",
  "/images/hero/4.jpg",
  "/images/hero/5.jpg"
];

function App() {
// --- 1. STAVY (Všetko na jednom mieste) ---
  const [language, setLanguage] = useState("SK");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [reservationData, setReservationData] = useState({
    room_id: "",
    guest_name: "", 
    guest_email: "", 
    guest_phone: "",
    check_in: null, 
    check_out: null, 
    guests: "2", note: ""
  });
  const [reservationSending, setReservationSending] = useState(false);
  const [reviewData, setReviewData] = useState({ author_name: "", rating: 5, text: "" });
  const [reviewSending, setReviewSending] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const [adminTab, setAdminTab] = useState("reservations");
  const [adminData, setAdminData] = useState({ reservations: [], reviews: [], contacts: [] });
  const [adminLogin, setAdminLogin] = useState({ email: "", password: "" });
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

// --- 2. POMOCNÉ PREMENNÉ ---
  const dateLocale = language === "SK" ? sk : language === "DE" ? de : enUS;
  const t = translations[language];

  // --- 3. FUNKCIE NA NAČÍTANIE DÁT (Zabalené v useCallback) ---
  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/reviews`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (e) { 
      console.error("Chyba recenzií"); 
    }
  }, [API]);

const fetchBookedDates = useCallback(async (roomId) => {
  if (!roomId) return; // Ak nie je vybraná izba, nič nesťahuj
  try {
    // Pridali sme ?room_id= na koniec adresy
    const res = await axios.get(`${API}/reservations/occupied?room_id=${roomId}`);
    setBookedDates(Array.isArray(res.data) ? res.data : []);
  } catch (e) { 
    console.error("Chyba načítania obsadených termínov"); 
  }
}, [API]);

  // Funkcia, ktorá zakáže dátumy v kalendári
  const isDateDisabled = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 1. Zakáže minulosť
    if (date < today) return true;
    
    // 2. Zakáže dni, ktoré prišli z databázy
    const dateString = format(date, "yyyy-MM-dd");
    return bookedDates.includes(dateString);
  };

  // AK JE ADRESA V PREHLIADAČI PRESNE '/admin', UKÁŽ LEN ADMIN PANEL
  if (window.location.pathname === '/admin') {
    return <AdminPanel />;
  }

  // Ak to nie je /admin, ukáž klasickú stránku pre zákazníkov
  return (
    <div>
       {/* Tvoj doterajší kód (Navbar, Hero, Izby, Kuchyna, atď.) */}
    </div>
  );
  
  // --- 4. EFEKTY ---
  
// 1. Recenzie stiahneme hneď pri načítaní webu
useEffect(() => {
  fetchReviews();
}, [fetchReviews]);

// 2. Kalendár stiahneme/aktualizujeme vždy, keď hosť zmení izbu
useEffect(() => {
  if (reservationData.room_id) {
    fetchBookedDates(reservationData.room_id);
  } else {
    setBookedDates([]); // Ak nie je vybraná izba, kalendár bude "čistý"
  }
}, [reservationData.room_id, fetchBookedDates]);

  // Ostatné tvoje efekty (Slider, Scroll, Observer...)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (heroImages?.length || 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale')
            .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  

  // --- 5. ODOSIELACIE FUNKCIE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/contact`, { ...formData, language });
      toast.success(t.contact.success);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error(t.contact.error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Reservation submit
    const handleReservationSubmit = async (e) => {
    e.preventDefault();
    if (!reservationData.check_in || !reservationData.check_out) {
      toast.error("Prosím, vyberte termín príchodu a odchodu.");
      return;
    }

    setReservationSending(true);
    try {
      await axios.post(`${API}/reservations`, {
        ...reservationData,
        check_in: format(reservationData.check_in, "yyyy-MM-dd"),
        check_out: format(reservationData.check_out, "yyyy-MM-dd"),
        language: language
      });
      
      toast.success(t.reservation.success);
      // Reset formulára
      setReservationData({
        room_id: "", guest_name: "", guest_email: "", guest_phone: "",
        check_in: null, check_out: null, guests: "2", note: ""
      });
      // Po úspešnej rezervácii hneď aktualizujeme obsadené dátumy v kalendári
      fetchBookedDates();
    } catch (error) {
      toast.error(t.reservation.error);
    } finally {
      setReservationSending(false);
    }
  };

  const handleReviewSubmit = async (e) => {
  e.preventDefault();
  setReviewSending(true);

  // Vytvoríme dáta presne tak, ako ich chce tvoj server.py
  const payload = {
    author: reviewData.author_name, // Mapujeme author_name na author
    rating: Number(reviewData.rating), // Musí to byť číslo
    text: reviewData.text,
    language: language || "SK"
  };

  try {
    await axios.post(`${API}/reviews`, payload);
    toast.success(t.reviews.success);
    setReviewData({ author_name: "", rating: 5, text: "" });
    setShowReviewForm(false);
    fetchReviews();
  } catch (error) {
    // Ak to zlyhá, uvidíš v F12 presne čo serveru vadí
    console.error("CHYBA SERVERA:", error.response?.data);
    toast.error(t.reviews.error);
  } finally {
    setReviewSending(false);
  }
};

  // Admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/admin/login`, adminLogin);
      setAdminToken(res.data.token);
      toast.success("Prihlásenie úspešné");
      fetchAdminData(res.data.token);
    } catch (error) {
      toast.error("Nesprávne prihlasovacie údaje");
    }
  };

  const fetchAdminData = async (token) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resR, resRv, resC] = await Promise.all([
        axios.get(`${API}/admin/reservations`, { headers }),
        axios.get(`${API}/admin/reviews`, { headers }),
        axios.get(`${API}/admin/contacts`, { headers })
      ]);
      setAdminData({ reservations: resR.data, reviews: resRv.data, contacts: resC.data });
    } catch (e) {
      if (e.response?.status === 401) { setAdminToken(null); }
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await axios.put(`${API}/admin/reservations/${id}/status`, { status }, { headers: { Authorization: `Bearer ${adminToken}` } });
      fetchAdminData(adminToken);
    } catch (e) { toast.error("Chyba"); }
  };

  const toggleReviewApproval = async (id, approved) => {
    try {
      await axios.put(`${API}/admin/reviews/${id}/approve`, { approved }, { headers: { Authorization: `Bearer ${adminToken}` } });
      fetchAdminData(adminToken);
      fetchReviews();
    } catch (e) { toast.error("Chyba"); }
  };

  const deleteAdminItem = async (type, id) => {
    try {
      await axios.delete(`${API}/admin/${type}/${id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      fetchAdminData(adminToken);
      if (type === "reviews") fetchReviews();
    } catch (e) { toast.error("Chyba"); }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const openGallery = (room) => {
    setSelectedRoom(room);
    setGalleryOpen(true);
  };

  const languageOptions = [
    { code: "SK", flag: <FlagSK />, label: "Slovensky" },
    { code: "EN", flag: <FlagEN />, label: "English" },
    { code: "DE", flag: <FlagDE />, label: "Deutsch" }
  ];

  const currentLang = languageOptions.find(l => l.code === language);

  return (
    <div className="min-h-screen bg-[#FEF9F0]" data-testid="app-container">
      <Toaster position="top-right" richColors />
      
      {/* Gallery Modal */}
      {selectedRoom && (
        <ImageGallery
          images={selectedRoom.photos}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          roomName={`${t.rooms.room} č.${selectedRoom.id}`}
          t={t}
        />
      )}
      
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-black shadow-xl" 
            : "bg-black/90 backdrop-blur-md"
        }`}
        data-testid="header"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo + Facebook */}
            <div className="flex items-center gap-3">
              <a href="#" className="flex items-center gap-3 group" data-testid="logo">
                <img 
                  src="/images/logo-penzion.jpg" 
                  alt="Penzión Kastelán" 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-lg ring-2 ring-[#34D399]/30 group-hover:ring-[#34D399]/60 transition-all"
                />
                <span className="font-heading text-xl md:text-2xl font-bold bg-gradient-to-r from-[#34D399] to-[#059669] bg-clip-text text-transparent">
                  Kastelán
                </span>
              </a>
              <a
                href="https://www.facebook.com/penzionkastelan/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1877F2] hover:bg-[#166FE5] transition-colors"
                data-testid="header-facebook"
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-6" data-testid="desktop-nav">
              {[
                { id: "about", label: t.nav.about },
                { id: "rooms", label: t.nav.rooms },
                { id: "kitchen", label: t.nav.kitchen },
                { id: "exterior", label: t.nav.exterior },
                { id: "services", label: t.nav.services },
                { id: "activities", label: t.nav.activities },
                { id: "pricing", label: t.nav.pricing },
                { id: "reservation", label: t.nav.reservation },
                { id: "reviews-section", label: t.nav.reviews },
                { id: "contact", label: t.nav.contact }
              ].map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="nav-link-light text-sm font-medium text-white/80 hover:text-[#34D399] transition-colors" data-testid={`nav-${item.id}`}>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Language Switcher & CTA */}
            <div className="flex items-center gap-3">
              {/* Language switcher - visible on all screens with clear background */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors border border-white/20"
                    data-testid="language-switcher"
                  >
                    <div className="w-6 h-4 overflow-hidden rounded-sm shadow-sm">
                      {currentLang?.flag}
                    </div>
                    <ChevronDown className="w-4 h-4 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-[#065F46]/10">
                  {languageOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.code}
                      onClick={() => setLanguage(option.code)}
                      className={`flex items-center gap-3 cursor-pointer ${language === option.code ? "bg-[#3B82F6]/10" : ""}`}
                      data-testid={`lang-switch-${option.code.toLowerCase()}`}
                    >
                      {option.flag}
                      <span>{option.label}</span>
                      {language === option.code && <Check className="w-4 h-4 text-[#3B82F6] ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => scrollToSection("contact")}
                className="hidden md:flex bg-gradient-to-r from-[#10B981] to-[#3B82F6] hover:from-[#059669] hover:to-[#2563EB] text-white font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
                data-testid="header-cta"
              >
                {t.hero.cta}
              </Button>

              {/* Mobile Menu Button - visible hamburger icon */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors border border-white/20"
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="xl:hidden absolute left-0 right-0 top-16 border-t border-white/10 mobile-menu max-h-[70vh] overflow-y-auto z-50"
            style={{ backgroundColor: '#081C15' }}
            data-testid="mobile-menu"
          >
            <nav className="flex flex-col p-4 gap-1" style={{ backgroundColor: '#065F46' }}>
              {[
                { id: "about", label: t.nav.about },
                { id: "rooms", label: t.nav.rooms },
                { id: "kitchen", label: t.nav.kitchen },
                { id: "exterior", label: t.nav.exterior },
                { id: "services", label: t.nav.services },
                { id: "activities", label: t.nav.activities },
                { id: "pricing", label: t.nav.pricing },
                { id: "reservation", label: t.nav.reservation },
                { id: "reviews-section", label: t.nav.reviews },
                { id: "contact", label: t.nav.contact }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left px-4 py-3 rounded-lg hover:bg-white/10 font-medium transition-colors"
                  style={{ color: 'white' }}
                  data-testid={`mobile-nav-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section with Slideshow */}
      <section 
        className="relative min-h-screen flex items-center overflow-hidden"
        data-testid="hero-section"
      >
        {/* Slideshow Background */}
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === index 
                ? 'opacity-100' 
                : 'opacity-0'
            }`}
            style={{ 
              backgroundImage: `url('${img}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ))}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        
        {/* Slideshow indicators */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'w-8 bg-[#10B981]' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              data-testid={`hero-slide-indicator-${index}`}
            />
          ))}
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
          <div className="max-w-4xl text-center mx-auto">
            {/* Overline at very top */}
            <p className="text-[#34D399] font-medium tracking-[0.3em] uppercase text-xs sm:text-sm mb-8 animate-fade-in-up">
              {t.hero.overline}
            </p>
            
            {/* Main title - Penzión smaller, Kastelán bigger with different color */}
            <h1 className="font-heading font-bold mb-4 animate-fade-in-up animation-delay-200 leading-none">
              <span className="block text-4xl sm:text-5xl md:text-7xl text-white/90 mb-2">Penzión</span>
              <span className="block text-5xl sm:text-6xl md:text-8xl lg:text-[8rem] bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#059669] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                Kastelán
              </span>
            </h1>
            
            {/* Bojnice - bold */}
            <p className="hero-subtitle font-heading text-3xl sm:text-4xl md:text-6xl font-bold mb-8 animate-fade-in-up animation-delay-200 text-[#6EE7B7]">
              {t.hero.subtitle}
            </p>
            
            <p className="text-white/90 text-base sm:text-lg md:text-xl mb-10 leading-relaxed animate-fade-in-up animation-delay-400 max-w-xl mx-auto">
              {t.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600 justify-center">
              <Button
                onClick={() => scrollToSection("reservation")}
                size="lg"
                className="bg-gradient-to-r from-[#10B981] to-[#3B82F6] hover:from-[#059669] hover:to-[#2563EB] text-white btn-glow cta-pulse px-8 py-6 text-lg font-semibold shadow-lg"
                data-testid="hero-cta"
              >
                {t.hero.cta}
              </Button>
              <Button
                onClick={() => scrollToSection("about")}
                size="lg"
                variant="outline"
                className="border-2 border-white/80 text-white hover:bg-white/10 bg-transparent py-6 text-lg"
                data-testid="hero-learn-more"
              >
                {t.hero.learnMore}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up animation-delay-600 justify-center mt-4">
              <Button
                onClick={() => scrollToSection("reviews-section")}
                size="lg"
                variant="outline"
                className="border-2 border-white/40 text-white/80 hover:bg-white/10 bg-transparent py-5 text-base"
                data-testid="hero-reviews-btn"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                {t.reviews.heroBtn}
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block z-20">
          <ChevronDown className="w-10 h-10 text-white/70" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-32" data-testid="about-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Text content */}
            <div className="lg:col-span-5 fade-in-left">
              <p className="overline mb-2 text-center lg:text-left">{t.about.overline}</p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#065F46] mb-6 text-center lg:text-left">
                {t.about.title}
              </h2>
              <p className="text-[#334155] text-base md:text-lg leading-relaxed mb-8">
                {t.about.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 stagger-children">
                <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-br from-[#3B82F6]/15 to-[#10B981]/10 hover:from-[#3B82F6]/25 hover:to-[#10B981]/20 transition-all duration-300 fade-in-up">
                  <MapPin className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                  <span className="text-[#065F46] font-medium text-sm">{t.about.feature1}</span>
                </div>
                <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-br from-[#3B82F6]/15 to-[#10B981]/10 hover:from-[#3B82F6]/25 hover:to-[#10B981]/20 transition-all duration-300 fade-in-up">
                  <Castle className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                  <span className="text-[#065F46] font-medium text-sm">{t.about.feature2}</span>
                </div>
                <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-br from-[#3B82F6]/15 to-[#10B981]/10 hover:from-[#3B82F6]/25 hover:to-[#10B981]/20 transition-all duration-300 fade-in-up">
                  <Car className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                  <span className="text-[#065F46] font-medium text-sm">{t.about.feature3}</span>
                </div>
              </div>
            </div>

            {/* Image bento grid */}
            <div className="lg:col-span-7 fade-in-right">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {/* Main image - Námestie s hradom */}
                <div className="col-span-2 aspect-[16/9] rounded-2xl overflow-hidden img-hover-zoom shadow-lg relative group">
                  <img 
                    src="/images/about/namestie.jpg" 
                    alt="Námestie Bojnice s hradom"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="absolute bottom-4 left-4 text-white font-medium text-lg">Námestie Bojnice</p>
                  </div>
                </div>
                {/* Vyhliadka */}
                <div className="aspect-square rounded-2xl overflow-hidden img-hover-zoom shadow-lg relative group">
                  <img 
                    src="/images/about/vyhliadka.jpg" 
                    alt="Vyhliadková veža"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="absolute bottom-3 left-3 text-white font-medium">Vyhliadka</p>
                  </div>
                </div>
                {/* ZOO Bojnice */}
                <div className="aspect-square rounded-2xl overflow-hidden img-hover-zoom shadow-lg relative group">
                  <img 
                    src="/images/about/zoo.jpg" 
                    alt="ZOO Bojnice"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="absolute bottom-3 left-3 text-white font-medium">ZOO Bojnice</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-16 md:py-32 bg-white" data-testid="rooms-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16 fade-in-up">
            <p className="overline mb-2">{t.rooms.overline}</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-gradient-dark mb-4">
              {t.rooms.title}
            </h2>
            <p className="text-[#334155] text-base md:text-lg max-w-2xl mx-auto">
              {t.rooms.description}
            </p>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
            {roomsData.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                t={t}
                onOpenGallery={openGallery}
              />
            ))}
          </div>

          {/* Amenities */}
          <div className="card-elegant p-6 md:p-8">
            <h4 className="font-heading text-xl md:text-2xl text-[#065F46] mb-6">{t.rooms.amenities}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              <div className="amenity-badge text-xs md:text-sm">
                <ShowerHead className="w-4 h-4 flex-shrink-0" />
                <span>{t.rooms.bathroom}</span>
              </div>
              <div className="amenity-badge text-xs md:text-sm">
                <Wifi className="w-4 h-4 flex-shrink-0" />
                <span>{t.rooms.wifi}</span>
              </div>
              <div className="amenity-badge text-xs md:text-sm">
                <Tv className="w-4 h-4 flex-shrink-0" />
                <span>{t.rooms.tv}</span>
              </div>
              <div className="amenity-badge text-xs md:text-sm">
                <Coffee className="w-4 h-4 flex-shrink-0" />
                <span>{t.rooms.minibar}</span>
              </div>
              <div className="amenity-badge text-xs md:text-sm">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{t.rooms.checkIn}</span>
              </div>
              <div className="amenity-badge text-xs md:text-sm">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{t.rooms.checkOut}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sekcia Ďalšie - vložiť medzi Kitchen a Services */}
      <section id="others" className="py-16 md:py-32 bg-gray-50" data-testid="others-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="overline mb-4">Galéria</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#065F46] mb-4">
              Ďalšie priestory
            </h2>
            <p className="text-[#334155] text-base md:text-lg max-w-2xl mx-auto">
              Nahliadnite do ďalších zákutí nášho penziónu, ktoré dotvárajú celkovú atmosféru vášho pobytu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-sm">
              <img 
                src="/images/ostatne/1.jpg" 
                alt="Penzión priestory 1" 
                className="w-full h-full object-cover img-hover" 
              />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-sm">
              <img 
                src="/images/ostatne/2.jpg" 
                alt="Penzión priestory 2" 
                className="w-full h-full object-cover img-hover" 
              />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-sm">
              <img 
                src="/images/ostatne/3.jpg" 
                alt="Penzión priestory 3" 
                className="w-full h-full object-cover img-hover" 
              />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-sm">
              <img 
                src="/images/ostatne/4.jpg" 
                alt="Penzión priestory 4" 
                className="w-full h-full object-cover img-hover" 
              />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-sm">
              <img 
                src="/images/ostatne/5.jpg" 
                alt="Penzión priestory 5" 
                className="w-full h-full object-cover img-hover" 
              />
            </div>
          </div>
        </div>
      </section>

       {/* Kitchen Section */}
      <section id="kitchen" className="py-16 md:py-32" data-testid="kitchen-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="overline mb-4">{t.kitchen.overline}</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#065F46] mb-4">
              {t.kitchen.title}
            </h2>
            <p className="text-[#334155] text-base md:text-lg max-w-2xl mx-auto">
              {t.kitchen.description}
            </p>
          </div>

          {/* NOVÉ FOTKY (izba1.jpg až izba6.jpg) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 aspect-video md:aspect-[16/10] rounded-2xl overflow-hidden">
              <img 
                src="/images/kuchyna/kuchyna1.jpg" 
                alt="Kuchyňa hlavná"
                className="w-full h-full object-cover img-hover"
              />
            </div>
            <div className="grid grid-rows-2 gap-4 md:gap-6">
              <div className="aspect-video md:aspect-auto rounded-2xl overflow-hidden">
                <img src="/images/kuchyna/kuchyna2.jpg" alt="Kuchyňa detail 1" className="w-full h-full object-cover img-hover" />
              </div>
              <div className="aspect-video md:aspect-auto rounded-2xl overflow-hidden">
                <img src="/images/kuchyna/kuchyna3.jpg" alt="Kuchyňa detail 2" className="w-full h-full object-cover img-hover" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
            <div className="aspect-video rounded-2xl overflow-hidden">
              <img src="/images/kuchyna/kuchyna4.jpg" alt="Kuchyňa celok" className="w-full h-full object-cover img-hover" />
            </div>
          </div>

          {/* 3. BLOK - STARÉ FOTKY (Všetkých 6 kusov pre maximálnu dĺžku) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
            <div className="aspect-video rounded-2xl overflow-hidden opacity-100 hover:opacity-100 transition-opacity">
              <img src="/images/kuchyna/1.jpg" alt="Kuchyňa pôvodná 1" className="w-full h-full object-cover img-hover" />
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden opacity-100 hover:opacity-100 transition-opacity">
              <img src="/images/kuchyna/2.jpg" alt="Kuchyňa pôvodná 2" className="w-full h-full object-cover img-hover" />
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden opacity-100 hover:opacity-100 transition-opacity">
              <img src="/images/kuchyna/3.jpg" alt="Kuchyňa pôvodná 3" className="w-full h-full object-cover img-hover" />
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden opacity-100 hover:opacity-100 transition-opacity">
              <img src="/images/kuchyna/4.jpg" alt="Kuchyňa pôvodná 4" className="w-full h-full object-cover img-hover" />
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden opacity-100 hover:opacity-100 transition-opacity">
              <img src="/images/kuchyna/5.jpg" alt="Kuchyňa pôvodná 5" className="w-full h-full object-cover img-hover" />
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden opacity-100 hover:opacity-100 transition-opacity">
              <img src="/images/kuchyna/6.jpg" alt="Kuchyňa pôvodná 6" className="w-full h-full object-cover img-hover" />
            </div>
          </div>
        </div>
      </section>

      {/* Exterior Section */}
      <section id="exterior" className="py-16 md:py-32 bg-white" data-testid="exterior-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="overline mb-4">{t.exterior.overline}</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#065F46] mb-4">
              {t.exterior.title}
            </h2>
            <p className="text-[#334155] text-base md:text-lg max-w-2xl mx-auto">
              {t.exterior.description}
            </p>
          </div>

          {/* NOVÉ FOTKY EXTERIÉRU (ex1 až ex6) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="md:col-span-2 aspect-video md:aspect-[16/10] rounded-2xl overflow-hidden">
              <img 
                src="/images/exterier/ex1.jpg" 
                alt="Exteriér nová hlavná"
                className="w-full h-full object-cover img-hover"
              />
            </div>
            <div className="grid grid-rows-2 gap-4 md:gap-6">
              <div className="aspect-video md:aspect-auto rounded-2xl overflow-hidden">
                <img src="/images/exterier/ex2.jpg" alt="Exteriér detail 1" className="w-full h-full object-cover img-hover" />
              </div>
              <div className="aspect-video md:aspect-auto rounded-2xl overflow-hidden">
                <img src="/images/exterier/ex3.jpg" alt="Exteriér detail 2" className="w-full h-full object-cover img-hover" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6 mb-12">
            <div className="aspect-video rounded-2xl overflow-hidden">
              <img src="/images/exterier/ex4.jpg" alt="Exteriér záhrada" className="w-full h-full object-cover img-hover" />
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden">
              <img src="/images/exterier/ex5.jpg" alt="Exteriér altánok" className="w-full h-full object-cover img-hover" />
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden">
              <img src="/images/exterier/ex6.jpg" alt="Exteriér pohľad" className="w-full h-full object-cover img-hover" />
            </div>
          </div>

          {/* PÔVODNÉ FOTKY EXTERIÉRU (1 až 22) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((num) => (
              <div key={num} className="aspect-square rounded-xl overflow-hidden">
                <img 
                  src={`/images/exterier/${num}.jpg`}
                  alt={`Exteriér pôvodný ${num}`}
                  className="w-full h-full object-cover img-hover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-32" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16 fade-in-up">
            <p className="overline mb-2">{t.services.overline}</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-gradient-dark">
              {t.services.title}
            </h2>
          </div>

          {/* ZMENA: pridané lg:grid-cols-5 pre 5 kariet v rade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 stagger-children">
            
            {/* Parkovanie */}
            <div className="card-3d fade-in-scale">
              <div className="card-3d-inner card-elegant service-card-3d p-6 text-center">
                <div className="service-icon mx-auto mb-4">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg text-[#065F46] mb-2">{t.services.parking}</h3>
                <p className="text-[#334155] text-sm">{t.services.parkingDesc}</p>
              </div>
            </div>

            {/* Záhrada */}
            <div className="card-3d fade-in-scale">
              <div className="card-3d-inner card-elegant service-card-3d p-6 text-center">
                <div className="service-icon mx-auto mb-4">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg text-[#065F46] mb-2">{t.services.garden}</h3>
                <p className="text-[#334155] text-sm">{t.services.gardenDesc}</p>
              </div>
            </div>

            {/* Gumiland - NOVINKA v strede pre balans */}
            <div className="card-3d fade-in-scale">
              <div className="card-3d-inner card-elegant service-card-3d p-6 text-center border-2 border-[#065F46]/10">
                <div className="service-icon mx-auto mb-4 bg-[#065F46]/5">
                  <Castle className="w-6 h-6 text-[#065F46]" />
                </div>
                <h3 className="font-heading text-lg text-[#065F46] mb-2">{t.services.gumiland}</h3>
                <p className="text-[#334155] text-sm">{t.services.gumilandDesc}</p>
              </div>
            </div>

            {/* E-bicykle */}
            <div className="card-3d fade-in-scale">
              <div className="card-3d-inner card-elegant service-card-3d p-6 text-center">
                <div className="service-icon mx-auto mb-4">
                  <Bike className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg text-[#065F46] mb-2">{t.services.ebike}</h3>
                <p className="text-[#334155] text-sm">{t.services.ebikeDesc}</p>
              </div>
            </div>

            {/* Stravovanie */}
            <div className="card-3d fade-in-scale">
              <div className="card-3d-inner card-elegant service-card-3d p-6 text-center">
                <div className="service-icon mx-auto mb-4">
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg text-[#065F46] mb-2">{t.services.restaurant}</h3>
                <p className="text-[#334155] text-sm">{t.services.restaurantDesc}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="py-16 md:py-32 bg-[#081C15]" data-testid="activities-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12 md:mb-16">
            <div className="text-left fade-in-up">
              <p className="text-[#34D399] font-medium tracking-widest uppercase text-sm mb-4">
                {t.activities.overline}
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white mb-4">
                {t.activities.title}
              </h2>
              <p className="text-white/70 text-base md:text-lg max-w-2xl">
                {t.activities.description}
              </p>
            </div>
            
            {/* YouTube Video vpravo hore */}
            <div className="fade-in-up delay-200">
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/VD983mD6k1s"
                  title="Penzión Kastelán Bojnice"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 stagger-children">
            {[
              { icon: Castle, title: t.activities.castle, desc: t.activities.castleDesc },
              { icon: TreePine, title: t.activities.zoo, desc: t.activities.zooDesc },
              { icon: Star, title: t.activities.spa, desc: t.activities.spaDesc },
              { icon: Globe, title: t.activities.falcon, desc: t.activities.falconDesc },
              { icon: Bike, title: t.activities.horse, desc: t.activities.horseDesc },
              { icon: MapPin, title: t.activities.museum, desc: t.activities.museumDesc }
            ].map((activity, index) => (
              <div 
                key={index}
                className="activity-card bg-white/10 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10 fade-in-scale"
              >
                <activity.icon className="w-7 h-7 md:w-8 md:h-8 text-[#34D399] mb-3 md:mb-4" />
                <h3 className="font-heading text-lg md:text-xl text-white mb-2">{activity.title}</h3>
                <p className="text-white/70 text-sm">{activity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-32" data-testid="pricing-section">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <p className="overline mb-4">{t.pricing.overline}</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#065F46]">
              {t.pricing.title}
            </h2>
          </div>

          <div className="card-elegant p-6 md:p-8 lg:p-12">
            {/* Room prices */}
            <div className="space-y-0">
              <div className="price-row flex-col sm:flex-row gap-2 sm:gap-0">
                <span className="text-[#065F46] font-medium">{t.pricing.double}</span>
                <div className="text-left sm:text-right">
                  <span className="text-[#3B82F6] font-heading text-xl md:text-2xl">40 € </span>
                  <span className="text-sm text-[#334155]">/ 50 € ({t.pricing.season})</span>
                </div>
              </div>
              <div className="price-row flex-col sm:flex-row gap-2 sm:gap-0">
                <span className="text-[#065F46] font-medium">{t.pricing.quad}</span>
                <div className="text-left sm:text-right">
                  <span className="text-[#3B82F6] font-heading text-xl md:text-2xl">60 € </span>
                  <span className="text-sm text-[#334155]">/ 80 € ({t.pricing.season})</span>
                </div>
              </div>
            </div>

            <div className="my-6 md:my-8 h-px bg-[#065F46]/10" />

            {/* Spa tax */}
            <div className="mb-6">
              <h4 className="font-heading text-lg md:text-xl text-[#065F46] mb-4">{t.pricing.spa}</h4>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#334155]" />
                  <span className="text-[#334155]">{t.pricing.adult}:</span>
                  <span className="text-[#065F46] font-medium">1,50 €</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#334155]" />
                  <span className="text-[#334155]">{t.pricing.child}:</span>
                  <span className="text-[#065F46] font-medium">1,00 €</span>
                </div>
              </div>
            </div>

            <p className="text-[#334155] text-sm bg-[#10B981]/10 p-4 rounded-xl">
              {t.pricing.company}
            </p>
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <section id="reservation" className="py-16 md:py-32 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-5xl text-[#065F46] mb-4">
              {t.reservation.title}
            </h2>
            <p className="text-slate-600">{t.reservation.description}</p>
          </div>

          <form onSubmit={handleReservationSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            
            {/* Room Selection - Opravené pre mobily */}
            <div>
              <Label className="text-[#065F46] mb-2 block font-medium">
                {t.reservation.room_label || "Vyberte izbu"}
              </Label>
              <div className="relative">
                <select
                  value={reservationData.room_id}
                  onChange={(e) => setReservationData({...reservationData, room_id: e.target.value})}
                  className="w-full h-11 pl-3 pr-10 rounded-md border border-[#065F46]/20 bg-white text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 appearance-none cursor-pointer"
                  data-testid="reservation-room-select"
                  required
                >
                  <option value="" disabled>{t.reservation.selectRoom || "Vyberte si izbu"}</option>
                  <option value="1">Izba č. 1 (Dvojlôžková)</option>
                  <option value="2">Izba č. 2 (Dvojlôžková)</option>
                  <option value="3">Izba č. 3 (Štvorlôžková)</option>
                  <option value="4">Izba č. 4 (Dvojlôžková)</option>
                  <option value="5">Izba č. 5 (Dvojlôžková)</option>
                </select>
                {/* Vlastná šípka, aby to vyzeralo dobre */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#065F46]/50">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Dátum Príchodu */}
            <div className="space-y-2">
              <Label>{t.reservation.check_in_label || "Príchod"}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left py-6">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {reservationData.check_in ? format(reservationData.check_in, "PPP", { locale: dateLocale }) : <span>Vyberte dátum</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reservationData.check_in}
                    onSelect={(date) => setReservationData({ ...reservationData, check_in: date })}
                    disabled={isDateDisabled}
                    initialFocus
                    locale={dateLocale}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Dátum Odchodu */}
            <div className="space-y-2">
              <Label>{t.reservation.check_out_label || "Odchod"}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left py-6">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {reservationData.check_out ? format(reservationData.check_out, "PPP", { locale: dateLocale }) : <span>Vyberte dátum</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reservationData.check_out}
                    onSelect={(date) => setReservationData({ ...reservationData, check_out: date })}
                    disabled={isDateDisabled}
                    initialFocus
                    locale={dateLocale}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Osobné údaje */}
            <div className="space-y-2">
              <Label>{t.contact.name}</Label>
              <Input 
                required
                value={reservationData.guest_name}
                onChange={(e) => setReservationData({ ...reservationData, guest_name: e.target.value })}
                className="py-6"
              />
            </div>

            <div className="space-y-2">
              <Label>{t.contact.email}</Label>
              <Input 
                type="email" 
                required
                value={reservationData.guest_email}
                onChange={(e) => setReservationData({ ...reservationData, guest_email: e.target.value })}
                className="py-6"
              />
            </div>

         {/* SEM VLOŽ TENTO NOVÝ BLOK PRE TELEFÓN: */}
           <div className="space-y-2">
           <Label>{t.contact.phone || "Telefónne číslo"}</Label>
           <Input 
            type="tel" 
            placeholder="+421 9xx xxx xxx"
            required
            value={reservationData.guest_phone}
            onChange={(e) => setReservationData({ ...reservationData, guest_phone: e.target.value })}
            className="py-6"
          />
       </div>

            {/* Tlačidlo Odoslať */}
            <div className="md:col-span-2 mt-4">
              <Button 
                type="submit" 
                disabled={reservationSending}
                className="w-full bg-[#065F46] hover:bg-[#054F3A] text-white py-8 text-xl font-bold rounded-2xl transition-all shadow-lg"
              >
                {reservationSending ? "Odosielam..." : t.reservation.submit_btn || "Záväzne rezervovať"}
              </Button>
            </div>
          </form>
        </div>
      </section>
      {/* Reviews Section */}
      <section id="reviews-section" className="py-16 md:py-32 bg-[#081C15]" data-testid="reviews-section">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16 fade-in-up">
            <p className="text-[#34D399] font-medium tracking-widest uppercase text-sm mb-4">
              {t.reviews.overline}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white mb-4">
              {t.reviews.title}
            </h2>
            <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
              {t.reviews.description}
            </p>
          </div>

          {/* Reviews Grid */}
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10" data-testid={`review-card-${review.id}`}>
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-5 h-5 ${s <= review.rating ? "text-[#34D399] fill-[#34D399]" : "text-white/20"}`} />
                    ))}
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed mb-4">{review.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#34D399] font-medium text-sm">{review.author_name}</span>
                    <span className="text-white/40 text-xs">{new Date(review.created_at).toLocaleDateString(language === "SK" ? "sk-SK" : language === "DE" ? "de-DE" : "en-US")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/50 mb-10">{t.reviews.noReviews}</p>
          )}

          {/* Add Review Form Toggle */}
          <div className="text-center">
            {!showReviewForm ? (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="bg-gradient-to-r from-[#10B981] to-[#3B82F6] hover:from-[#059669] hover:to-[#2563EB] text-white font-semibold px-8 py-6 text-lg"
                data-testid="add-review-btn"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                {t.reviews.addReview}
              </Button>
            ) : (
              <form onSubmit={handleReviewSubmit} className="max-w-lg mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-4 text-left" data-testid="review-form">
                <div>
                  <Label className="text-white/80 mb-2 block">{t.reviews.yourName}</Label>
                  <Input
                    required
                    value={reviewData.author_name}
                    onChange={(e) => setReviewData({...reviewData, author_name: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    data-testid="review-name-input"
                  />
                </div>
                <div>
                  <Label className="text-white/80 mb-2 block">{t.reviews.yourRating}</Label>
                  <div className="flex gap-1" data-testid="review-rating">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewData({...reviewData, rating: s})}
                        className="p-1 transition-transform hover:scale-110"
                        data-testid={`review-star-${s}`}
                      >
                        <Star className={`w-7 h-7 ${s <= reviewData.rating ? "text-[#34D399] fill-[#34D399]" : "text-white/30"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-white/80 mb-2 block">{t.reviews.yourReview}</Label>
                  <Textarea
                    required
                    rows={4}
                    value={reviewData.text}
                    onChange={(e) => setReviewData({...reviewData, text: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                    data-testid="review-text-input"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={reviewSending}
                    className="flex-1 bg-gradient-to-r from-[#10B981] to-[#3B82F6] text-white font-semibold py-5"
                    data-testid="review-submit-btn"
                  >
                    {reviewSending ? t.reviews.submitting : t.reviews.submit}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-32" data-testid="contact-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <p className="overline mb-4">{t.contact.overline}</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#065F46] mb-4">
              {t.contact.title}
            </h2>
            <p className="text-[#334155] text-base md:text-lg max-w-2xl mx-auto">
              {t.contact.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Map */}
            <div className="map-container aspect-video lg:aspect-auto lg:h-full min-h-[300px] md:min-h-[400px] order-2 lg:order-1">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2632.8!2d18.5752!3d48.7785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471495f0c92c16e7%3A0x8e5e8a5a5a5a5a5a!2s%C5%A0portov%C3%A1%20536%2F25%2C%20972%2001%20Bojnice%2C%20Slovakia!5e0!3m2!1ssk!2ssk!4v1709000000000!5m2!1ssk!2ssk"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "300px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Penzión Kastelán - Športová 536/25, 972 01 Bojnice"
              />
            </div>

            {/* Contact Form */}
            <div className="order-1 lg:order-2">
              <div className="mb-6 md:mb-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="service-icon flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-[#334155]">{t.contact.phone_label}</p>
                    <a href="tel:0905327279" className="text-[#065F46] font-medium hover:text-[#3B82F6] transition-colors">
                      0905 327 279
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="service-icon flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-[#334155]">{t.contact.email_label}</p>
                    <a href="mailto:info@penzionkastelan.sk" className="text-[#065F46] font-medium hover:text-[#3B82F6] transition-colors break-all">
                      info@penzionkastelan.sk
                    </a>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" data-testid="contact-form">
                <div>
                  <Label htmlFor="name" className="text-[#065F46] mb-2 block text-sm md:text-base">{t.contact.name}</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input border-[#065F46]/20 focus:border-[#3B82F6]"
                    data-testid="contact-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-[#065F46] mb-2 block text-sm md:text-base">{t.contact.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input border-[#065F46]/20 focus:border-[#3B82F6]"
                    data-testid="contact-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-[#065F46] mb-2 block text-sm md:text-base">{t.contact.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input border-[#065F46]/20 focus:border-[#3B82F6]"
                    data-testid="contact-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-[#065F46] mb-2 block text-sm md:text-base">{t.contact.message}</Label>
                  <Textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input border-[#065F46]/20 focus:border-[#3B82F6] resize-none"
                    data-testid="contact-message-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white btn-hover py-5 md:py-6"
                  data-testid="contact-submit-btn"
                >
                  {sending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {t.contact.sending}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t.contact.send}
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-4 md:mt-6 text-xs md:text-sm text-[#334155] text-center">
                {t.contact.smoking}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#081C15] py-8 md:py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo-penzion.jpg" 
                alt="Penzión Kastelán" 
                className="w-12 h-12 rounded-lg object-cover shadow-md"
              />
              <div>
                <span className="font-heading text-lg md:text-xl text-white">Penzión Kastelán</span>
                <p className="text-white/60 text-sm">{t.footer.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <a 
                href="https://www.facebook.com/penzionkastelan/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#166FE5] transition-colors"
                data-testid="footer-facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a 
                href="tel:+421905327279" 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#20BD5A] transition-colors"
                data-testid="footer-phone"
              >
                <Phone className="w-5 h-5 text-white" />
              </a>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-white/60 text-xs md:text-sm text-center">
                © {new Date().getFullYear()} Penzión Kastelán. {t.footer.rights}.
              </p>
              <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                <DialogTrigger asChild>
                  <button className="text-white/30 hover:text-white/60 transition-colors" data-testid="admin-panel-btn">
                    <Shield className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-[#065F46] font-heading text-2xl flex items-center gap-2">
                      <Shield className="w-6 h-6 text-[#3B82F6]" />
                      {t.admin.title}
                    </DialogTitle>
                  </DialogHeader>

                  {!adminToken ? (
                    <form onSubmit={handleAdminLogin} className="space-y-4 py-4" data-testid="admin-login-form">
                      <div>
                        <Label className="text-[#065F46] mb-2 block">{t.admin.email}</Label>
                        <Input
                          type="email"
                          required
                          value={adminLogin.email}
                          onChange={(e) => setAdminLogin({...adminLogin, email: e.target.value})}
                          className="border-[#065F46]/20"
                          data-testid="admin-email-input"
                        />
                      </div>
                      <div>
                        <Label className="text-[#065F46] mb-2 block">{t.admin.password}</Label>
                        <Input
                          type="password"
                          required
                          value={adminLogin.password}
                          onChange={(e) => setAdminLogin({...adminLogin, password: e.target.value})}
                          className="border-[#065F46]/20"
                          data-testid="admin-password-input"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-5" data-testid="admin-login-btn">
                        <Shield className="w-4 h-4 mr-2" />
                        {t.admin.loginBtn}
                      </Button>
                    </form>
                  ) : (
                    <div className="py-4">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-2">
                          {["reservations", "reviews", "contacts"].map((tab) => (
                            <Button
                              key={tab}
                              variant={adminTab === tab ? "default" : "outline"}
                              size="sm"
                              onClick={() => setAdminTab(tab)}
                              className={adminTab === tab ? "bg-[#3B82F6] text-white" : "border-[#065F46]/20"}
                              data-testid={`admin-tab-${tab}`}
                            >
                              {tab === "reservations" && <ClipboardList className="w-4 h-4 mr-1" />}
                              {tab === "reviews" && <MessageSquare className="w-4 h-4 mr-1" />}
                              {tab === "contacts" && <Mail className="w-4 h-4 mr-1" />}
                              {t.admin[tab]}
                            </Button>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { setAdminToken(null); setAdminLogin({email:"",password:""}); }} data-testid="admin-logout-btn">
                          <LogOut className="w-4 h-4 mr-1" />
                          {t.admin.logout}
                        </Button>
                      </div>

                      {/* Reservations Tab */}
                      {adminTab === "reservations" && (
                        <div className="space-y-3" data-testid="admin-reservations-list">
                          {adminData.reservations.length === 0 ? (
                            <p className="text-[#334155] text-center py-8">{t.admin.noData}</p>
                          ) : adminData.reservations.map((r) => (
                            <div key={r.id} className="border border-[#065F46]/10 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between" data-testid={`admin-reservation-${r.id}`}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-medium text-[#065F46]">{r.guest_name}</span>
                                  <Badge variant={r.status === "confirmed" ? "default" : r.status === "cancelled" ? "destructive" : "secondary"} className={r.status === "confirmed" ? "bg-green-100 text-green-800" : r.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                                    {t.admin[r.status]}
                                  </Badge>
                                </div>
                                <p className="text-sm text-[#334155]">
                                  {t.reservation.room} {r.room_id} | {r.check_in} - {r.check_out} | {r.guests} {t.reservation.guests.toLowerCase()} | {r.guest_phone}
                                </p>
                                {r.note && <p className="text-xs text-[#334155] mt-1">{r.note}</p>}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button size="sm" variant="outline" className="h-8 border-green-300 text-green-700 hover:bg-green-50" onClick={() => updateReservationStatus(r.id, "confirmed")} data-testid={`confirm-res-${r.id}`}>
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-red-300 text-red-700 hover:bg-red-50" onClick={() => updateReservationStatus(r.id, "cancelled")} data-testid={`cancel-res-${r.id}`}>
                                  <XCircle className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-gray-300 text-gray-500 hover:bg-gray-50" onClick={() => deleteAdminItem("reservations", r.id)} data-testid={`delete-res-${r.id}`}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reviews Tab */}
                      {adminTab === "reviews" && (
                        <div className="space-y-3" data-testid="admin-reviews-list">
                          {adminData.reviews.length === 0 ? (
                            <p className="text-[#334155] text-center py-8">{t.admin.noData}</p>
                          ) : adminData.reviews.map((r) => (
                            <div key={r.id} className="border border-[#065F46]/10 rounded-xl p-4" data-testid={`admin-review-${r.id}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-[#065F46]">{r.author_name}</span>
                                  <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map((s) => (
                                      <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-[#34D399] fill-[#34D399]" : "text-gray-200"}`} />
                                    ))}
                                  </div>
                                  <Badge variant={r.approved ? "default" : "secondary"} className={r.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                    {r.approved ? t.admin.approved : t.admin.notApproved}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" className="h-8 border-green-300 text-green-700 hover:bg-green-50" onClick={() => toggleReviewApproval(r.id, !r.approved)}>
                                    {r.approved ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-8 border-red-300 text-red-700 hover:bg-red-50" onClick={() => deleteAdminItem("reviews", r.id)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-[#334155]">{r.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Contacts Tab */}
                      {adminTab === "contacts" && (
                        <div className="space-y-3" data-testid="admin-contacts-list">
                          {adminData.contacts.length === 0 ? (
                            <p className="text-[#334155] text-center py-8">{t.admin.noData}</p>
                          ) : adminData.contacts.map((c) => (
                            <div key={c.id} className="border border-[#065F46]/10 rounded-xl p-4" data-testid={`admin-contact-${c.id}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-[#065F46]">{c.name}</span>
                                <span className="text-xs text-[#334155]">{c.email}</span>
                                {c.phone && <span className="text-xs text-[#334155]">| {c.phone}</span>}
                              </div>
                              <p className="text-sm text-[#334155]">{c.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
