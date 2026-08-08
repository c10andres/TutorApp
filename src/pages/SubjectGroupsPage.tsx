import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Loader2, Plus, Users, BookOpen, Search, User } from 'lucide-react';
import { getFirebaseFirestore } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { parseSubjectsCsv, UniversitySubject } from '../services/subjectParser';
import { SubjectGroup } from '../types';

export function SubjectGroupsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<SubjectGroup[]>([]);
    const [universitySubjects, setUniversitySubjects] = useState<UniversitySubject[]>([]);

    // Form states
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<UniversitySubject | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupCode, setGroupCode] = useState('');
    const [term, setTerm] = useState('2024-3'); // Default current term
    const [subjectSuggestions, setSubjectSuggestions] = useState<UniversitySubject[]>([]);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Load Catalog
            const response = await fetch('/Materias.csv');
            const text = await response.text();
            const parsedSubjects = parseSubjectsCsv(text);
            setUniversitySubjects(parsedSubjects);

            // Load Teacher's Groups
            const db = getFirebaseFirestore();
            const q = query(
                collection(db, 'subject_groups'),
                where('teacherId', '==', user.id)
            );

            const querySnapshot = await getDocs(q);
            const loadedGroups: SubjectGroup[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                loadedGroups.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date()
                } as SubjectGroup);
            });

            setGroups(loadedGroups);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubject = (query: string) => {
        setSearchTerm(query);
        if (query.length < 2) {
            setSubjectSuggestions([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const matches = universitySubjects
            .filter(s => s.name.toLowerCase().includes(lowerQuery) || s.code.toLowerCase().includes(lowerQuery))
            .slice(0, 10);

        // Remove duplicates by name
        const uniqueMatches = Array.from(new Map(matches.map(item => [item.name, item])).values());
        setSubjectSuggestions(uniqueMatches);
    };

    const handleCreateGroup = async () => {
        if (!user || !selectedSubject || !groupCode) return;

        try {
            setLoading(true);
            const db = getFirebaseFirestore();

            const newGroupData = {
                code: selectedSubject.code,
                name: selectedSubject.name,
                groupCode: groupCode,
                teacherId: user.id,
                teacherName: user.name,
                term: term,
                schedule: selectedSubject.schedule || 'Por definir',
                students: [],
                createdAt: new Date()
            };

            const docRef = await addDoc(collection(db, 'subject_groups'), newGroupData);

            const newGroup: SubjectGroup = {
                id: docRef.id,
                ...newGroupData
            };

            setGroups([...groups, newGroup]);
            setShowAddDialog(false);

            // Reset form
            setSelectedSubject(null);
            setGroupCode('');
            setSearchTerm('');

        } catch (error) {
            console.error("Error creating group:", error);
            alert("Error al crear el grupo");
        } finally {
            setLoading(false);
        }
    };

    // Allow access if user is 'docente' OR 'administrativo' OR 'isTestUser'
    const hasAccess = user?.academicRole === 'docente' || user?.academicRole === 'administrativo' || user?.isTestUser;

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
                <Users className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
                <p className="text-gray-500 max-w-md">
                    Esta página está reservada para usuarios con rol de <strong>Docente</strong> o <strong>Administrativo</strong>.
                    Contacta al administrador para actualizar tu perfil.
                </p>
            </div>
        );
    }
    return (
        <div className="space-y-6 p-4 pb-20 md:pb-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mis Grupos de Asignaturas</h1>
                    <p className="text-muted-foreground text-gray-500">
                        Gestiona tus materias y estudiantes inscritos
                    </p>
                </div>

                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Nuevo Grupo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Abrir nuevo grupo</DialogTitle>
                            <DialogDescription>
                                Selecciona una materia del catálogo para abrir un grupo.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Buscar Materia</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Nombre o código..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearchSubject(e.target.value)}
                                        className="pl-8"
                                    />

                                    {subjectSuggestions.length > 0 && !selectedSubject && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                            {subjectSuggestions.map((subject, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    onClick={() => {
                                                        setSelectedSubject(subject);
                                                        setSearchTerm(subject.name);
                                                        setSubjectSuggestions([]);
                                                    }}
                                                >
                                                    <div className="font-medium">{subject.name}</div>
                                                    <div className="text-xs text-gray-500">{subject.code} - {subject.faculty}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedSubject && (
                                <div className="p-3 bg-blue-50 rounded-md border border-blue-100 mb-2">
                                    <p className="text-sm font-medium text-blue-800">{selectedSubject.name}</p>
                                    <p className="text-xs text-blue-600">Código: {selectedSubject.code}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Grupo</Label>
                                    <Input
                                        placeholder="Ej. 81, 82"
                                        value={groupCode}
                                        onChange={(e) => setGroupCode(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Periodo</Label>
                                    <Select value={term} onValueChange={setTerm}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2024-3">2024-3</SelectItem>
                                            <SelectItem value="2025-1">2025-1</SelectItem>
                                            <SelectItem value="2025-2">2025-2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleCreateGroup} disabled={!selectedSubject || !groupCode || loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Crear Grupo
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>

            {loading && groups.length === 0 ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <Card key={group.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="mb-2">{group.code}</Badge>
                                    <Badge>{group.term}</Badge>
                                </div>
                                <CardTitle className="text-lg line-clamp-2">{group.name}</CardTitle>
                                <CardDescription>Grupo {group.groupCode}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>{group.students.length} estudiantes inscritos</span>
                                    </div>

                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-center text-gray-400">
                                            Código para estudiantes: <strong>{group.groupCode}</strong>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {groups.length === 0 && (
                        <div className="col-span-full text-center p-12 border-2 border-dashed rounded-lg bg-gray-50">
                            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No tienes grupos activos</h3>
                            <p className="text-gray-500">Crea tu primer grupo para que los estudiantes se inscriban.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
