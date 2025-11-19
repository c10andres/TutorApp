// Página de búsqueda de tutores
import React, { useState, useEffect } from 'react';
import { TutorCard, TutorCardSkeleton } from '../components/TutorCardImproved';
import { FirebaseSetupAlert } from '../components/FirebaseSetupAlert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { User, Subject } from '../types';
import { tutoringService } from '../services/tutoring';
import { 
  Search, 
  Filter,
  MapPin,
  DollarSign,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface SearchPageProps {
  onNavigate: (page: string, data?: any) => void;
}


export function SearchPage({ onNavigate }: SearchPageProps) {
  const [tutors, setTutors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [showFirebaseAlert, setShowFirebaseAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    city: 'all',
    minPrice: 0,
    maxPrice: 200000
  });
  const [showFilters, setShowFilters] = useState(false);


  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // No cargar todos los tutores inicialmente, esperar a que el usuario busque
      setTutors([]);
    } catch (err: any) {
      console.error('Error loading tutors:', err);
      setError('Error cargando tutores');
      
      // Mostrar alerta de Firebase si es necesario
      if (err.toString().includes('Permission denied')) {
        setShowFirebaseAlert(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setError('');

      // Si no hay búsqueda ni filtros activos, limpiar resultados
      if (!searchQuery.trim() && !hasActiveFilters()) {
        setTutors([]);
        return;
      }

      const searchFilters: any = {};
      
      if (filters.city && filters.city !== 'all') searchFilters.location = filters.city;
      if (filters.minPrice > 0) searchFilters.minRate = filters.minPrice;
      if (filters.maxPrice < 200000) searchFilters.maxRate = filters.maxPrice;

      const results = await tutoringService.searchTutors(searchQuery, searchFilters);
      setTutors(results);
    } catch (err: any) {
      console.error('Error searching tutors:', err);
      setError('Error buscando tutores');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setTutors([]); // Limpiar resultados sin cargar todos los tutores
  };

  const clearFilters = () => {
    setFilters({
      city: 'all',
      minPrice: 0,
      maxPrice: 200000
    });
    // Si no hay búsqueda activa, limpiar resultados
    if (!searchQuery.trim()) {
      setTutors([]);
    } else {
      handleSearch();
    }
  };

  const hasActiveFilters = () => {
    return (filters.city && filters.city !== 'all') || filters.minPrice > 0 || filters.maxPrice < 200000;
  };

  const handleFilterChange = (filterType: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Ciudades basadas en los perfiles reales de los tutores
  const cities = [
    'Barranquilla, Atlántico',
    'Bogotá, D.C.',
    'Cali, Valle del Cauca',
    'Medellín, Antioquia'
  ];



  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen w-full max-w-full overflow-x-hidden" style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Search Header */}
      <div>
        <h1 className="text-2xl mb-2">Buscar tutores</h1>
        <p className="text-gray-600">
          Encuentra el tutor perfecto para tus necesidades de aprendizaje en Colombia
        </p>
      </div>

      {/* Firebase Setup Alert */}
      <FirebaseSetupAlert 
        show={showFirebaseAlert} 
        onDismiss={() => setShowFirebaseAlert(false)} 
      />

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 size-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, materia o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-blue-50 border-blue-200' : ''}
            >
              <Filter className="size-4 mr-2" />
              Filtros
              {hasActiveFilters() && (
                <Badge variant="destructive" className="ml-2 size-2 p-0" />
              )}
            </Button>
            {searchQuery && (
              <Button variant="outline" onClick={clearSearch}>
                <X className="size-4 mr-2" />
                Limpiar
              </Button>
            )}
            </div>
          </CardContent>
        </Card>

      {/* Filtros Estructurados */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros de búsqueda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtro por Ciudad */}
            <div className="space-y-3">
              <Label htmlFor="city-select" className="text-sm font-medium">Ciudad</Label>
              <Select
                value={filters.city}
                onValueChange={(value) => handleFilterChange('city', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ciudad" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">Todas las ciudades</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Precio */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Rango de precio por hora</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-price" className="text-xs text-gray-600">Precio mínimo</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">$</span>
                    <Input
                      id="min-price"
                      type="number"
                      placeholder="0"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-price" className="text-xs text-gray-600">Precio máximo</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">$</span>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder="200000"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 200000)}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Rango visual */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>${filters.minPrice.toLocaleString()}</span>
                  <span>${filters.maxPrice.toLocaleString()}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value))}
                    className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                    className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="size-4 mr-2" />
                Aplicar filtros
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <X className="size-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros Activos */}
      {hasActiveFilters() && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {filters.city && filters.city !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="size-3" />
                  {filters.city}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => handleFilterChange('city', 'all')}
                  />
                </Badge>
              )}
              {filters.minPrice > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <DollarSign className="size-3" />
                  Min ${filters.minPrice.toLocaleString()}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => handleFilterChange('minPrice', 0)}
                  />
                </Badge>
              )}
              {filters.maxPrice < 200000 && (
                <Badge variant="secondary" className="gap-1">
                  <DollarSign className="size-3" />
                  Max ${filters.maxPrice.toLocaleString()}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => handleFilterChange('maxPrice', 200000)}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Limpiar todos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Información inicial cuando no hay búsqueda */}
      {tutors.length === 0 && !searching && !loading && !searchQuery && !hasActiveFilters() && (
        <div className="space-y-6">
          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">50+</div>
                <div className="text-sm text-gray-600">Tutores disponibles</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">15+</div>
                <div className="text-sm text-gray-600">Ciudades de Colombia</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">200+</div>
                <div className="text-sm text-gray-600">Materias disponibles</div>
              </CardContent>
            </Card>
          </div>

          {/* Materias populares */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Materias más populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Matemáticas', 'Física', 'Química', 'Programación', 'Inglés', 'Historia', 'Biología', 'Economía'].map((subject) => (
                  <Badge 
                    key={subject}
                    variant="secondary" 
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      setSearchQuery(subject);
                      handleSearch();
                    }}
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ciudades principales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tutores por ciudad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cities.map((city) => (
                  <Button
                    key={city}
                    variant="outline"
                    className="justify-start text-left h-auto p-3"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, city }));
                      handleSearch();
                    }}
                  >
                    <MapPin className="size-4 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium text-sm">{city.split(',')[0]}</div>
                      <div className="text-xs text-gray-500">{city.split(',')[1]}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips de búsqueda */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Search className="size-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">Consejos para encontrar el tutor perfecto</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Busca por materia específica (ej: "Cálculo", "Física")</li>
                    <li>• Usa filtros para encontrar tutores en tu ciudad</li>
                    <li>• Revisa las reseñas y experiencia de cada tutor</li>
                    <li>• Considera el precio por hora que mejor se ajuste a tu presupuesto</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">
            {searching ? 'Buscando...' : `${tutors.length} tutores encontrados`}
          </h2>
          {(searchQuery || hasActiveFilters()) && (
            <Button variant="outline" size="sm" onClick={() => {
              clearSearch();
              clearFilters();
            }}>
              <X className="size-4 mr-1" />
              Limpiar todo
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <TutorCardSkeleton key={index} />
            ))
          ) : tutors.length > 0 ? (
            // Tutors grid
            tutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                onViewProfile={() => onNavigate('tutor-profile', { tutor })}
                onRequestTutoring={() => onNavigate('request-tutoring', { tutor })}
              />
            ))
          ) : (
            // No results
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Search className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg mb-2">
                  {(searchQuery || hasActiveFilters())
                    ? 'No se encontraron tutores'
                    : 'Busca tutores por materia o ubicación'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {(searchQuery || hasActiveFilters())
                    ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                    : 'Usa la barra de búsqueda para encontrar el tutor perfecto para ti'
                  }
                </p>
                {(searchQuery || hasActiveFilters()) && (
                  <Button onClick={() => {
                    clearSearch();
                    clearFilters();
                  }}>
                    Limpiar todo
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
