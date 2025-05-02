
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Edit2, Trash2, AlertCircle, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EditStudentDialog from "./EditStudentDialog";
import DeleteStudentDialog from "./DeleteStudentDialog";
import { Student } from '@/types/auth';

export interface StudentsListProps {
  students?: Student[];
  loading?: boolean;
  onSelectStudent?: (student: Student) => void;
  selectedStudent?: Student | null;
  onStudentUpdated?: () => void;
}

export function StudentsList({
  students: externalStudents,
  loading: externalLoading,
  onSelectStudent,
  selectedStudent,
  onStudentUpdated
}: StudentsListProps = {}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const { toast } = useToast();

  // Carrega os estudantes se não foram fornecidos externamente
  useEffect(() => {
    if (externalStudents) {
      setStudents(externalStudents);
      setLoading(false);
      return;
    }
    
    fetchStudents();
  }, [externalStudents]);

  // Breaking out the fetchStudents function to avoid deep type instantiation
  const fetchStudents = async () => {
    if (!supabase || !supabase.client) {
      setError('Cliente Supabase não inicializado');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
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
        
      const guardianRelations = guardianResponse.data || [];
      const relationsError = guardianResponse.error;
      
      if (relationsError) throw relationsError;
      
      if (guardianRelations.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      // Extract student IDs
      const studentIds: string[] = [];
      for (let i = 0; i < guardianRelations.length; i++) {
        const relation = guardianRelations[i];
        if (relation.student_id) {
          studentIds.push(relation.student_id);
        }
      }
      
      if (studentIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      // Fetch profiles of students
      const profilesResponse = await supabase.client
        .from('profiles')
        .select('id, user_id, full_name, email, created_at')
        .in('user_id', studentIds);
        
      const studentProfiles = profilesResponse.data || [];
      const profilesError = profilesResponse.error;
      
      if (profilesError) throw profilesError;
      
      // Create student objects manually to avoid complex type transformations
      const formattedStudents: Student[] = [];
      
      for (let i = 0; i < studentProfiles.length; i++) {
        const profile = studentProfiles[i];
        const userId = profile.user_id || profile.id || '';
        formattedStudents.push({
          id: String(userId),
          name: profile.full_name || 'Sem nome',
          email: profile.email || 'Sem email',
          created_at: profile.created_at || new Date().toISOString()
        });
      }
      
      setStudents(formattedStudents);
    } catch (error: any) {
      console.error('Erro ao carregar estudantes:', error);
      setError('Não foi possível carregar a lista de estudantes.');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar a lista de estudantes."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (student: Student) => {
    setStudentToEdit(student);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToEdit(student);
    setIsDeleteDialogOpen(true);
  };

  const handleStudentUpdated = () => {
    fetchStudents();
    if (onStudentUpdated) onStudentUpdated();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Estudantes Vinculados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading || externalLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-gray-500">Nenhum estudante vinculado ainda.</p>
              <p className="text-sm text-gray-500">Use o formulário para adicionar estudantes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`
                    flex justify-between items-center p-3 rounded-md
                    ${selectedStudent?.id === student.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    ${onSelectStudent ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => onSelectStudent && onSelectStudent(student)}
                >
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(student);
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(student);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {studentToEdit && (
        <>
          <EditStudentDialog
            student={studentToEdit}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSave={handleStudentUpdated}
          />
          <DeleteStudentDialog
            student={studentToEdit}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onDelete={handleStudentUpdated}
          />
        </>
      )}
    </div>
  );
}

export default StudentsList;
