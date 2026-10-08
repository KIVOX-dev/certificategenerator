import { RegisterFlow } from '@/components/RegisterFlow';

export default async function RegisterPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;
  return <RegisterFlow eventCode={eventCode} />;
}
