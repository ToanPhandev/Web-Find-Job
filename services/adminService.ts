import { createClient } from '@/utils/supabase/client';
import { Application, ApplicationStatus } from '@/types/application';

export const adminService = {
    async getAllApplications() {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                jobs (
                    title
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }

        return data as Application[];
    },

    async updateApplicationStatus(id: string, status: ApplicationStatus) {
        const supabase = createClient();

        const { error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error('Error updating application status:', error);
            throw error;
        }
    }
};
