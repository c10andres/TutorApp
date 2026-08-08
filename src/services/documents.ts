import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc,
  query, 
  orderBy, 
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../firebase';

export interface UniversityDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  fileURL: string;
  fileType: string;
  uploadedBy: string;
  uploaderName: string;
  createdAt: Date;
}

export const documentsService = {
  /**
   * Obtener todos los documentos
   */
  async getAllDocuments(): Promise<UniversityDocument[]> {
    try {
      const q = query(collection(db, 'universityDocs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const documents: UniversityDocument[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as UniversityDocument;
      });
      console.log(`✅ [getAllDocuments] Obtenidos ${documents.length} documentos`);
      return documents;
    } catch (error) {
      console.error('❌ [getAllDocuments] Error:', error);
      throw error;
    }
  },

  /**
   * Subir un nuevo documento
   */
  async uploadDocument(file: File, metadata: { title: string; description: string; category: string }): Promise<string> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      // 1. Subir archivo a Firebase Storage
      const fileRef = ref(storage, `universityDocs/${currentUser.uid}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(uploadResult.ref);

      // 2. Crear documento en Firestore
      const docData = {
        ...metadata,
        fileURL,
        fileType: file.type || 'unknown',
        uploadedBy: currentUser.uid,
        uploaderName: currentUser.displayName || 'Usuario',
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'universityDocs'), docData);
      console.log(`✅ [uploadDocument] Documento subido y registrado: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ [uploadDocument] Error:', error);
      throw error;
    }
  },

  /**
   * Eliminar un documento
   */
  async deleteDocument(docToDelete: UniversityDocument): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== docToDelete.uploadedBy) {
      throw new Error('No tienes permiso para eliminar este documento.');
    }

    try {
      // 1. Eliminar archivo de Storage
      const fileRef = ref(storage, docToDelete.fileURL);
      await deleteObject(fileRef);

      // 2. Eliminar documento de Firestore
      const docRef = doc(db, 'universityDocs', docToDelete.id);
      await deleteDoc(docRef);

      console.log(`✅ [deleteDocument] Documento eliminado: ${docToDelete.id}`);
    } catch (error) {
      console.error('❌ [deleteDocument] Error:', error);
      throw error;
    }
  },
};