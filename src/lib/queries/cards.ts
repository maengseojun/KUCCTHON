import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Card {
	from_id: string;
	to_id: string;
	created_at: string;
	content: string;
}

export async function getCardsByFromAndToId(
	from_id: string,
	to_id: string
): Promise<Card[]> {
	try {
		const { data, error } = await supabase
			.from('cards')
			.select('from_id, to_id, created_at, content')
			.eq('from_id', from_id)
			.eq('to_id', to_id)
			.order('created_at', { ascending: false });

		if (error) {
			throw new Error(
				`Failed to fetch cards for from_id=${from_id} to_id=${to_id}: ${error.message}`
			);
		}

		return data || [];
	} catch (error) {
		console.error('Error fetching cards by from_id and to_id:', error);
		throw error;
	}
}
