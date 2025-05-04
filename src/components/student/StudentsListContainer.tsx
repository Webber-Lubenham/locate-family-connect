
import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import StudentsList from './StudentsList';
import { Student } from '@/types/auth';

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
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;
      if (!user) throw new Error("Usuário não autenticado");

      // Fetch student IDs linked to the guardian
      const { data: guardianData, error: guardianError } = await supabase
        .from('guardians')
        .select('student_id')
        .eq('guardian_id', user.id);

      if (guardianError) throw guardianError;

      // Extract student IDs
      const studentIds: string[] = [];
      if (guardianData && guardianData.length > 0) {
        guardianData.forEach(item => {
          if (item && item.student_id) {
            studentIds.push(String(item.student_id));
          }
        });
      }
      
      if (studentIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Fetch student profile information
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, created_at')
        .in('user_id', studentIds);

      if (profilesError) throw profilesError;

      // Format data as Student objects - avoid circular reference by using explicit typing
      const formattedStudents: Student[] = [];
      
      if (profilesData) {
        for (const profile of profilesData) {
          formattedStudents.push({
            id: String(profile.user_id || profile.id || ''),
            name: profile.full_name || 'Sem nome',
            email: profile.email || 'Sem email',
            created_at: profile.created_at || new Date().toISOString()
          });
        }
      }
      
      setStudents(formattedStudents);
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
