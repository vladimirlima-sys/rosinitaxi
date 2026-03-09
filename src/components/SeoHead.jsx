import { useEffect } from 'react';

const seoConfig = {
  fr: {
    title: 'Rosini Transports et locations Sarl — Transfer Privé Genève, Suisse & Europe',
    description: 'Votre partenaire pour les transferts longue distance et les trajets locaux dans la Riviera.',
    keywords: 'transfer privé Genève, location voiture avec chauffeur, transport luxe Suisse, transfert aéroport Genève, chauffeur privé Lausanne, taxi longue distance Suisse, transfer Europe, Rosini Transports, VTC Genève, transport professionnel Suisse',
  },
  en: {
    title: 'Rosini Transports et locations Sarl — Private Transfer Geneva, Switzerland & Europe',
    description: 'Premium private transfer and chauffeur service in Geneva, Lausanne and across Switzerland. Airport transfers, luxury long-distance transport in Europe. Available 24/7.',
    keywords: 'private transfer Geneva, chauffeur service Switzerland, luxury transport Geneva, airport transfer Geneva, private driver Lausanne, long distance taxi Switzerland, Europe transfer, Rosini Transports',
  },
  de: {
    title: 'Rosini Transports et locations Sarl — Privater Transfer Genf, Schweiz & Europa',
    description: 'Premium Privattransfer und Fahrdienst mit Chauffeur in Genf, Lausanne und der ganzen Schweiz. Flughafentransfer, Langstreckenfahrten in Europa. Verfügbar 24/7.',
    keywords: 'privater Transfer Genf, Chauffeurservice Schweiz, Luxustransport Genf, Flughafentransfer Genf, Privatfahrer Lausanne, Langstreckentaxi Schweiz, Rosini Transports',
  },
  it: {
    title: 'Rosini Transports et locations Sarl — Transfer Privato Ginevra, Svizzera & Europa',
    description: 'Servizio di transfer privato e auto con autista a Ginevra, Losanna e tutta la Svizzera. Transfer aeroporto, trasporto di lusso a lunga distanza in Europa. Disponibile 24/7.',
    keywords: 'transfer privato Ginevra, auto con autista Svizzera, trasporto lusso Ginevra, transfer aeroporto Ginevra, autista privato Losanna, Rosini Transports',
  },
  pt: {
    title: 'Rosini Transports et locations Sarl — Transfer Privado Genebra, Suíça & Europa',
    description: 'Serviço de transfer privado e aluguer de carro com motorista em Genebra, Lausanne e toda a Suíça. Transfer aeroporto, transporte de luxo de longa distância na Europa. Disponível 24h/7.',
    keywords: 'transfer privado Genebra, aluguer carro com motorista, transporte luxo Suíça, transfer aeroporto Genebra, motorista privado Lausanne, Rosini Transports',
  },
};

function setMeta(name, content, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function SeoHead({ lang = 'fr' }) {
  useEffect(() => {
    const config = seoConfig[lang] || seoConfig.fr;

    // Title
    document.title = config.title;

    // Basic meta
    setMeta('description', config.description);
    setMeta('keywords', config.keywords);
    setMeta('author', 'Rosini Transports et locations Sarl');
    setMeta('robots', 'index, follow');
    setMeta('geo.region', 'CH-VD');
    setMeta('geo.placename', 'La Tour-de-Peilz, Vaud, Suisse');

    // Open Graph
    setMeta('og:title', config.title, true);
    setMeta('og:description', config.description, true);
    setMeta('og:type', 'website', true);
    setMeta('og:image', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1200&q=80', true);
    setMeta('og:locale', lang === 'fr' ? 'fr_CH' : lang === 'de' ? 'de_CH' : lang === 'it' ? 'it_CH' : lang === 'pt' ? 'pt_PT' : 'en_CH', true);
    setMeta('og:site_name', 'Rosini Transports et locations Sarl', true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', config.title);
    setMeta('twitter:description', config.description);
    setMeta('twitter:image', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1200&q=80');

    // HTML lang attribute
    document.documentElement.lang = lang;

    // Structured data (JSON-LD) - TaxiService + LocalBusiness
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
    
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "TaxiService",
      "@id": "https://rosini.online",
      "name": "Rosini Transports et locations Sarl",
      "description": config.description,
      "url": "https://rosini.online",
      "telephone": "+41796505347",
      "email": "taxirosini@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Chemin des Bulesses 16",
        "addressLocality": "La Tour-de-Peilz",
        "postalCode": "1814",
        "addressCountry": "CH"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 46.4495,
        "longitude": 6.8422
      },
      "openingHours": "Mo-Su 00:00-24:00",
      "priceRange": "$$",
      "areaServed": ["Genève", "Lausanne", "Zürich", "Berne", "Suisse", "Europe"],
      "serviceType": [
        "Transfer aéroport",
        "Location voiture avec chauffeur",
        "Transport longue distance",
        "VTC",
        "Transport de luxe"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Services de Transport",
        "itemListElement": [
          {
            "@type": "Service",
            "name": "Transfer Aéroport",
            "description": "Transfer privé depuis/vers les aéroports de Genève, Zurich et Bâle"
          },
          {
            "@type": "Service",
            "name": "Transport Longue Distance",
            "description": "Trajets longue distance en Suisse et Europe"
          },
          {
            "@type": "Service",
            "name": "Location avec Chauffeur",
            "description": "Location de véhicules haut de gamme avec chauffeur privé"
          }
        ]
      },
      "logo": {
        "@type": "ImageObject",
        "url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997aac0bfa41b14d425e0d3/a27c92213_IMG_1147.jpeg",
        "width": 512,
        "height": 512
      },
      "image": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997aac0bfa41b14d425e0d3/a27c92213_IMG_1147.jpeg",
      "sameAs": [
        "https://www.facebook.com/rosinitransports",
        "https://www.instagram.com/rosinitransports"
      ]
    };

    // Organization schema specifically for Google logo display
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Rosini Transports et locations Sarl",
      "url": "https://rosini.online",
      "logo": {
        "@type": "ImageObject",
        "url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997aac0bfa41b14d425e0d3/a27c92213_IMG_1147.jpeg",
        "width": 512,
        "height": 512
      }
    };

    const ld1 = document.createElement('script');
    ld1.type = 'application/ld+json';
    ld1.text = JSON.stringify(organizationSchema);
    document.head.appendChild(ld1);

    const ld0 = document.createElement('script');
    ld0.type = 'application/ld+json';
    ld0.text = JSON.stringify(orgSchema);
    document.head.appendChild(ld0);

    // FAQ Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Comment réserver un transfer avec Rosini Transports ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Utilisez notre formulaire de réservation en ligne. Indiquez votre point de départ, destination et date. Nous calculons le prix en temps réel et vous permet de payer par carte ou en espèces."
          }
        },
        {
          "@type": "Question",
          "name": "Quels sont vos tarifs ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nos tarifs sont calculés en fonction de la distance. Consultez notre formulaire de réservation pour un devis personnalisé. Disponible 24h/24, 7j/7."
          }
        },
        {
          "@type": "Question",
          "name": "Couvrez-vous les trajets en Europe ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, nous proposons des transfers longue distance en Suisse et à travers l'Europe avec chauffeur professionnel."
          }
        }
      ]
    };

    const ld2 = document.createElement('script');
    ld2.type = 'application/ld+json';
    ld2.text = JSON.stringify(faqSchema);
    document.head.appendChild(ld2);
  }, [lang]);

  return null;
}