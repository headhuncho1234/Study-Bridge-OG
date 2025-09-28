import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface VisaTask {
  id: string;
  title: string;
  items: string[];
  completed: boolean[];
}

const defaultVisaTasks: VisaTask[] = [
  {
    id: '1',
    title: "Document Preparation",
    items: ["I-20 Form", "Passport", "Financial Statements", "Academic Transcripts"],
    completed: [false, false, false, false]
  },
  {
    id: '2',
    title: "DS-160 Application", 
    items: ["Personal Information", "Travel Plans", "Background Questions", "Photo Upload"],
    completed: [false, false, false, false]
  },
  {
    id: '3',
    title: "Fee Payment & Scheduling",
    items: ["SEVIS Fee", "Visa Application Fee", "Embassy Appointment", "Document Review"],
    completed: [false, false, false, false]
  },
  {
    id: '4',
    title: "Interview Preparation",
    items: ["Common Questions", "Practice Sessions", "Mock Interviews", "Success Tips"],
    completed: [false, false, false, false]
  }
];

export function useVisaTracker() {
  const [visaTasks, setVisaTasks] = useLocalStorage<VisaTask[]>('visa-tracker', defaultVisaTasks);

  const updateTaskCompletion = (taskId: string, itemIndex: number, completed: boolean) => {
    setVisaTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              completed: task.completed.map((item, index) => 
                index === itemIndex ? completed : item
              )
            }
          : task
      )
    );
  };

  const getTaskProgress = (taskId: string) => {
    const task = visaTasks.find(t => t.id === taskId);
    if (!task) return 0;
    const completedCount = task.completed.filter(Boolean).length;
    return Math.round((completedCount / task.items.length) * 100);
  };

  const getOverallProgress = () => {
    const totalItems = visaTasks.reduce((sum, task) => sum + task.items.length, 0);
    const completedItems = visaTasks.reduce((sum, task) => 
      sum + task.completed.filter(Boolean).length, 0);
    return Math.round((completedItems / totalItems) * 100);
  };

  return {
    visaTasks,
    updateTaskCompletion,
    getTaskProgress,
    getOverallProgress
  };
}