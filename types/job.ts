export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary_range: string;
    job_type: string;
    tags: string[];
    description: string;
    requirements: string;
    created_at: string;
}

export type JobFilter = {
    query?: string;
};
