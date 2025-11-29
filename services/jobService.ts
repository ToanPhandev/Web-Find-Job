import { createClient } from '@/utils/supabase/client';
import { Job } from '@/types/job';

const supabase = createClient();

export const getJobs = async (): Promise<Job[]> => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }

        return (data as any[]).map((item) => ({
            id: item.id,
            title: item.title,
            company: item.company,
            location: item.location,
            salary: item.salary,
            tags: item.tags || [],
            description: item.description,
            created_at: item.created_at,
        }));
    } catch (error) {
        console.error('Unexpected error in getJobs:', error);
        return [];
    }
};

export const searchJobs = async (query: string): Promise<Job[]> => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('is_active', true)
            .or(`title.ilike.%${query}%,tags.cs.{${query}}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error searching jobs:', error);
            return [];
        }

        return (data as any[]).map((item) => ({
            id: item.id,
            title: item.title,
            company: item.company,
            location: item.location,
            salary: item.salary,
            tags: item.tags || [],
            description: item.description,
            created_at: item.created_at,
        }));
    } catch (error) {
        console.error('Unexpected error in searchJobs:', error);
        return [];
    }
};
