import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Target {
	id: string;
	nickname: string;
	thank_you_count: number;
}

export async function getTargetList(): Promise<Target[]> {
	try {
		const { data, error } = await supabase
			.from('targets')
			.select('id, nickname, thank_you_count')
			.order('thank_you_count', { ascending: false });

		if (error) {
			throw new Error(`Failed to fetch target list: ${error.message}`);
		}

		return (data as Target[]) || [];
	} catch (error) {
		console.error('Error fetching target list:', error);
		throw error;
	}
}

export async function insertTarget(
	id: string,
	nickname: string
): Promise<Target> {
	try {
		const { data, error } = await supabase
			.from('targets')
			.insert({ id, nickname, thank_you_count: 0 })
			.select('id, nickname, thank_you_count')
			.single();

		if (error) {
			throw new Error(`Failed to insert target: ${error.message}`);
		}

		return data as Target;
	} catch (error) {
		console.error('Error inserting target:', error);
		throw error;
	}
}

export async function incrementThankYouCount(
	id: string
): Promise<Target> {
	try {
		const current = await supabase
			.from('targets')
			.select('thank_you_count')
			.eq('id', id)
			.single();

		if (current.error) {
			throw new Error(`Failed to read current count: ${current.error.message}`);
		}

		const newCount = ((current.data as any)?.thank_you_count ?? 0) + 1;

		const { data: updated, error: updateError } = await supabase
			.from('targets')
			.update({ thank_you_count: newCount })
			.eq('id', id)
			.select('id, nickname, thank_you_count')
			.single();

		if (updateError) throw new Error(`Failed to increment thank_you_count: ${updateError.message}`);

		return updated as Target;
	} catch (error) {
		console.error('Error incrementing thank_you_count:', error);
		throw error;
	}
}
