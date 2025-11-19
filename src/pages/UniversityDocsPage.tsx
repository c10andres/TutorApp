import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { universityDocsService } from '../services/university-docs';
import { auth } from '../firebase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { formatDate } from '../utils/formatters';
import { 
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Calendar,
  Tag,
  AlertCircle,
  TrendingUp,
  Clock,
  BookOpen,
  Scroll,
  Newspaper,
  Users,
  Settings,
  Archive,
  Award,
  Paperclip,
  X,
  Loader2
} from 'lucide-react';

interface UniversityDocsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

type DocumentCategory = 
  | 'Estatutos'
  | 'Reglamentos'
  | 'Resoluciones'
  | 'Circulares'
  | 'Acuerdos'
  | 'Políticas'
  | 'Formularios'
  | 'Guías'
  | 'Manuales';

type DocumentPriority = 'alta' | 'media' | 'baja';
type DocumentStatus = 'vigente' | 'derogado' | 'en_revision';

interface UniversityDocument {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  priority: DocumentPriority;
  status: DocumentStatus;
  publishDate: Date;
  lastModified: Date;
  fileUrl: string;
  fileSize: number;
  tags: string[];
  downloadCount: number;
  version: string;
  author: string;
  department: string;
  storagePath?: string;
  fileName?: string;
}

const CATEGORY_ICONS: Record<DocumentCategory, any> = {
  'Estatutos': Scroll,
  'Reglamentos': BookOpen,
  'Resoluciones': FileText,
  'Circulares': Newspaper,
  'Acuerdos': Users,
  'Políticas': Settings,
  'Formularios': Paperclip,
  'Guías': Award,
  'Manuales': Archive
};


const MOCK_DOCUMENTS: UniversityDocument[] = [
  {
    id: 'doc-1',
    title: 'Estatuto General de la Universidad',
    description: 'Documento fundamental que establece la misión, visión y principios de la institución.',
    category: 'Estatutos',
    priority: 'alta',
    status: 'vigente',
    publishDate: new Date('2023-01-15'),
    lastModified: new Date('2024-03-10'),
    fileUrl: 'estatuto-general.pdf',
    fileSize: 2048000,
    tags: ['fundacional', 'normativa', 'institucional'],
    downloadCount: 1250,
    version: '2024.1',
    author: 'Consejo Superior',
    department: 'Rectoría'
  },
  {
    id: 'doc-2',
    title: 'Reglamento Estudiantil',
    description: 'Normativas que rigen los derechos y deberes de los estudiantes universitarios.',
    category: 'Reglamentos',
    priority: 'alta',
    status: 'vigente',
    publishDate: new Date('2023-08-01'),
    lastModified: new Date('2024-01-20'),
    fileUrl: 'reglamento-estudiantil.pdf',
    fileSize: 1536000,
    tags: ['estudiantes', 'académico', 'disciplinario'],
    downloadCount: 2180,
    version: '2024.1',
    author: 'Vicerrectoría Académica',
    department: 'Registro Académico'
  },
  {
    id: 'doc-3',
    title: 'Resolución de Calendario Académico 2024',
    description: 'Fechas importantes del año académico, períodos de matrícula y exámenes.',
    category: 'Resoluciones',
    priority: 'media',
    status: 'vigente',
    publishDate: new Date('2023-12-01'),
    lastModified: new Date('2023-12-01'),
    fileUrl: 'calendario-academico-2024.pdf',
    fileSize: 512000,
    tags: ['calendario', 'fechas', '2024'],
    downloadCount: 3420,
    version: '1.0',
    author: 'Registro Académico',
    department: 'Vicerrectoría Académica'
  }
];

const DOCUMENT_CATEGORIES = [
  { id: 'Estatutos', name: 'Estatutos', count: 5, icon: Scroll },
  { id: 'Reglamentos', name: 'Reglamentos', count: 12, icon: BookOpen },
  { id: 'Resoluciones', name: 'Resoluciones', count: 28, icon: FileText },
  { id: 'Circulares', name: 'Circulares', count: 15, icon: Newspaper },
  { id: 'Acuerdos', name: 'Acuerdos', count: 8, icon: Users }
];

export function UniversityDocsPage({ onNavigate }: UniversityDocsPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<UniversityDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<UniversityDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, searchTerm, selectedCategory, sortBy, dateFrom, dateTo]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 [loadDocuments] Iniciando carga de documentos...');
      
      // Cargar documentos (desde local o Firebase)
      const docs = await universityDocsService.getAllDocuments();
      
      console.log(`📊 [loadDocuments] Se obtuvieron ${docs.length} documentos`);
      
      if (docs.length > 0) {
        setDocuments(docs);
        console.log('✅ [loadDocuments] Documentos cargados correctamente');
      } else {
        // No usar mock, mostrar mensaje de que no hay documentos
        console.log('⚠️ [loadDocuments] No se encontraron documentos');
        setDocuments([]);
        setError('No se encontraron documentos. Agrega documentos en la carpeta public/documents/ y actualiza metadata.json');
      }
    } catch (error) {
      console.error('❌ [loadDocuments] Error cargando documentos:', error);
      setError('Error al cargar los documentos. Verifica la consola para más detalles.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDocuments = () => {
    let filtered = [...documents];

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }


    if (dateFrom) {
      filtered = filtered.filter(doc => doc.publishDate >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(doc => doc.publishDate <= new Date(dateTo));
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.publishDate.getTime() - b.publishDate.getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'downloads':
        filtered.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
    }

    setFilteredDocuments(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
    setDateFrom('');
    setDateTo('');
  };

  const handleDownload = async (document: UniversityDocument) => {
    try {
      console.log('Descargando documento:', document.title);
      
      // Intentar descargar desde Firebase Storage
      if ('storagePath' in document && document.storagePath) {
        // Documento tiene storagePath, usar descarga real
        await universityDocsService.downloadDocument(document as any);
        
        // Actualizar contador local
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, downloadCount: doc.downloadCount + 1 }
            : doc
        ));
      } else if (document.fileUrl) {
        // Intentar descargar usando fileUrl
        const link = window.document.createElement('a');
        link.href = document.fileUrl;
        link.download = document.title + '.pdf';
        link.target = '_blank';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        // Actualizar contador local
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, downloadCount: doc.downloadCount + 1 }
            : doc
        ));
      } else {
        // Documento mock, simular descarga
        console.log('📄 Documento de prueba - simulando descarga');
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, downloadCount: doc.downloadCount + 1 }
            : doc
        ));
      }
    } catch (error) {
      console.error('Error descargando documento:', error);
      setError('Error al descargar el documento');
    }
  };

  const handleView = async (document: UniversityDocument) => {
    try {
      let url: string;
      
      if (document.storagePath?.startsWith('local/')) {
        // Documento local - usar fileUrl directamente
        url = document.fileUrl;
        console.log('👁️ [handleView] Abriendo documento local:', url);
      } else if (document.storagePath) {
        // Si tiene storagePath de Firebase, obtener URL de Firebase Storage
        try {
          url = await universityDocsService.getDownloadURL(document.storagePath);
        } catch (error) {
          // Si falla Firebase Storage, usar fileUrl como fallback
          console.log('⚠️ Error con Firebase Storage, usando URL local');
          url = document.fileUrl;
        }
      } else if (document.fileUrl) {
        // Si solo tiene fileUrl, usarlo directamente
        url = document.fileUrl;
      } else {
        setError('El documento no tiene una URL válida para visualizar');
        return;
      }

      // Verificar que la URL sea válida
      if (!url || url === '') {
        setError('El documento no tiene una URL válida');
        return;
      }

      // Asegurar que la URL sea absoluta si es relativa
      if (url.startsWith('/')) {
        // Ya es una ruta absoluta desde la raíz
        url = window.location.origin + url;
      } else if (!url.startsWith('http')) {
        // Es una ruta relativa, convertir a absoluta
        url = window.location.origin + '/' + url;
      }

      console.log('🔗 [handleView] URL final:', url);
      
      // Abrir en nueva pestaña para visualizar el PDF
      window.open(url, '_blank');
    } catch (error) {
      console.error('❌ [handleView] Error abriendo documento:', error);
      setError('Error al abrir el documento. Verifica que el archivo exista en public/documents/');
    }
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDateSpanish = (date: Date): string => {
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl mb-2">Documentación Universitaria</h1>
          <p className="text-gray-600">Cargando documentos...</p>
        </div>
        
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Documentación Universitaria</h1>
          <p className="text-gray-600">
            Accede a estatutos, reglamentos, resoluciones y más documentos oficiales
          </p>
        </div>
        
        <Button variant="outline" onClick={() => setShowFiltersDialog(true)}>
          <Filter className="size-4 mr-2" />
          Filtros Avanzados
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {DOCUMENT_CATEGORIES.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name} ({category.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="oldest">Más antiguos</SelectItem>
            <SelectItem value="title">Título (A-Z)</SelectItem>
            <SelectItem value="downloads">Más descargados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {DOCUMENT_CATEGORIES.slice(0, 5).map((category) => {
          const Icon = category.icon;
          const count = documents.filter(doc => doc.category === category.id).length;
          return (
            <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Icon className="size-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-sm">{category.name}</h3>
                <p className="text-xs text-gray-600">{count} documentos</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
            <div className="text-sm text-gray-600">Total Documentos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {documents.reduce((sum, doc) => sum + doc.downloadCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Descargas Totales</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Documentos ({filteredDocuments.length})
          </h2>
          {(searchTerm || selectedCategory !== 'all') && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="size-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron documentos
              </h3>
              <p className="text-gray-600 mb-4">
                Intenta ajustar los filtros de búsqueda
              </p>
              <Button onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => {
            const CategoryIcon = CATEGORY_ICONS[document.category];
            
            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <CategoryIcon className="size-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{document.title}</h3>
                          <p className="text-gray-600 mt-1">{document.description}</p>
                        </div>
                        
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>{formatDateSpanish(document.publishDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="size-4" />
                          <span>{formatFileSize(document.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="size-4" />
                          <span>{document.downloadCount} descargas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="size-4" />
                          <span>v{document.version}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-gray-500">
                          <span>{document.author} • {document.department}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleView(document)}
                          >
                            <Eye className="size-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleDownload(document)}
                          >
                            <Download className="size-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filtros Avanzados</DialogTitle>
            <DialogDescription>
              Refina tu búsqueda con filtros adicionales
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="date-from">Fecha desde</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="date-to">Fecha hasta</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Limpiar Filtros
            </Button>
            <Button onClick={() => setShowFiltersDialog(false)} className="flex-1">
              Aplicar Filtros
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
