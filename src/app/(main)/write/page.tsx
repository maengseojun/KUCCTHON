import { WriteCalendar } from '@/components/write/write-calendar';
import { getEvents } from '@/lib/queries/events';
import { getTargets } from '@/lib/queries/targets';
import { getThankYouList } from '@/lib/queries/thank-yous';

export default async function WritePage() {
  const [targets, events, thankYous] = await Promise.all([
    getTargets(),
    getEvents(),
    getThankYouList(),
  ]);

  return <WriteCalendar events={events} targets={targets} thankYous={thankYous} />;
}
