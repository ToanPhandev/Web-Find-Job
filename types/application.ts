export type ApplicationStatus = 'pending' | 'interview' | 'rejected' | 'offer';

export interface Application {
    id: string;
    job_id: string;
    user_id: string;
    fullname: string;
    email: string;
    phone: string;
    cv_url: string;
    cover_letter?: string;
    status: ApplicationStatus;
    created_at: string;
    jobs?: {
        title: string;
    };
}
