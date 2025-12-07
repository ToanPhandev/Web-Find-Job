'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/adminService';
import { Application, ApplicationStatus } from '@/types/application';
import { Eye, FileText, Loader2 } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllApplications();
            setApplications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
        try {
            // Optimistic update
            setApplications((prev) =>
                prev.map((app) =>
                    app.id === id ? { ...app, status: newStatus } : app
                )
            );
            await adminService.updateApplicationStatus(id, newStatus);
        } catch (err) {
            console.error(err);
            fetchApplications(); // Revert on error
        }
    };

    const getStatusBadgeVariant = (status: ApplicationStatus) => {
        switch (status) {
            case 'pending':
                return 'secondary'; // Yellow-ish usually, or customize
            case 'interview':
                return 'default'; // Blue/Primary
            case 'rejected':
                return 'destructive'; // Red
            case 'offer':
                return 'outline'; // Green usually needs custom class or variant
            default:
                return 'secondary';
        }
    };

    // Custom styling for Badge colors to match request exactly if variants aren't enough
    const getBadgeClassName = (status: ApplicationStatus) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200';
            case 'interview':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200';
            case 'offer':
                return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
            default:
                return '';
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(dateString));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Quản lý đơn ứng tuyển</CardTitle>
                    <CardDescription>
                        Danh sách tất cả các ứng viên đã nộp hồ sơ vào hệ thống.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Ứng viên</TableHead>
                                    <TableHead>Vị trí</TableHead>
                                    <TableHead>Ngày nộp</TableHead>
                                    <TableHead>CV</TableHead>
                                    <TableHead className="w-[250px]">Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            Chưa có đơn ứng tuyển nào.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    applications.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">{app.fullname}</span>
                                                    <span className="text-sm text-muted-foreground">{app.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-blue-600">
                                                    {app.jobs?.title || 'Unknown Job'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatDate(app.created_at)}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={app.cv_url} target="_blank">
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Xem CV
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={getBadgeClassName(app.status)} variant="outline">
                                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                    </Badge>

                                                    <Select
                                                        value={app.status}
                                                        onValueChange={(value) =>
                                                            handleStatusChange(app.id, value as ApplicationStatus)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[130px] h-8">
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="interview">Interview</SelectItem>
                                                            <SelectItem value="offer">Offer</SelectItem>
                                                            <SelectItem value="rejected">Rejected</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
