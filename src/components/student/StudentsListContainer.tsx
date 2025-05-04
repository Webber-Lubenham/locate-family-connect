
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import StudentsList from './StudentsList';
import { Student } from '@/types/auth';
import { studentProfileService } from "@/lib/services/student/StudentProfileService";

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
      console.log('Fetching students for guardian...');
      const students = await studentProfileService.getStudentsForGuardian();
      console.log('Students found:', students);
      setStudents(students || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
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
