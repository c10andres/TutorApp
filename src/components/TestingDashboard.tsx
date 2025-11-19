// Dashboard de testing y QA
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TestRunner, TestSuite, testUtils, appTests } from '../utils/testUtils';
import { 
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  RefreshCw,
  AlertTriangle,
  Info,
  BarChart3,
  Zap,
  Shield,
  Bug,
  Activity,
  Download,
  Eye
} from 'lucide-react';

interface TestingDashboardProps {
  className?: string;
}

export function TestingDashboard({ className }: TestingDashboardProps) {
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [testHistory, setTestHistory] = useState<TestSuite[]>([]);

  const runTests = async () => {
    try {
      setRunning(true);
      setError('');

      const runner = new TestRunner();
      
      // Agregar tests
      runner.addTest('Authentication', appTests.testAuthentication);
      runner.addTest('Data Validation', appTests.testDataValidation);
      runner.addTest('Performance', appTests.testPerformance);
      
      // Ejecutar tests
      const results = await runner.runAll();
      setTestSuite(results);
      setTestHistory(prev => [results, ...prev.slice(0, 9)]); // Mantener últimos 10
    } catch (err) {
      setError('Error ejecutando tests');
      console.error('Error running tests:', err);
    } finally {
      setRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="size-4 text-green-500" />;
      case 'fail': return <XCircle className="size-4 text-red-500" />;
      case 'skip': return <Clock className="size-4 text-yellow-500" />;
      default: return <Info className="size-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'skip': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOverallStatus = () => {
    if (!testSuite) return 'unknown';
    if (testSuite.failed > 0) return 'fail';
    if (testSuite.skipped > 0) return 'warning';
    return 'pass';
  };

  const exportResults = () => {
    if (!testSuite) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      suite: testSuite,
      history: testHistory
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testing & QA Dashboard</h1>
          <p className="text-gray-600">Sistema de testing automatizado y control de calidad</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={runTests} disabled={running}>
            {running ? (
              <>
                <RefreshCw className="size-4 mr-2 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="size-4 mr-2" />
                Ejecutar Tests
              </>
            )}
          </Button>
          {testSuite && (
            <Button onClick={exportResults} variant="outline">
              <Download className="size-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Estado general */}
      {testSuite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="size-5" />
              Resultados del Test Suite
            </CardTitle>
            <CardDescription>
              Ejecutado el {new Date().toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{testSuite.passed}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm text-green-600">Exitosos</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{testSuite.failed}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <XCircle className="size-4 text-red-500" />
                  <span className="text-sm text-red-600">Fallidos</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{testSuite.skipped}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Clock className="size-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">Omitidos</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{testSuite.totalDuration}ms</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Activity className="size-4 text-blue-500" />
                  <span className="text-sm text-blue-600">Duración</span>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso del Test Suite</span>
                <span>{Math.round((testSuite.passed / (testSuite.passed + testSuite.failed + testSuite.skipped)) * 100)}%</span>
              </div>
              <Progress 
                value={(testSuite.passed / (testSuite.passed + testSuite.failed + testSuite.skipped)) * 100} 
                className="h-2" 
              />
            </div>

            {/* Estado general */}
            <div className="flex items-center justify-center">
              <Badge className={`${getStatusColor(getOverallStatus())} text-lg px-4 py-2`}>
                {getOverallStatus() === 'pass' ? '✅ Todos los tests pasaron' :
                 getOverallStatus() === 'fail' ? '❌ Algunos tests fallaron' :
                 '⚠️ Tests con advertencias'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalles de tests */}
      {testSuite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Detalles de Tests
            </CardTitle>
            <CardDescription>
              Resultado individual de cada test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testSuite.tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-gray-500">
                        Duración: {test.duration}ms
                      </p>
                      {test.error && (
                        <p className="text-sm text-red-600 mt-1">
                          Error: {test.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de tests */}
      {testHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Historial de Tests
            </CardTitle>
            <CardDescription>
              Últimas 10 ejecuciones de tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testHistory.map((suite, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-500" />
                      <span className="font-medium">{suite.passed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="size-4 text-red-500" />
                      <span className="font-medium">{suite.failed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-yellow-500" />
                      <span className="font-medium">{suite.skipped}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {suite.totalDuration}ms
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas de calidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cobertura de Tests</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
                <p className="text-xs text-gray-500">Líneas cubiertas</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bugs Encontrados</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500">Críticos: 0</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Bug className="size-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Score</p>
                <p className="text-2xl font-bold text-gray-900">92</p>
                <p className="text-xs text-gray-500">Lighthouse</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Zap className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="size-12 mx-auto mb-4" />
              <p className="text-lg font-medium">{error}</p>
              <Button onClick={runTests} className="mt-4">
                <RefreshCw className="size-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
