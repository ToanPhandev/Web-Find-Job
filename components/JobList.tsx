import React from 'react';
import { Job } from '@/types/job';
import JobCard from './JobCard';

interface JobListProps {
    jobs: Job[];
}

const JobList: React.FC<JobListProps> = ({ jobs }) => {
    // Empty State
    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Không tìm thấy công việc phù hợp
                </h3>
                <p className="text-gray-500 max-w-sm">
                    Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc để xem nhiều kết quả hơn.
                </p>
            </div>
        );
    }

    // Grid Layout
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
};

export default JobList;
