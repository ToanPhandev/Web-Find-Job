import React from 'react';
import { Job } from '@/types/job';

interface JobCardProps {
    job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1" title={job.title}>
                        {job.title}
                    </h3>
                    <p className="text-gray-600 font-medium">{job.company}</p>
                </div>
                <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                    {job.salary}
                </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            ></path>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                        </svg>
                        {job.location}
                    </span>
                    <span className="text-xs mt-1">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm">
                    Apply Now
                </button>
            </div>
        </div>
    );
};

export default JobCard;
