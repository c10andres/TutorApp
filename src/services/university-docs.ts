import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  where,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  getMetadata
} from 'firebase/storage';
import { db, storage, auth } from '../firebase';

export interface FirebaseDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'alta' | 'media' | 'baja';
  status: 'vigente' | 'derogado' | 'en_revision';
  publishDate: Date;
  lastModified: Date;
  fileUrl: string;
  fileSize: number;
  tags: string[];
  downloadCount: number;
  version: string;
  author: string;
  department: string;
  storagePath: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export const universityDocsService = {
  /**
   * Obtener todos los documentos (desde Firebase o carpeta local)
   */
  async getAllDocuments(): Promise<FirebaseDocument[]> {
    // Siempre intentar cargar desde carpeta local primero (más confiable)
    console.log('📁 [getAllDocuments] Cargando documentos desde carpeta local...');
    const localDocs = await this.getLocalDocuments();
    
    if (localDocs.length > 0) {
      console.log(`✅ [getAllDocuments] Se cargaron ${localDocs.length} documentos desde carpeta local`);
      return localDocs;
    }
    
    // Si no hay documentos locales, intentar desde Firebase
    try {
      console.log('📚 [getAllDocuments] No hay documentos locales, intentando desde Firebase...');
      
      // Verificar autenticación
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('⚠️ [getAllDocuments] Usuario no autenticado, retornando array vacío');
        return [];
      }
      console.log('✅ [getAllDocuments] Usuario autenticado:', currentUser.uid);
      
      // Primero intentar sin orderBy para evitar problemas de índices
      let q;
      try {
        q = query(collection(db, 'universityDocs'), orderBy('publishDate', 'desc'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.log('📄 [getAllDocuments] No hay documentos en Firebase');
          return [];
        }
        
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          publishDate: doc.data().publishDate?.toDate() || new Date(),
          lastModified: doc.data().lastModified?.toDate() || new Date(),
          uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
        } as FirebaseDocument));
        
        console.log(`✅ [getAllDocuments] Se obtuvieron ${documents.length} documentos desde Firebase`);
        return documents;
      } catch (orderByError: any) {
        // Si falla por índice, intentar sin orderBy
        if (orderByError.code === 'failed-precondition' || orderByError.message?.includes('index')) {
          console.log('⚠️ [getAllDocuments] Error de índice, intentando sin orderBy...');
          const snapshot = await getDocs(collection(db, 'universityDocs'));
          
          if (snapshot.empty) {
            console.log('📄 [getAllDocuments] No hay documentos en Firebase');
            return [];
          }
          
          const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            publishDate: doc.data().publishDate?.toDate() || new Date(),
            lastModified: doc.data().lastModified?.toDate() || new Date(),
            uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
          } as FirebaseDocument));
          
          // Ordenar manualmente
          documents.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
          
          console.log(`✅ [getAllDocuments] Se obtuvieron ${documents.length} documentos desde Firebase (sin índice)`);
          return documents;
        }
        throw orderByError;
      }
    } catch (error: any) {
      console.error('❌ [getAllDocuments] Error obteniendo documentos de Firebase:', error);
      console.log('📁 [getAllDocuments] Retornando documentos locales o array vacío');
      return localDocs;
    }
  },

  /**
   * Obtener documentos desde la carpeta local
   */
  async getLocalDocuments(): Promise<FirebaseDocument[]> {
    try {
      console.log('📁 [getLocalDocuments] Cargando documentos desde /documents/metadata.json...');
      
      // Cargar metadata desde la carpeta public
      // Intentar diferentes rutas por si hay problemas de configuración
      let response: Response | null = null;
      const possiblePaths = [
        '/documents/metadata.json',
        './documents/metadata.json',
        'documents/metadata.json'
      ];
      
      for (const path of possiblePaths) {
        try {
          response = await fetch(path);
          if (response.ok) {
            console.log(`✅ [getLocalDocuments] Encontrado metadata.json en: ${path}`);
            break;
          }
        } catch (e) {
          console.log(`⚠️ [getLocalDocuments] No se encontró en: ${path}`);
        }
      }
      
      if (!response || !response.ok) {
        console.log('⚠️ [getLocalDocuments] No se encontró metadata.json en ninguna ruta');
        return [];
      }
      
      const metadata = await response.json();
      console.log(`📄 [getLocalDocuments] Metadata cargado: ${metadata.length} documentos`);
      
      // Convertir a formato FirebaseDocument
      const documents: FirebaseDocument[] = metadata.map((doc: any) => {
        const document: FirebaseDocument = {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          category: doc.category,
          priority: doc.priority,
          status: doc.status,
          publishDate: new Date(doc.publishDate),
          lastModified: new Date(doc.lastModified),
          fileUrl: `/documents/${doc.fileName}`,
          fileSize: doc.fileSize,
          tags: doc.tags || [],
          downloadCount: doc.downloadCount || 0,
          version: doc.version,
          author: doc.author,
          department: doc.department,
          storagePath: `local/${doc.fileName}`,
          fileName: doc.fileName,
          uploadedBy: doc.author || 'Sistema',
          uploadedAt: new Date(doc.lastModified)
        };
        
        console.log(`  ✓ ${doc.title} -> ${doc.fileName}`);
        return document;
      });
      
      // Ordenar por fecha de publicación
      documents.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
      
      console.log(`✅ [getLocalDocuments] Se cargaron ${documents.length} documentos desde carpeta local`);
      return documents;
    } catch (error) {
      console.error('❌ [getLocalDocuments] Error cargando documentos locales:', error);
      console.error('❌ [getLocalDocuments] Detalles del error:', error);
      return [];
    }
  },

  /**
   * Obtener un documento por ID
   */
  async getDocumentById(id: string): Promise<FirebaseDocument | null> {
    const docRef = doc(db, 'universityDocs', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
      publishDate: docSnap.data().publishDate?.toDate() || new Date(),
      lastModified: docSnap.data().lastModified?.toDate() || new Date(),
      uploadedAt: docSnap.data().uploadedAt?.toDate() || new Date(),
    } as FirebaseDocument;
  },

  /**
   * Subir un documento
   */
  async uploadDocument(
    file: File,
    userId: string,
    metadata: Omit<FirebaseDocument, 'id' | 'fileUrl' | 'fileSize' | 'storagePath' | 'fileName' | 'uploadedAt' | 'publishDate' | 'lastModified' | 'downloadCount'>
  ): Promise<string> {
    try {
      console.log('📤 [uploadDocument] Iniciando subida...');
      console.log('📄 [uploadDocument] Archivo:', file.name, 'Tipo:', file.type, 'Tamaño:', file.size);
      console.log('👤 [uploadDocument] User ID:', userId);
      
      // Subir archivo a Firebase Storage
      // Usar el path correcto según las reglas: university_documents/{userId}/{fileName}
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const storagePath = `university_documents/${userId}/${fileName}`;
      const storageRef = ref(storage, storagePath);
      
      console.log('📁 [uploadDocument] Storage path:', storagePath);
      
      // Determinar contentType - si no está disponible, inferirlo de la extensión
      let contentType = file.type;
      if (!contentType || contentType === '') {
        const extension = file.name.toLowerCase().split('.').pop();
        const mimeTypes: Record<string, string> = {
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'txt': 'text/plain'
        };
        contentType = mimeTypes[extension || ''] || 'application/octet-stream';
        console.log('📝 [uploadDocument] Tipo MIME inferido de extensión:', contentType);
      }
      
      // Subir con metadata del tipo de contenido
      console.log('⬆️ [uploadDocument] Subiendo bytes a Storage...');
      console.log('📄 [uploadDocument] ContentType final:', contentType);
      await uploadBytes(storageRef, file, {
        contentType: contentType
      });
      console.log('✅ [uploadDocument] Archivo subido a Storage');
      
      console.log('🔗 [uploadDocument] Obteniendo URL de descarga...');
      const fileUrl = await getDownloadURL(storageRef);
      console.log('✅ [uploadDocument] URL obtenida:', fileUrl);

      // Guardar metadata en Firestore
      console.log('💾 [uploadDocument] Guardando metadata en Firestore...');
      const docRef = await addDoc(collection(db, 'universityDocs'), {
        ...metadata,
        fileUrl,
        fileSize: file.size,
        storagePath,
        fileName: file.name,
        uploadedBy: userId,
        downloadCount: 0,
        publishDate: Timestamp.now(),
        lastModified: Timestamp.now(),
        uploadedAt: Timestamp.now(),
      });

      console.log('✅ [uploadDocument] Documento guardado en Firestore. ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('❌ [uploadDocument] Error completo:', error);
      console.error('❌ [uploadDocument] Error code:', error.code);
      console.error('❌ [uploadDocument] Error message:', error.message);
      console.error('❌ [uploadDocument] Error stack:', error.stack);
      throw error;
    }
  },

  /**
   * Incrementar contador de descargas
   */
  async incrementDownloadCount(id: string): Promise<void> {
    const docRef = doc(db, 'universityDocs', id);
    const docSnap = await getDoc(docRef);
    const currentCount = docSnap.data()?.downloadCount || 0;
    await updateDoc(docRef, { 
      downloadCount: currentCount + 1,
      lastModified: Timestamp.now()
    });
  },

  /**
   * Descargar documento
   */
  async downloadDocument(document: FirebaseDocument): Promise<void> {
    try {
      // Incrementar contador (solo si está en Firebase)
      if (!document.storagePath?.startsWith('local/')) {
        try {
          await this.incrementDownloadCount(document.id);
        } catch (e) {
          console.log('⚠️ No se pudo incrementar contador (documento local)');
        }
      }
      
      // Obtener URL de descarga
      let url: string;
      if (document.storagePath?.startsWith('local/')) {
        // Documento local - usar fileUrl directamente
        url = document.fileUrl;
      } else if (document.storagePath) {
        // Si tiene storagePath de Firebase, usar Firebase Storage
        try {
          const fileRef = ref(storage, document.storagePath);
          url = await getDownloadURL(fileRef);
        } catch (error) {
          // Si falla Firebase Storage, usar fileUrl como fallback
          console.log('⚠️ Error con Firebase Storage, usando URL local');
          url = document.fileUrl;
        }
      } else if (document.fileUrl) {
        // Si solo tiene fileUrl, usarlo directamente
        url = document.fileUrl;
      } else {
        throw new Error('El documento no tiene una URL de descarga válida');
      }
      
      // Crear link de descarga
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName || 'documento.pdf';
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Error descargando documento:', error);
      throw error;
    }
  },

  /**
   * Eliminar documento
   */
  async deleteDocument(id: string, storagePath: string): Promise<void> {
    try {
      // Eliminar archivo de Storage
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);

      // Eliminar documento de Firestore
      await deleteDoc(doc(db, 'universityDocs', id));
    } catch (error) {
      console.error('Error eliminando documento:', error);
      throw error;
    }
  },

  /**
   * Actualizar metadata de documento
   */
  async updateDocumentMetadata(
    id: string, 
    metadata: Partial<Omit<FirebaseDocument, 'id' | 'fileUrl' | 'fileSize' | 'storagePath'>>
  ): Promise<void> {
    const docRef = doc(db, 'universityDocs', id);
    await updateDoc(docRef, {
      ...metadata,
      lastModified: Timestamp.now(),
    });
  },

  /**
   * Buscar documentos por categoría
   */
  async getDocumentsByCategory(category: string): Promise<FirebaseDocument[]> {
    const q = query(
      collection(db, 'universityDocs'),
      where('category', '==', category),
      orderBy('publishDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      publishDate: doc.data().publishDate?.toDate() || new Date(),
      lastModified: doc.data().lastModified?.toDate() || new Date(),
      uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
    } as FirebaseDocument));
  },

  /**
   * Buscar documentos por estado
   */
  async getDocumentsByStatus(status: string): Promise<FirebaseDocument[]> {
    const q = query(
      collection(db, 'universityDocs'),
      where('status', '==', status),
      orderBy('publishDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      publishDate: doc.data().publishDate?.toDate() || new Date(),
      lastModified: doc.data().lastModified?.toDate() || new Date(),
      uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
    } as FirebaseDocument));
  },

  /**
   * Obtener URL de descarga directa
   */
  async getDownloadURL(storagePath: string): Promise<string> {
    const fileRef = ref(storage, storagePath);
    return await getDownloadURL(fileRef);
  }
};