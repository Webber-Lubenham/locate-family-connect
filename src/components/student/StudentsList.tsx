
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Edit2, Trash2, AlertCircle, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EditStudentDialog from "./EditStudentDialog";
import DeleteStudentDialog from "./DeleteStudentDialog";

export interface Student {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.client.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Fetch guardians table which contains student_id
      const { data: guardianRelations, error: relationsError } = await supabase.client
        .from('guardians')
        .select('student_id')
        .eq('guardian_id', user.id);
      
      if (relationsError) throw relationsError;
      
      if (!guardianRelations || guardianRelations.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      const studentIds = guardianRelations.map(relation => relation.student_id);
      
      // Fetch profiles of students
      const { data: studentProfiles, error: profilesError } = await supabase.client
        .from('profiles')
        .select('id, user_id, full_name, email, created_at')
        .in('user_id', studentIds);
      
      if (profilesError) throw profilesError;
      
      const formattedStudents = (studentProfiles || []).map(profile => ({
        id: profile.user_id || profile.id,
        name: profile.full_name || 'Sem nome',
        email: profile.email || 'Sem email',
        created_at: profile.created_at || ''
      }));
      
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
