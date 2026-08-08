// Página de Horario Académico
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Clock, Calendar as CalendarIcon, Loader2, AlertCircle, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { academicFirebaseService, FirebaseSubject } from '../services/academic-firebase';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';

interface SchedulePageProps {
    onNavigate: (page: string) => void;
}

interface ClassBlock {
    subjectName: string;
    building?: string;
    room?: string;
    color: string;
}

export function SchedulePage({ onNavigate }: SchedulePageProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [scheduleData, setScheduleData] = useState<{ [key: string]: ClassBlock }>({});
    const [activeSemesterName, setActiveSemesterName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Días de la semana (Lunes a Domingo)
    const days = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
    const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM (22:00)

    // Helper to get current day index (0=Monday, 6=Sunday)
    const getCurrentDayIndex = () => {
        const day = new Date().getDay(); // 0=Sun, 1=Mon...
        return day === 0 ? 6 : day - 1;
    };

    const [selectedDayIndex, setSelectedDayIndex] = useState(getCurrentDayIndex());

    // Colores para las materias
    const subjectColors = [
        'bg-blue-100 border-blue-300 text-blue-800',
        'bg-green-100 border-green-300 text-green-800',
        'bg-purple-100 border-purple-300 text-purple-800',
        'bg-orange-100 border-orange-300 text-orange-800',
        'bg-pink-100 border-pink-300 text-pink-800',
        'bg-teal-100 border-teal-300 text-teal-800',
        'bg-indigo-100 border-indigo-300 text-indigo-800',
        'bg-yellow-100 border-yellow-300 text-yellow-800',
    ];

    useEffect(() => {
        loadSchedule();
    }, [user]);

    const loadSchedule = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Obtener semestres del usuario
            const semesters = await academicFirebaseService.getUserSemesters(user.id);

            // Encontrar el semestre activo
            const activeSemester = semesters.find(s => s.isActive);

            if (!activeSemester) {
                setLoading(false);
                return;
            }

            setActiveSemesterName(activeSemester.name);

            // Procesar materias para el horario
            const newScheduleData: { [key: string]: ClassBlock } = {};

            activeSemester.subjects.forEach((subject, index) => {
                const color = subjectColors[index % subjectColors.length];

                // Intentar procesar scheduleBlocks si existen
                if (subject.scheduleBlocks && subject.scheduleBlocks.length > 0) {
                    subject.scheduleBlocks.forEach(block => {
                        processScheduleBlock(block.day, block.time, subject, color, block.building, block.room, newScheduleData);
                    });
                }
                // Si no, intentar usar los campos directos day/time
                else if (subject.day && subject.time) {
                    processScheduleBlock(subject.day, subject.time, subject, color, subject.building, subject.room, newScheduleData);
                }
            });

            setScheduleData(newScheduleData);
        } catch (err) {
            console.error("Error loading schedule:", err);
            setError("No se pudo cargar el horario. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const processScheduleBlock = (
        dayStr: string,
        timeStr: string,
        subject: FirebaseSubject,
        color: string,
        building: string | undefined,
        room: string | undefined,
        data: { [key: string]: ClassBlock }
    ) => {
        const dayIndex = parseDay(dayStr);
        const timeRange = parseTime(timeStr);

        if (dayIndex !== -1 && timeRange) {
            for (let hour = timeRange.start; hour < timeRange.end; hour++) {
                const key = `${dayIndex}-${hour}`;
                data[key] = {
                    subjectName: subject.name,
                    building: building || subject.building,
                    room: room || subject.room,
                    color: color
                };
            }
        }
    };

    const parseDay = (dayStr: string): number => {
        const normalized = dayStr.toLowerCase().trim();
        const map: { [key: string]: number } = {
            'lunes': 0, 'lun': 0, 'monday': 0, 'mon': 0,
            'martes': 1, 'mar': 1, 'tuesday': 1, 'tue': 1,
            'miércoles': 2, 'miercoles': 2, 'mié': 2, 'mie': 2, 'wednesday': 2, 'wed': 2,
            'jueves': 3, 'jue': 3, 'thursday': 3, 'thu': 3,
            'viernes': 4, 'vie': 4, 'friday': 4, 'fri': 4,
            'sábado': 5, 'sabado': 5, 'sáb': 5, 'sab': 5, 'saturday': 5, 'sat': 5,
            'domingo': 6, 'dom': 6, 'sunday': 6, 'sun': 6
        };
        return map[normalized] !== undefined ? map[normalized] : -1;
    };

    const parseTime = (timeStr: string): { start: number, end: number } | null => {
        try {
            // Formatos soportados: "8:00-10:00", "8-10", "08:00 - 10:00"
            const parts = timeStr.split('-').map(s => s.trim());
            if (parts.length !== 2) return null;

            let start = parseInt(parts[0].split(':')[0]);
            let end = parseInt(parts[1].split(':')[0]);

            if (isNaN(start) || isNaN(end)) return null;

            return { start, end };
        } catch (e) {
            return null;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="size-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Cargando tu horario...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarIcon className="size-6 text-blue-600" />
                        Horario Académico
                    </h1>
                    <p className="text-gray-600">
                        {activeSemesterName ? `Semestre: ${activeSemesterName}` : 'Visualiza tu horario de clases'}
                    </p>
                </div>

                {!activeSemesterName && (
                    <Alert variant="destructive" className="sm:max-w-md">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Sin semestre activo</AlertTitle>
                        <AlertDescription>
                            Ve a la sección "Académico" para activar un semestre y ver tus materias aquí.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Mobile View - Day Tabs & Timeline */}
            <div className="md:hidden space-y-4">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDayIndex(prev => (prev - 1 + 7) % 7)}
                        >
                            <ChevronLeft className="size-5" />
                        </Button>
                        <h2 className="font-bold text-lg text-blue-800">
                            {days[selectedDayIndex]}
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDayIndex(prev => (prev + 1) % 7)}
                        >
                            <ChevronRight className="size-5" />
                        </Button>
                    </div>

                    <Tabs
                        value={days[selectedDayIndex]}
                        onValueChange={(val) => setSelectedDayIndex(days.indexOf(val))}
                        className="w-full"
                    >
                        <TabsList className="w-full overflow-x-auto flex justify-start mb-4 scrollbar-hide">
                            {days.map((day) => (
                                <TabsTrigger key={day} value={day} className="flex-shrink-0">
                                    {day.substring(0, 3)}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {days.map((day, dayIdx) => (
                            <TabsContent key={day} value={day} className="mt-0 space-y-3">
                                {timeSlots.map((hour) => {
                                    const key = `${dayIdx}-${hour}`;
                                    const classBlock = scheduleData[key];
                                    const isCurrentHour = new Date().getHours() === hour && dayIdx === getCurrentDayIndex();

                                    return (
                                        <div key={hour} className="flex gap-3 relative group">
                                            {/* Time Column */}
                                            <div className="w-14 flex-shrink-0 flex flex-col items-end">
                                                <span className={`text-sm font-medium ${isCurrentHour ? 'text-blue-600' : 'text-gray-500'}`}>
                                                    {hour}:00
                                                </span>
                                            </div>

                                            {/* Timeline Line */}
                                            <div className="absolute left-[3.75rem] top-0 bottom-0 w-px bg-gray-200 group-last:bottom-auto group-last:h-full"></div>
                                            {isCurrentHour && (
                                                <div className="absolute left-[3.55rem] top-3 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500 z-10"></div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 pb-4 min-h-[3rem]">
                                                {classBlock ? (
                                                    <div className={`p-3 rounded-lg border shadow-sm ${classBlock.color} transition-all hover:shadow-md`}>
                                                        <div className="font-bold text-sm sm:text-base">{classBlock.subjectName}</div>
                                                        {(classBlock.building || classBlock.room) && (
                                                            <div className="flex items-center gap-1 mt-1 text-xs opacity-90">
                                                                <MapPin className="size-3" />
                                                                <span>{classBlock.building} {classBlock.room}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-full"></div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>

            {/* Desktop View - Weekly Grid */}
            <Card className="hidden md:block overflow-hidden border-t-4 border-t-blue-600 shadow-md">
                <CardHeader className="bg-gray-50 border-b pb-4">
                    <CardTitle className="text-center text-blue-800 text-xl">
                        {activeSemesterName || 'HORARIO SEMANAL'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Calendar Grid */}
                            <table className="w-full border-collapse">
                                {/* Header Row */}
                                <thead>
                                    <tr>
                                        <th className="bg-gray-100 text-gray-700 p-3 border-b border-r border-gray-200 w-20 font-bold text-sm sticky left-0 z-10">
                                            HORA
                                        </th>
                                        {days.map((day) => (
                                            <th key={day} className="bg-blue-50 text-blue-800 p-3 border-b border-r border-gray-200 font-bold text-sm min-w-[120px]">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.map((hour, hourIdx) => (
                                        <tr key={hour} className="hover:bg-gray-50 transition-colors">
                                            {/* Time Cell */}
                                            <td className="bg-gray-50 p-2 border-b border-r border-gray-200 text-center font-medium text-gray-500 text-xs sticky left-0 z-10">
                                                {hour.toString().padStart(2, '0')}:00
                                            </td>

                                            {/* Day Cells */}
                                            {days.map((day, dayIdx) => {
                                                const key = `${dayIdx}-${hour}`;
                                                const classBlock = scheduleData[key];

                                                return (
                                                    <td
                                                        key={`${day}-${hour}`}
                                                        className={`p-1 border-b border-r border-gray-200 align-top h-[70px] relative ${classBlock ? '' : (hourIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30')
                                                            }`}
                                                    >
                                                        {classBlock && (
                                                            <div className={`w-full h-full rounded-md p-2 text-xs border shadow-sm ${classBlock.color} flex flex-col justify-center overflow-hidden`}>
                                                                <div className="font-bold truncate" title={classBlock.subjectName}>
                                                                    {classBlock.subjectName}
                                                                </div>
                                                                {(classBlock.building || classBlock.room) && (
                                                                    <div className="mt-1 opacity-90 truncate">
                                                                        {classBlock.building} {classBlock.room}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                <Clock className="size-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">¿Cómo configurar tu horario?</p>
                    <p>
                        Los horarios se generan automáticamente basados en la información de tus materias en la sección
                        <button onClick={() => onNavigate('academic')} className="font-bold underline ml-1 hover:text-blue-900">
                            Gestión Semestre
                        </button>.
                        Asegúrate de tener un semestre activo y que tus materias tengan asignados días y horas.
                    </p>
                </div>
            </div>
        </div>
    );
}
