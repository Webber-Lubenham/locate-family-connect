
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, AlertCircle, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EditStudentDialog from "./EditStudentDialog";
import DeleteStudentDialog from "./DeleteStudentDialog";
import { Student } from '@/types/auth';

export interface StudentsListProps {
  students: Student[];
  loading: boolean;
  error?: string | null;
  onSelectStudent?: (student: Student) => void;
  selectedStudent?: Student | null;
  onStudentUpdated?: () => void;
}

const StudentsList = ({
  students,
  loading,
  error,
  onSelectStudent,
  selectedStudent,
  onStudentUpdated
}: StudentsListProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const handleEditClick = (student: Student) => {
    setStudentToEdit({...student});
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToEdit({...student});
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Estudantes Vinculados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
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
            onSave={onStudentUpdated}
          />
          <DeleteStudentDialog
            student={studentToEdit}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onDelete={onStudentUpdated}
          />
        </>
      )}
    </div>
  );
};

export default StudentsList;
