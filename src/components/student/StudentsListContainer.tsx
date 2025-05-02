
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
  const [loading, setLoading] = useState(true);
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
      const userResponse = await supabase.client.auth.getUser();
      const user = userResponse.data.user;
      if (!user) throw new Error("Usuário não autenticado");

      const guardianResponse = await supabase.client
        .from('guardians')
        .select('student_id')
        .eq('guardian_id', user.id);

      if (guardianResponse.error) throw guardianResponse.error;

      // Extract student IDs
      const studentIds: string[] = [];
      if (guardianResponse.data && guardianResponse.data.length > 0) {
        for (let i = 0; i < guardianResponse.data.length; i++) {
          const item = guardianResponse.data[i];
          if (item && item.student_id) {
            studentIds.push(item.student_id);
          }
        }
      }
      
      if (studentIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const profilesResponse = await supabase.client
        .from('profiles')
        .select('id, user_id, full_name, email, created_at')
        .in('user_id', studentIds);

      if (profilesResponse.error) throw profilesResponse.error;

      // Convert data to Student objects explicitly
      const formattedStudents: Student[] = [];
      if (profilesResponse.data && profilesResponse.data.length > 0) {
        for (let i = 0; i < profilesResponse.data.length; i++) {
          const profile = profilesResponse.data[i];
          if (profile) {
            formattedStudents.push({
              id: String(profile.user_id || profile.id || ''),
              name: profile.full_name || 'Sem nome',
              email: profile.email || 'Sem email',
              created_at: profile.created_at || new Date().toISOString()
            });
          }
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
