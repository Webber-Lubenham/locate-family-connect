
import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import StudentsList from './StudentsList';
import { Student } from '@/types/auth';
import { studentService } from "@/lib/services/studentService";

interface StudentsListContainerProps {
  onSelectStudent?: (student: Student) => void;
  selectedStudent?: Student | null;
  onStudentUpdated?: () => void;
}

const StudentsListContainer = ({
  onSelectStudent,
  selectedStudent,
  onStudentUpdated
}: StudentsListContainerProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the service function to retrieve students instead of direct Supabase calls
      const students = await studentService.getStudentsForGuardian();
      setStudents(students);
    } catch (error: any) {
      setError('Não foi possível carregar a lista de estudantes.');
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível carregar a lista de estudantes."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentUpdated = () => {
    fetchStudents();
    if (onStudentUpdated) onStudentUpdated();
  };

  return (
    <StudentsList
      students={students}
      loading={loading}
      error={error}
      onSelectStudent={onSelectStudent}
      selectedStudent={selectedStudent}
      onStudentUpdated={handleStudentUpdated}
    />
  );
};

export default StudentsListContainer;
