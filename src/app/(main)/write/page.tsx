import { WriteCalendar } from '@/app/(main)/write/write-calendar';
import { getThankYouList } from '@/lib/queries/thank-yous';

export default async function WritePage() {
  const entries = await getThankYouList();

  return <WriteCalendar entries={entries} />;
}
