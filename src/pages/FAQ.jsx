import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LanguageProvider, useLang } from '@/components/LanguageContext';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';

const faqData = {
  fr: {
    title: 'Questions Fréquentes',
    subtitle: 'Tout ce que vous devez savoir sur nos services',
    sections: [
      {
        title: 'Le Service',
        items: [
          { q: 'Quelles zones desservez-vous ?', a: 'Nous desservons toute la Suisse ainsi que les grandes villes européennes. Nos services couvrent tous les aéroports suisses (Genève, Zurich, Bâle) et les principales destinations en Europe.' },
          { q: 'Êtes-vous disponibles 24h/24 ?', a: 'Oui, nous sommes disponibles 24 heures sur 24, 7 jours sur 7, y compris les jours fériés. Vous pouvez réserver à tout moment.' },
          { q: 'Quels types de véhicules proposez-vous ?', a: 'Nous proposons deux catégories : STANDARD (berline confortable, jusqu\'à 3 passagers, 2 bagages) et COMFORT (véhicule plus spacieux, jusqu\'à 4 passagers, 3 bagages). Les deux incluent climatisation et Wi-Fi gratuit.' },
          { q: 'Les chauffeurs sont-ils professionnels ?', a: 'Tous nos chauffeurs sont professionnels, titulaires d\'une licence de transport et régulièrement formés. Ils connaissent parfaitement les routes suisses et européennes.' },
        ],
      },
      {
        title: 'La Réservation',
        items: [
          { q: 'Comment puis-je faire une réservation ?', a: 'Vous pouvez réserver directement sur notre site en quelques étapes : indiquez votre trajet, choisissez votre véhicule, renseignez vos coordonnées et procédez au paiement. La réservation est confirmée immédiatement.' },
          { q: 'Combien de temps à l\'avance dois-je réserver ?', a: 'Nous recommandons de réserver au moins 2 heures à l\'avance. Pour les réservations faites moins de 90 minutes avant le départ, notre équipe vous contactera par téléphone pour confirmer la disponibilité.' },
          { q: 'Puis-je spécifier un numéro de vol ?', a: 'Oui, lors de la réservation vous pouvez indiquer votre numéro de vol. Nous suivons les vols en temps réel pour adapter l\'heure de prise en charge en cas de retard.' },
          { q: 'Puis-je choisir un chauffeur préféré ?', a: 'Oui, si vous avez déjà voyagé avec nous, vous pouvez sélectionner un chauffeur préféré lors de votre réservation, sous réserve de disponibilité.' },
        ],
      },
      {
        title: 'Annulations',
        items: [
          { q: 'Puis-je annuler ma réservation ?', a: 'Oui, vous pouvez annuler votre réservation en utilisant le lien d\'annulation fourni dans votre e-mail de confirmation. L\'annulation met à jour le statut de votre réservation.' },
          { q: 'Y a-t-il des frais d\'annulation ?', a: 'Les annulations effectuées au moins 24 heures avant le départ sont remboursées à 100 %. Les annulations effectuées moins de 24 heures avant le départ ne donnent droit à aucun remboursement.' },
          { q: 'Comment annuler ma réservation ?', a: 'Le lien d\'annulation se trouve dans votre e-mail de confirmation. Cliquez dessus, confirmez l\'annulation sur la page dédiée, et nous serons notifiés immédiatement.' },
        ],
      },
      {
        title: 'Paiement',
        items: [
          { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Nous acceptons les paiements par carte bancaire via Stripe (Visa, Mastercard, etc.), TWINT, et en espèces à bord. Le paiement en ligne est sécurisé et chiffré SSL.' },
          { q: 'Quand suis-je débité ?', a: 'Pour les paiements par carte via Stripe, vous êtes débité immédiatement lors de la confirmation de réservation. Pour TWINT et espèces, le paiement s\'effectue à bord du véhicule.' },
          { q: 'Les péages sont-ils inclus dans le prix ?', a: 'Non, les péages ne sont pas inclus dans le prix affiché. Ils seront facturés séparément si votre trajet en inclut.' },
          { q: 'Le prix est-il fixe ou peut-il varier ?', a: 'Le prix calculé lors de la réservation est indicatif et basé sur la distance estimée. Des suppléments peuvent s\'appliquer (nuit, aéroport, Valais/Fribourg). Les péages sont en sus.' },
        ],
      },
    ],
    contact: 'Une autre question ?',
    contactLink: 'Contactez-nous par e-mail',
  },
  en: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about our services',
    sections: [
      {
        title: 'The Service',
        items: [
          { q: 'What areas do you cover?', a: 'We cover all of Switzerland and major European cities. Our services include all Swiss airports (Geneva, Zurich, Basel) and main European destinations.' },
          { q: 'Are you available 24/7?', a: 'Yes, we are available 24 hours a day, 7 days a week, including public holidays. You can book at any time.' },
          { q: 'What types of vehicles do you offer?', a: 'We offer two categories: STANDARD (comfortable sedan, up to 3 passengers, 2 bags) and COMFORT (more spacious vehicle, up to 4 passengers, 3 bags). Both include air conditioning and free Wi-Fi.' },
          { q: 'Are your drivers professional?', a: 'All our drivers are professional, licensed transport operators and regularly trained. They are thoroughly familiar with Swiss and European routes.' },
        ],
      },
      {
        title: 'Booking',
        items: [
          { q: 'How can I make a booking?', a: 'You can book directly on our site in a few steps: enter your journey, choose your vehicle, fill in your details and proceed to payment. Booking is confirmed immediately.' },
          { q: 'How far in advance should I book?', a: 'We recommend booking at least 2 hours in advance. For bookings made less than 90 minutes before departure, our team will contact you by phone to confirm availability.' },
          { q: 'Can I provide a flight number?', a: 'Yes, during booking you can enter your flight number. We track flights in real time to adjust the pickup time in case of delay.' },
          { q: 'Can I choose a preferred driver?', a: 'Yes, if you have travelled with us before, you can select a preferred driver when booking, subject to availability.' },
        ],
      },
      {
        title: 'Cancellations',
        items: [
          { q: 'Can I cancel my booking?', a: 'Yes, you can cancel your booking using the cancellation link provided in your confirmation email. Cancellation updates your booking status.' },
          { q: 'Are there cancellation fees?', a: 'Cancellations made at least 24 hours before departure are fully refunded (100%). Cancellations made less than 24 hours before departure are not eligible for a refund.' },
          { q: 'How do I cancel my booking?', a: 'The cancellation link is in your confirmation email. Click it, confirm the cancellation on the dedicated page, and we will be notified immediately.' },
        ],
      },
      {
        title: 'Payment',
        items: [
          { q: 'What payment methods do you accept?', a: 'We accept card payments via Stripe (Visa, Mastercard, etc.), TWINT, and cash on board. Online payment is secure and SSL encrypted.' },
          { q: 'When am I charged?', a: 'For card payments via Stripe, you are charged immediately upon booking confirmation. For TWINT and cash, payment is made on board the vehicle.' },
          { q: 'Are tolls included in the price?', a: 'No, tolls are not included in the displayed price. They will be charged separately if your journey includes them.' },
          { q: 'Is the price fixed or can it vary?', a: 'The price calculated at booking is indicative and based on the estimated distance. Surcharges may apply (night, airport, Valais/Fribourg). Tolls are additional.' },
        ],
      },
    ],
    contact: 'Another question?',
    contactLink: 'Contact us by email',
  },
  pt: {
    title: 'Perguntas Frequentes',
    subtitle: 'Tudo o que precisa saber sobre os nossos serviços',
    sections: [
      {
        title: 'O Serviço',
        items: [
          { q: 'Quais regiões vocês cobrem?', a: 'Cobrimos toda a Suíça e as principais cidades europeias. Os nossos serviços incluem todos os aeroportos suíços (Genebra, Zurique, Basileia) e os principais destinos europeus.' },
          { q: 'Estão disponíveis 24h/24?', a: 'Sim, estamos disponíveis 24 horas por dia, 7 dias por semana, incluindo feriados. Pode reservar a qualquer momento.' },
          { q: 'Que tipos de veículos oferecem?', a: 'Oferecemos duas categorias: STANDARD (sedan confortável, até 3 passageiros, 2 bagagens) e COMFORT (veículo mais espaçoso, até 4 passageiros, 3 bagagens). Ambos incluem ar-condicionado e Wi-Fi gratuito.' },
          { q: 'Os motoristas são profissionais?', a: 'Todos os nossos motoristas são profissionais, licenciados e regularmente formados. Conhecem perfeitamente as rotas suíças e europeias.' },
        ],
      },
      {
        title: 'A Reserva',
        items: [
          { q: 'Como posso fazer uma reserva?', a: 'Pode reservar diretamente no nosso site em alguns passos: indique o seu percurso, escolha o veículo, preencha os seus dados e proceda ao pagamento. A reserva é confirmada imediatamente.' },
          { q: 'Com quanto tempo de antecedência devo reservar?', a: 'Recomendamos reservar com pelo menos 2 horas de antecedência. Para reservas feitas com menos de 90 minutos antes da partida, a nossa equipa irá contactá-lo por telefone para confirmar a disponibilidade.' },
          { q: 'Posso indicar um número de voo?', a: 'Sim, durante a reserva pode indicar o número do seu voo. Acompanhamos os voos em tempo real para ajustar o horário de recolha em caso de atraso.' },
          { q: 'Posso escolher um motorista preferido?', a: 'Sim, se já viajou connosco, pode selecionar um motorista preferido ao reservar, sujeito à disponibilidade.' },
        ],
      },
      {
        title: 'Cancelamentos',
        items: [
          { q: 'Posso cancelar a minha reserva?', a: 'Sim, pode cancelar a sua reserva utilizando o link de cancelamento fornecido no e-mail de confirmação. O cancelamento atualiza o estado da sua reserva.' },
          { q: 'Existem taxas de cancelamento?', a: 'Cancelamentos feitos com pelo menos 24 horas de antecedência são reembolsados a 100%. Cancelamentos feitos com menos de 24 horas de antecedência não têm direito a reembolso.' },
          { q: 'Como cancelar a minha reserva?', a: 'O link de cancelamento está no seu e-mail de confirmação. Clique nele, confirme o cancelamento na página dedicada e seremos notificados imediatamente.' },
        ],
      },
      {
        title: 'Pagamento',
        items: [
          { q: 'Que meios de pagamento aceitam?', a: 'Aceitamos pagamentos por cartão via Stripe (Visa, Mastercard, etc.), TWINT e dinheiro a bordo. O pagamento online é seguro e encriptado SSL.' },
          { q: 'Quando serei cobrado?', a: 'Para pagamentos por cartão via Stripe, é cobrado imediatamente após a confirmação da reserva. Para TWINT e dinheiro, o pagamento é feito a bordo do veículo.' },
          { q: 'As portagens estão incluídas no preço?', a: 'Não, as portagens não estão incluídas no preço apresentado. Serão cobradas separadamente se o seu percurso as incluir.' },
          { q: 'O preço é fixo ou pode variar?', a: 'O preço calculado na reserva é indicativo e baseado na distância estimada. Podem aplicar-se suplementos (noturno, aeroporto, Valais/Friburgo). As portagens são adicionais.' },
        ],
      },
    ],
    contact: 'Outra pergunta?',
    contactLink: 'Contacte-nos por e-mail',
  },
  de: {
    title: 'Häufig gestellte Fragen',
    subtitle: 'Alles, was Sie über unsere Dienste wissen müssen',
    sections: [
      {
        title: 'Der Service',
        items: [
          { q: 'Welche Gebiete decken Sie ab?', a: 'Wir decken die gesamte Schweiz sowie wichtige europäische Städte ab. Unsere Dienste umfassen alle Schweizer Flughäfen (Genf, Zürich, Basel) und die wichtigsten europäischen Destinationen.' },
          { q: 'Sind Sie 24/7 verfügbar?', a: 'Ja, wir sind 24 Stunden am Tag, 7 Tage die Woche, einschließlich Feiertagen, verfügbar. Sie können jederzeit buchen.' },
          { q: 'Welche Fahrzeugtypen bieten Sie an?', a: 'Wir bieten zwei Kategorien an: STANDARD (komfortable Limousine, bis 3 Passagiere, 2 Gepäckstücke) und COMFORT (geräumigeres Fahrzeug, bis 4 Passagiere, 3 Gepäckstücke). Beide umfassen Klimaanlage und kostenloses WLAN.' },
          { q: 'Sind Ihre Fahrer professionell?', a: 'Alle unsere Fahrer sind professionell, lizenziert und regelmäßig geschult. Sie kennen die Schweizer und europäischen Routen bestens.' },
        ],
      },
      {
        title: 'Buchung',
        items: [
          { q: 'Wie kann ich buchen?', a: 'Sie können direkt auf unserer Website in wenigen Schritten buchen: Strecke angeben, Fahrzeug wählen, Ihre Daten eingeben und bezahlen. Die Buchung wird sofort bestätigt.' },
          { q: 'Wie weit im Voraus sollte ich buchen?', a: 'Wir empfehlen, mindestens 2 Stunden im Voraus zu buchen. Bei Buchungen weniger als 90 Minuten vor Abfahrt kontaktiert Sie unser Team telefonisch zur Bestätigung der Verfügbarkeit.' },
          { q: 'Kann ich eine Flugnummer angeben?', a: 'Ja, bei der Buchung können Sie Ihre Flugnummer eingeben. Wir verfolgen Flüge in Echtzeit, um die Abholzeit bei Verspätungen anzupassen.' },
          { q: 'Kann ich einen bevorzugten Fahrer wählen?', a: 'Ja, wenn Sie bereits mit uns gefahren sind, können Sie bei der Buchung einen bevorzugten Fahrer auswählen, vorbehaltlich der Verfügbarkeit.' },
        ],
      },
      {
        title: 'Stornierungen',
        items: [
          { q: 'Kann ich meine Buchung stornieren?', a: 'Ja, Sie können Ihre Buchung über den Stornierungslink in Ihrer Bestätigungs-E-Mail stornieren. Die Stornierung aktualisiert den Status Ihrer Buchung.' },
          { q: 'Gibt es Stornogebühren?', a: 'Stornierungen, die mindestens 24 Stunden vor Abfahrt vorgenommen werden, werden zu 100 % erstattet. Stornierungen weniger als 24 Stunden vor Abfahrt werden nicht erstattet.' },
          { q: 'Wie storniere ich meine Buchung?', a: 'Der Stornierungslink befindet sich in Ihrer Bestätigungs-E-Mail. Klicken Sie darauf, bestätigen Sie die Stornierung auf der dedizierten Seite, und wir werden sofort benachrichtigt.' },
        ],
      },
      {
        title: 'Zahlung',
        items: [
          { q: 'Welche Zahlungsmethoden akzeptieren Sie?', a: 'Wir akzeptieren Kartenzahlungen über Stripe (Visa, Mastercard usw.), TWINT und Bargeld an Bord. Online-Zahlungen sind sicher und SSL-verschlüsselt.' },
          { q: 'Wann werde ich belastet?', a: 'Bei Kartenzahlungen über Stripe werden Sie sofort nach der Buchungsbestätigung belastet. Bei TWINT und Bargeld erfolgt die Zahlung an Bord des Fahrzeugs.' },
          { q: 'Sind Mautgebühren im Preis enthalten?', a: 'Nein, Mautgebühren sind nicht im angezeigten Preis enthalten. Sie werden separat berechnet, wenn Ihre Strecke sie beinhaltet.' },
          { q: 'Ist der Preis fest oder kann er variieren?', a: 'Der bei der Buchung berechnete Preis ist indikativ und basiert auf der geschätzten Entfernung. Zuschläge können anfallen (Nacht, Flughafen, Wallis/Freiburg). Mautgebühren sind zusätzlich.' },
        ],
      },
    ],
    contact: 'Noch eine Frage?',
    contactLink: 'Kontaktieren Sie uns per E-Mail',
  },
  it: {
    title: 'Domande Frequenti',
    subtitle: 'Tutto quello che dovete sapere sui nostri servizi',
    sections: [
      {
        title: 'Il Servizio',
        items: [
          { q: 'Quali zone coprite?', a: 'Copriamo tutta la Svizzera e le principali città europee. I nostri servizi includono tutti gli aeroporti svizzeri (Ginevra, Zurigo, Basilea) e le principali destinazioni europee.' },
          { q: 'Siete disponibili 24/7?', a: 'Sì, siamo disponibili 24 ore su 24, 7 giorni su 7, inclusi i giorni festivi. Potete prenotare in qualsiasi momento.' },
          { q: 'Che tipi di veicoli offrite?', a: 'Offriamo due categorie: STANDARD (berlina confortevole, fino a 3 passeggeri, 2 bagagli) e COMFORT (veicolo più spazioso, fino a 4 passeggeri, 3 bagagli). Entrambi includono aria condizionata e Wi-Fi gratuito.' },
          { q: 'Gli autisti sono professionisti?', a: 'Tutti i nostri autisti sono professionisti, autorizzati e regolarmente formati. Conoscono perfettamente le strade svizzere ed europee.' },
        ],
      },
      {
        title: 'Prenotazione',
        items: [
          { q: 'Come posso prenotare?', a: 'Potete prenotare direttamente sul nostro sito in pochi passaggi: indicate il vostro percorso, scegliete il veicolo, inserite i vostri dati e procedete al pagamento. La prenotazione è confermata immediatamente.' },
          { q: 'Con quanto anticipo devo prenotare?', a: 'Consigliamo di prenotare almeno 2 ore in anticipo. Per prenotazioni effettuate meno di 90 minuti prima della partenza, il nostro team vi contatterà telefonicamente per confermare la disponibilità.' },
          { q: 'Posso indicare un numero di volo?', a: 'Sì, durante la prenotazione potete indicare il vostro numero di volo. Monitoriamo i voli in tempo reale per adattare l\'orario di ritiro in caso di ritardo.' },
          { q: 'Posso scegliere un autista preferito?', a: 'Sì, se avete già viaggiato con noi, potete selezionare un autista preferito al momento della prenotazione, previa disponibilità.' },
        ],
      },
      {
        title: 'Cancellazioni',
        items: [
          { q: 'Posso cancellare la mia prenotazione?', a: 'Sì, potete cancellare la vostra prenotazione utilizzando il link di cancellazione fornito nell\'email di conferma. La cancellazione aggiorna lo stato della vostra prenotazione.' },
          { q: 'Ci sono commissioni di cancellazione?', a: 'Le cancellazioni effettuate almeno 24 ore prima della partenza sono rimborsate al 100%. Le cancellazioni effettuate meno di 24 ore prima della partenza non danno diritto a rimborso.' },
          { q: 'Come cancello la mia prenotazione?', a: 'Il link di cancellazione si trova nell\'email di conferma. Cliccateci sopra, confermate la cancellazione sulla pagina dedicata e saremo notificati immediatamente.' },
        ],
      },
      {
        title: 'Pagamento',
        items: [
          { q: 'Quali metodi di pagamento accettate?', a: 'Accettiamo pagamenti con carta tramite Stripe (Visa, Mastercard, ecc.), TWINT e contanti a bordo. Il pagamento online è sicuro e cifrato SSL.' },
          { q: 'Quando vengo addebitato?', a: 'Per i pagamenti con carta tramite Stripe, venite addebitati immediatamente alla conferma della prenotazione. Per TWINT e contanti, il pagamento avviene a bordo del veicolo.' },
          { q: 'I pedaggi sono inclusi nel prezzo?', a: 'No, i pedaggi non sono inclusi nel prezzo visualizzato. Verranno fatturati separatamente se il vostro percorso li prevede.' },
          { q: 'Il prezzo è fisso o può variare?', a: 'Il prezzo calcolato alla prenotazione è indicativo e basato sulla distanza stimata. Possono applicarsi supplementi (notte, aeroporto, Vallese/Friburgo). I pedaggi sono aggiuntivi.' },
        ],
      },
    ],
    contact: 'Un\'altra domanda?',
    contactLink: 'Contattateci per e-mail',
  },
};

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border border-black/10 rounded-xl overflow-hidden transition-all ${open ? 'bg-black text-white' : 'bg-white/80 hover:bg-white'}`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left gap-3"
      >
        <span className={`font-medium text-sm ${open ? 'text-white' : 'text-black'}`}>{question}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#F5C300] shrink-0" />
          : <ChevronDown className="w-4 h-4 text-black/40 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-white/70 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

function FAQContent() {
  const { lang } = useLang();
  const data = faqData[lang] || faqData['fr'];

  return (
    <div className="min-h-screen bg-[#F5C300]">
      {/* Header */}
      <div className="w-full max-w-2xl mx-auto pt-12 pb-8 px-4 text-center">
        <h1 className="text-black text-6xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
        <p className="text-black/60 text-sm tracking-[0.2em] uppercase mt-2">TRANSPORTS DE PERSONNES</p>
        <div className="w-8 h-[1px] bg-black/40 mx-auto mt-3 mb-6" />
        <div className="flex justify-center mb-4">
          <LanguageSwitcher />
        </div>
        <h2 className="text-black text-2xl font-bold mt-4">{data.title}</h2>
        <p className="text-black/60 text-sm mt-1">{data.subtitle}</p>
      </div>

      {/* Sections */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-12 space-y-6">
        {data.sections.map((section, si) => (
          <div key={si}>
            <h3 className="text-black font-semibold text-xs uppercase tracking-widest mb-3 pl-1">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map((item, ii) => (
                <FAQItem key={ii} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-black rounded-xl p-6 text-center">
          <p className="text-white/60 text-sm mb-2">{data.contact}</p>
          <a
            href="mailto:info@rosini.online"
            className="text-[#F5C300] font-semibold text-sm hover:underline"
          >
            {data.contactLink}
          </a>
          <div className="mt-3">
            <a
              href="tel:+41772492245"
              className="text-white/50 text-xs hover:text-white transition-colors"
            >
              +41 77 249 22 45
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <a href="/" className="text-black/50 text-xs hover:text-black transition-colors underline">
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <LanguageProvider>
      <FAQContent />
    </LanguageProvider>
  );
}