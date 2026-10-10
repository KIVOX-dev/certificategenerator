import type { MetadataRoute } from 'next';
import { t } from '@/lib/i18n';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: t('getCertificate'),
    short_name: t('homeTitle'),
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
