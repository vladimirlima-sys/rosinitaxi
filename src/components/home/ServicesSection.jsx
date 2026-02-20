import React from 'react';
import { Plane, MapPin } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function ServicesSection() {
  const { lang } = useLang();
  const t = translations[lang];

  const services = [
  { icon: Plane, title: t.service1Title, description: t.service1Desc },
  { icon: MapPin, title: t.service3Title, description: t.service3Desc }];


  return null;

























}