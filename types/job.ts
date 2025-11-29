export interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    salary: string;
    tags: string[];
    description: string;
    created_at: string;
}

export type JobFilter = {
    query?: string;
};
