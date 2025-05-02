
import React, { useState, useEffect } from 'react';
import { InviteStudentForm } from '../components/student/InviteStudentForm';
import { StudentsList } from '../components/student/StudentsList';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Student } from '@/types/auth';

export function AddStudent() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Breaking out the fetchStudents function to avoid deep type instantiation
  const fetchStudents = async () => {
    if (!supabase || !supabase.client) {
      console.error('Cliente Supabase não inicializado');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get current user - using type assertion to simplify
      const userResponse = await supabase.client.auth.getUser();
      const user = userResponse.data.user;
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Fetch guardians table which contains student_id
      const guardianResponse = await supabase.client
        .from('guardians')
        .select('student_id')
        .eq('guardian_id', user.id);
        
      const guardianRelations = guardianResponse.data;
      const relationsError = guardianResponse.error;
      
      if (relationsError) throw relationsError;
      
      if (!guardianRelations || guardianRelations.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      // Extract student IDs
      const studentIds: string[] = [];
      guardianRelations.forEach(relation => {
        if (relation.student_id) {
          studentIds.push(relation.student_id);
        }
      });
      
      // Fetch profiles of students
      const profilesResponse = await supabase.client
        .from('profiles')
        .select('id, user_id, full_name, email, created_at')
        .in('user_id', studentIds);
        
      const studentProfiles = profilesResponse.data;
      const profilesError = profilesResponse.error;
      
      if (profilesError) throw profilesError;
      
      // Explicitly create Student objects to avoid deep instantiation
      const formattedStudents: Student[] = [];
      
      if (studentProfiles) {
        for (let i = 0; i < studentProfiles.length; i++) {
          const profile = studentProfiles[i];
          const userId = profile.user_id || profile.id;
          formattedStudents.push({
            id: userId.toString(),
            name: profile.full_name || 'Sem nome',
            email: profile.email || 'Sem email',
            created_at: profile.created_at || new Date().toISOString()
          });
        }
      }
      
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentUpdated = () => {
    fetchStudents();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Gerenciar Estudantes</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Adicionar Novo Estudante</h2>
            <div className="bg-white shadow-md rounded-lg p-6">
              <InviteStudentForm onStudentAdded={handleStudentUpdated} />
            </div>
          </div>

          <div>
            <StudentsList 
              students={students}
              loading={loading}
              selectedStudent={selectedStudent}
              onSelectStudent={setSelectedStudent}
              onStudentUpdated={handleStudentUpdated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;
