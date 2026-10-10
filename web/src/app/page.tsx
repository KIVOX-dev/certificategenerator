import { HomeEntry } from '@/components/HomeEntry';
import { t } from '@/lib/i18n';

export default function Home() {
  return (
    <>
      <h1>{t('homeTitle')}</h1>
      <p className="lead">{t('homeText')}</p>
      <HomeEntry />
    </>
  );
}
