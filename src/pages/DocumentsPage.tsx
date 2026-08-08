import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { documentsService, UniversityDocument } from '../services/documents';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Plus,
  Search,
  UploadCloud,
  FileText,
  Download,
  Eye,
  Trash2,
  ThumbsUp,
  User,
  AlertCircle,
  Loader2,
  Book,
  FileCode,
  ClipboardList
} from 'lucide-react';
import { ReportButton } from '../components/ReportButton';

const DOCUMENT_CATEGORIES = [
  { id: 'all', name: 'Todas', icon: Book, color: 'bg-gray-100 text-gray-800', ring: 'ring-gray-300' },
  { id: 'notes', name: 'Apuntes', icon: ClipboardList, color: 'bg-blue-100 text-blue-800', ring: 'ring-blue-300' },
  { id: 'exams', name: 'Exámenes', icon: FileText, color: 'bg-green-100 text-green-800', ring: 'ring-green-300' },
  { id: 'projects', name: 'Proyectos', icon: FileCode, color: 'bg-purple-100 text-purple-800', ring: 'ring-purple-300' },
];

export function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<UniversityDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<UniversityDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario de subida
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'notes',
    file: null as File | null,
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory, sortBy]);

  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await documentsService.getAllDocuments();
      setDocuments(data);
    } catch (error: any) {
      console.error('Error al cargar documentos:', error);
      setError('Error al cargar los documentos.');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Ordenar
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
    }

    setFilteredDocuments(filtered);
  };

  const handleFileUpload = async () => {
    if (!uploadForm.file || !uploadForm.title) {
      setError('Por favor, selecciona un archivo y añade un título.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await documentsService.uploadDocument(uploadForm.file, {
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
      });

      setShowUploadDialog(false);
      setUploadForm({ title: '', description: '', category: 'notes', file: null });
      loadDocuments(); // Recargar la lista
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setError('Error al subir el documento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (doc: UniversityDocument) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${doc.title}"?`)) return;

    try {
      await documentsService.deleteDocument(doc);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('No se pudo eliminar el documento.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Header */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-3 max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Biblioteca de Documentos
              </h1>
              <p className="text-indigo-100 text-lg md:text-xl font-medium">
                Encuentra y comparte apuntes, exámenes y proyectos con la comunidad estudiantil.
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0">
              {user && (
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full md:w-auto bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-lg px-8 py-6 shadow-lg transition-transform duration-300 hover:scale-105"
                    >
                      <UploadCloud className="size-6 mr-3" />
                      Subir Documento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Subir un nuevo documento</DialogTitle>
                      <DialogDescription>
                        Aporta tu granito de arena a la biblioteca de la comunidad.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        type="text"
                        placeholder="Título del documento *"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      />
                      <Textarea
                        placeholder="Descripción (opcional)"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      />
                      <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="file"
                        onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files ? e.target.files[0] : null })}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancelar</Button>
                      <Button onClick={handleFileUpload} disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2" />}
                        {submitting ? 'Subiendo...' : 'Subir'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filtros y Categorías */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
              <Input
                placeholder="Buscar por título, descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Ordenar por" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="popular">Más populares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Lista de Documentos */}
        {loading ? (
          <div className="text-center p-12">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando documentos...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map(doc => {
              const categoryInfo = DOCUMENT_CATEGORIES.find(c => c.id === doc.category);
              const CategoryIcon = categoryInfo?.icon || FileText;
              return (
                <Card
                  key={doc.id}
                  className="transition-all duration-300 hover:shadow-lg hover:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${categoryInfo?.color}`}>
                        <CategoryIcon className="size-6 text-current" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{doc.title}</h3>
                          <Badge variant="outline" className={`flex-shrink-0 ${categoryInfo?.color} border-transparent`}>
                            {categoryInfo?.name || doc.category}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2 text-sm">{doc.description}</p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-500 dark:text-gray-400 gap-4 pt-2">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <User className="size-4" />
                              <span>{(doc as any).authorName || 'Anónimo'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Download className="size-4" />
                              <span>{(doc as any).downloads || 0} descargas</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ThumbsUp className="size-4" />
                              <span>{(doc as any).upvotes || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <a href={doc.fileURL} target="_blank" rel="noopener noreferrer">
                                <Download className="size-4 mr-2" />
                                Descargar
                              </a>
                            </Button>
                            {user && (doc as any).authorId !== user.id && (
                              <ReportButton contentId={doc.id} contentType="document" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">No se encontraron documentos</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Intenta con otros filtros.'
                  : 'Sé el primero en subir un documento.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}