'use client'

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Search, MapPin, Briefcase, Clock, Building2, DollarSign, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  job_type: string;
  created_at: string;
  logo_url?: string;
}

export default function Home() {
  const supabase = createClient();

  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('all');
  const [jobType, setJobType] = useState('all');

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (searchQuery.trim()) query = query.ilike('title', `%${searchQuery}%`);
      if (location !== 'all') query = query.ilike('location', `%${location}%`);
      if (jobType !== 'all') query = query.eq('job_type', jobType);

      const { data, error } = await query;
      if (error) throw error;
      setJobs(data || []);

    } catch (error) {
      console.error('Lỗi tải job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = () => {
    fetchJobs();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 1. HERO SECTION */}
      <div className="bg-white border-b pb-8 pt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Tìm kiếm công việc</span>
            <span className="block text-blue-600">mơ ước của bạn</span>
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-sm text-gray-500 sm:text-base md:mt-4">
            Hàng nghìn cơ hội việc làm hấp dẫn đang chờ đón bạn.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. SEARCH BAR */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mt-8 mb-10">
            <div className="flex flex-col md:flex-row gap-3">

              {/* Input Từ khóa */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Vị trí, công ty..."
                  className="pl-9 h-10 text-sm border-transparent bg-gray-50 hover:bg-gray-100 focus:bg-white transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Nhóm bộ lọc & Nút bấm */}
              <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
                {/* Select Địa điểm */}
                <div className="w-full md:w-[180px] min-w-[140px]">
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="h-10 text-sm border-transparent bg-gray-50 hover:bg-gray-100 focus:bg-white">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2 h-3.5 w-3.5" />
                        <SelectValue placeholder="Địa điểm" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả địa điểm</SelectItem>
                      <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                      <SelectItem value="Hồ Chí Minh">TP. HCM</SelectItem>
                      <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Loại hình */}
                <div className="w-full md:w-[170px] min-w-[140px]">
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="h-10 text-sm border-transparent bg-gray-50 hover:bg-gray-100 focus:bg-white">
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="mr-2 h-3.5 w-3.5" />
                        <SelectValue placeholder="Loại hình" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại hình</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Button */}
                <Button
                  className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
                  onClick={handleSearch}
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. LIST JOBS */}
        <div className="mb-6 flex items-center justify-between max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900">Việc làm nổi bật</h2>
          <span className="text-sm text-gray-500">Tìm thấy {jobs.length} kết quả</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed max-w-5xl mx-auto">
            <p className="text-gray-500 text-sm">Không tìm thấy công việc phù hợp.</p>
            <Button variant="link" onClick={() => {
              setSearchQuery('');
              setLocation('all');
              setJobType('all');
              fetchJobs();
            }} className="text-sm">
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 pb-12 max-w-5xl mx-auto">
            {jobs.map((job) => (
              // Thay đổi: Dùng thẻ div thay vì Link cho container ngoài cùng
              <div
                key={job.id}
                className="group bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-500 font-bold text-lg">
                      {job.company.charAt(0)}
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {job.job_type}
                    </span>
                  </div>

                  {/* Tiêu đề vẫn là Link để bấm vào xem chi tiết */}
                  <Link href={`/jobs/${job.id}`}>
                    <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer">
                      {job.title}
                    </h3>
                  </Link>

                  <div className="flex items-center text-gray-600 mb-3 text-xs font-medium">
                    <Building2 className="h-3.5 w-3.5 mr-1" />
                    {job.company}
                  </div>

                  <div className="space-y-1.5 mb-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <DollarSign className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      {job.salary_range}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: vi })}
                    </div>
                  </div>
                </div>

                {/* KHU VỰC 2 NÚT BẤM */}
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-center w-full py-2 rounded-md text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                  >
                    Xem chi tiết
                  </Link>

                  <Link
                    href={`/jobs/${job.id}/apply`}
                    className="flex items-center justify-center w-full py-2 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    <Send className="w-3 h-3 mr-1.5" />
                    Ứng tuyển
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}