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

    // Structured data (JSON-LD)
    const existingLd = document.querySelector('script[type="application/ld+json"]');
    if (existingLd) existingLd.remove();
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
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
      ]
    });
    document.head.appendChild(ld);
  }, [lang]);

  return null;
}