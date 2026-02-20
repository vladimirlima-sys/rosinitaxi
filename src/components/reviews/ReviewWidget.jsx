import React from 'react';

export default function ReviewWidget() {
  return (
    <div className="w-full">
      {/* Google Reviews Widget - adicione seu ID do Google Business */}
      <div className="g-reviewsWidget" data-businessid="YOUR_GOOGLE_BUSINESS_ID">
        <div className="text-white/40 text-sm p-4">
          Para exibir avaliações do Google, configure seu Google Business ID no componente ReviewWidget.
        </div>
      </div>
      <script async src="https://cdn.trustindex.io/loader.js?v=ns"></script>
    </div>
  );
}