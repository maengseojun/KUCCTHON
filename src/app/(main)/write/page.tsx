import { WriteCalendar } from '@/components/write/write-calendar';
import { isValidDateKey } from '@/lib/dates/date-key';
import { getEvents } from '@/lib/queries/events';
import { getTargets } from '@/lib/queries/targets';
import { getThankYouList } from '@/lib/queries/thank-yous';

type WritePageProps = {
  searchParams: Promise<{
    date?: string | string[];
  }>;
};

export default async function WritePage({ searchParams }: WritePageProps) {
  const params = await searchParams;
  const requestedDate = Array.isArray(params.date) ? params.date[0] : params.date;
  const initialDateKey = requestedDate && isValidDateKey(requestedDate) ? requestedDate : undefined;
  const [targets, events, thankYous] = await Promise.all([
    getTargets(),
    getEvents(),
    getThankYouList(),
  ]);

  return (
    <WriteCalendar
      events={events}
      initialDateKey={initialDateKey}
      targets={targets}
      thankYous={thankYous}
    />
  );
}
