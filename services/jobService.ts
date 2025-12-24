import { createClient } from '@/utils/supabase/client';
import { Job } from '@/types/job';

const supabase = createClient();

export const getJobs = async (): Promise<Job[]> => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('status', 'active')
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
            salary_range: item.salary_range,
            job_type: item.job_type,
            tags: item.tags || [],
            description: item.description,
            requirements: item.requirements,
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
            .eq('status', 'active')
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
            salary_range: item.salary_range,
            job_type: item.job_type,
            tags: item.tags || [],
            description: item.description,
            requirements: item.requirements,
            created_at: item.created_at,
        }));
    } catch (error) {
        console.error('Unexpected error in searchJobs:', error);
        return [];
    }
};

export const getJobById = async (id: string): Promise<Job | null> => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching job by id:', error);
            return null;
        }

        if (!data) return null;

        return {
            id: data.id,
            title: data.title,
            company: data.company,
            location: data.location,
            salary_range: data.salary_range,
            job_type: data.job_type,
            tags: data.tags || [],
            description: data.description,
            requirements: data.requirements,
            created_at: data.created_at,
        };
    } catch (error) {
        console.error('Unexpected error in getJobById:', error);
        return null;
    }
};
