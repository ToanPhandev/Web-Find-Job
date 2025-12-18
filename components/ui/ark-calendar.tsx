"use client";

import { DatePicker, parseDate } from "@ark-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { format } from "date-fns";

export interface DateRange {
    start: Date | undefined;
    end: Date | undefined;
}

interface ArkCalendarProps {
    date?: DateRange;
    setDate: (date: DateRange) => void;
}

export default function ArkCalendar({ date, setDate }: ArkCalendarProps) {
    // Chuyển đổi an toàn DateRange -> Ark Date Array
    const value = [];
    if (date?.start) value.push(parseDate(format(date.start, "yyyy-MM-dd")));
    if (date?.end) value.push(parseDate(format(date.end, "yyyy-MM-dd")));

    return (
        <DatePicker.Root
            locale="vi-VN"
            value={value}
            open={true}
            onValueChange={(details) => {
                // Range mode: details.value có thể là [start] hoặc [start, end]
                const start = details.value[0] ? new Date(details.value[0].toString()) : undefined;
                const end = details.value[1] ? new Date(details.value[1].toString()) : undefined;
                setDate({ start, end });
            }}
            selectionMode="range"
            className="p-3 bg-white rounded-lg border shadow-sm inline-block"
        >
            <DatePicker.Context>
                {(api) => (
                    <>
                        {/* VIEW NGÀY */}
                        <DatePicker.View view="day">
                            <DatePicker.ViewControl className="flex justify-between items-center mb-4">
                                <DatePicker.PrevTrigger className="p-1 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"><ChevronLeftIcon className="w-4 h-4" /></DatePicker.PrevTrigger>

                                <DatePicker.ViewTrigger className="text-sm font-bold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors">
                                    {/* SỬA: Custom Title cho Day View: "tháng 2 - 2025" */}
                                    tháng {api.visibleRange.start.month} - {api.visibleRange.start.year}
                                </DatePicker.ViewTrigger>

                                <DatePicker.NextTrigger className="p-1 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"><ChevronRightIcon className="w-4 h-4" /></DatePicker.NextTrigger>
                            </DatePicker.ViewControl>

                            <DatePicker.Table className="w-full border-collapse">
                                <DatePicker.TableHead>
                                    <DatePicker.TableRow>
                                        {api.weekDays.map((weekDay, id) => (
                                            <DatePicker.TableHeader key={id} className="text-xs text-gray-400 font-medium w-9 h-9 text-center">{weekDay.narrow}</DatePicker.TableHeader>
                                        ))}
                                    </DatePicker.TableRow>
                                </DatePicker.TableHead>
                                <DatePicker.TableBody>
                                    {api.weeks.map((week, id) => (
                                        <DatePicker.TableRow key={id}>
                                            {week.map((day, id) => (
                                                <DatePicker.TableCell key={id} value={day} className="p-0 text-center">
                                                    <DatePicker.TableCellTrigger className="w-9 h-9 text-sm rounded-full flex items-center justify-center transition-all cursor-pointer relative z-10
                            text-gray-700 hover:bg-blue-50
                            data-[selected]:bg-blue-600 data-[selected]:text-white 
                            data-[in-range]:bg-blue-100 data-[in-range]:text-blue-700
                            data-[today]:border data-[today]:border-blue-600
                            data-[outside-range]:text-gray-300">
                                                        {day.day}
                                                    </DatePicker.TableCellTrigger>
                                                </DatePicker.TableCell>
                                            ))}
                                        </DatePicker.TableRow>
                                    ))}
                                </DatePicker.TableBody>
                            </DatePicker.Table>
                        </DatePicker.View>

                        {/* VIEW THÁNG */}
                        <DatePicker.View view="month">
                            <DatePicker.ViewControl className="flex justify-between items-center mb-4">
                                <DatePicker.PrevTrigger className="p-1 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"><ChevronLeftIcon className="w-4 h-4" /></DatePicker.PrevTrigger>
                                <DatePicker.ViewTrigger className="text-sm font-bold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors">
                                    {/* SỬA: Luôn hiện 1 năm (vì view tháng là trong 1 năm) */}
                                    {api.visibleRange.start.year}
                                </DatePicker.ViewTrigger>
                                <DatePicker.NextTrigger className="p-1 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"><ChevronRightIcon className="w-4 h-4" /></DatePicker.NextTrigger>
                            </DatePicker.ViewControl>
                            <DatePicker.Table>
                                <DatePicker.TableBody>
                                    {api.getMonthsGrid({ columns: 4, format: "short" }).map((months, id) => (
                                        <DatePicker.TableRow key={id}>
                                            {months.map((month, id) => (
                                                <DatePicker.TableCell key={id} value={month.value} className="p-1">
                                                    <DatePicker.TableCellTrigger className="w-full px-2 py-2 text-sm rounded hover:bg-blue-50 text-gray-700 font-medium cursor-pointer data-[selected]:bg-blue-600 data-[selected]:text-white">
                                                        {month.label}
                                                    </DatePicker.TableCellTrigger>
                                                </DatePicker.TableCell>
                                            ))}
                                        </DatePicker.TableRow>
                                    ))}
                                </DatePicker.TableBody>
                            </DatePicker.Table>
                        </DatePicker.View>

                        {/* VIEW NĂM */}
                        <DatePicker.View view="year">
                            <DatePicker.ViewControl className="flex justify-between items-center mb-4">
                                <DatePicker.PrevTrigger className="p-1 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"><ChevronLeftIcon className="w-4 h-4" /></DatePicker.PrevTrigger>
                                <DatePicker.ViewTrigger className="text-sm font-bold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors">
                                    {/* SỬA: Custom Title cho Year View */}
                                    {api.visibleRange.start.year === api.visibleRange.end.year
                                        ? api.visibleRange.start.year
                                        : `${api.visibleRange.start.year} - ${api.visibleRange.end.year}`}
                                </DatePicker.ViewTrigger>
                                <DatePicker.NextTrigger className="p-1 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"><ChevronRightIcon className="w-4 h-4" /></DatePicker.NextTrigger>
                            </DatePicker.ViewControl>
                            <DatePicker.Table>
                                <DatePicker.TableBody>
                                    {api.getYearsGrid({ columns: 4 }).map((years, id) => (
                                        <DatePicker.TableRow key={id}>
                                            {years.map((year, id) => (
                                                <DatePicker.TableCell key={id} value={year.value} className="p-1">
                                                    <DatePicker.TableCellTrigger className="w-full px-2 py-2 text-sm rounded hover:bg-blue-50 text-gray-700 font-medium cursor-pointer data-[selected]:bg-blue-600 data-[selected]:text-white">
                                                        {year.label}
                                                    </DatePicker.TableCellTrigger>
                                                </DatePicker.TableCell>
                                            ))}
                                        </DatePicker.TableRow>
                                    ))}
                                </DatePicker.TableBody>
                            </DatePicker.Table>
                        </DatePicker.View>
                    </>
                )}
            </DatePicker.Context>
        </DatePicker.Root>
    );
}