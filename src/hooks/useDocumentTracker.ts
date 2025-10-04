import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface DocumentItem {
  id: string;
  name: string;
  status: 'tracked' | 'completed' | 'pending' | 'overdue';
  dueDate: string;
  category: string;
}

export interface DocumentCategory {
  category: string;
  documents: DocumentItem[];
}

const defaultDocuments: DocumentCategory[] = [
  {
    category: "Visa Documents",
    documents: [
      { id: '1', name: "Passport", status: "tracked", dueDate: "N/A", category: "Visa Documents" },
      { id: '2', name: "I-20 Form", status: "tracked", dueDate: "N/A", category: "Visa Documents" },
      { id: '3', name: "DS-160 Application", status: "tracked", dueDate: "N/A", category: "Visa Documents" },
      { id: '4', name: "SEVIS Fee Receipt", status: "tracked", dueDate: "N/A", category: "Visa Documents" },
      { id: '5', name: "Financial Statements", status: "tracked", dueDate: "N/A", category: "Visa Documents" },
      { id: '6', name: "Visa Interview Appointment", status: "tracked", dueDate: "N/A", category: "Visa Documents" },
      { id: '7', name: "Embassy Medical Exam", status: "tracked", dueDate: "N/A", category: "Visa Documents" },
      { id: '8', name: "Visa Approval", status: "tracked", dueDate: "N/A", category: "Visa Documents" }
    ]
  },
  {
    category: "University Application",
    documents: [
      { id: '9', name: "Common Application", status: "tracked", dueDate: "N/A", category: "University Application" },
      { id: '10', name: "Academic Transcripts", status: "tracked", dueDate: "N/A", category: "University Application" },
      { id: '11', name: "Letters of Recommendation", status: "tracked", dueDate: "N/A", category: "University Application" },
      { id: '12', name: "Personal Statement", status: "tracked", dueDate: "N/A", category: "University Application" },
      { id: '13', name: "Application Fee Payment", status: "tracked", dueDate: "N/A", category: "University Application" },
      { id: '14', name: "Portfolio Submission", status: "tracked", dueDate: "N/A", category: "University Application" }
    ]
  },
  {
    category: "Financial Aid",
    documents: [
      { id: '15', name: "FAFSA Application", status: "tracked", dueDate: "N/A", category: "Financial Aid" },
      { id: '16', name: "CSS Profile", status: "tracked", dueDate: "N/A", category: "Financial Aid" },
      { id: '17', name: "Tax Returns", status: "tracked", dueDate: "N/A", category: "Financial Aid" },
      { id: '18', name: "Bank Statements", status: "tracked", dueDate: "N/A", category: "Financial Aid" },
      { id: '19', name: "Scholarship Applications", status: "tracked", dueDate: "N/A", category: "Financial Aid" }
    ]
  }
];

export const useDocumentTracker = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentCategory[]>(defaultDocuments);
  const [isLoading, setIsLoading] = useState(true);

  // Load document state from user profile or localStorage
  useEffect(() => {
    const loadDocumentState = async () => {
      if (!user) {
        // Load from localStorage for unauthenticated users
        const saved = localStorage.getItem('documentTracker');
        if (saved) {
          try {
            setDocuments(JSON.parse(saved));
          } catch (error) {
            console.error('Error parsing saved documents:', error);
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        // For authenticated users, we could extend profiles to store document state
        // For now, still use localStorage but tagged with user ID
        const saved = localStorage.getItem(`documentTracker_${user.id}`);
        if (saved) {
          setDocuments(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading document state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocumentState();
  }, [user]);

  // Save document state whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const storageKey = user ? `documentTracker_${user.id}` : 'documentTracker';
      localStorage.setItem(storageKey, JSON.stringify(documents));
    }
  }, [documents, user, isLoading]);

  const updateDocumentStatus = (documentId: string, status: DocumentItem['status']) => {
    setDocuments(prevCategories => 
      prevCategories.map(category => ({
        ...category,
        documents: category.documents.map(doc => 
          doc.id === documentId ? { ...doc, status } : doc
        )
      }))
    );
  };

  const getStats = () => {
    const allDocs = documents.flatMap(category => category.documents);
    const total = allDocs.length;
    const completed = allDocs.filter(doc => doc.status === 'completed').length;
    const pending = allDocs.filter(doc => doc.status === 'pending').length;
    const overdue = allDocs.filter(doc => doc.status === 'overdue').length;
    const tracked = allDocs.filter(doc => doc.status === 'tracked').length;

    return { total, completed, pending, overdue, tracked };
  };

  const getCategoryStats = (categoryName: string) => {
    const category = documents.find(cat => cat.category === categoryName);
    if (!category) return { total: 0, completed: 0, progress: 0 };

    const total = category.documents.length;
    const completed = category.documents.filter(doc => doc.status === 'completed').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, progress };
  };

  return {
    documents,
    updateDocumentStatus,
    getStats,
    getCategoryStats,
    isLoading
  };
};