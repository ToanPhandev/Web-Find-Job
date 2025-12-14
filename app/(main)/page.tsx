'use client';

import React, { useEffect, useState } from 'react';
import { Job } from '@/types/job';
import { getJobs } from '@/services/jobService';
import JobList from '@/components/JobList';
import SearchBar from '@/components/SearchBar';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const data = await getJobs();
        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        setError('Có lỗi xảy ra khi tải danh sách việc làm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lowerQuery) ||
        job.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
    setFilteredJobs(filtered);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Cổng Việc Làm Sinh Viên IT
          </h1>
          <p className="text-lg text-gray-600">
            Tìm kiếm cơ hội thực tập và việc làm tốt nhất cho bạn.
          </p>
        </header>

        <SearchBar onSearch={handleSearch} />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 font-medium">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <JobList jobs={filteredJobs} />
        )}
      </div>
    </main>
  );
}
