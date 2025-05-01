import React from 'react';
import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { studentService } from '@/lib/services/studentService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { User, MapPin, Clock, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EditStudentDialog } from './EditStudentDialog';
import { DeleteStudentDialog } from './DeleteStudentDialog';

interface Student {
  student_id: string;
  status: string;
  user_profiles: {
    name: string;
    email: string;
  };
}

interface StudentsListProps {
  students: Student[];
  loading: boolean;
  onSelectStudent: (student: Student) => void;
  selectedStudent: Student | null;
  onStudentUpdated: () => void;
}

export function StudentsList({
  students,
  loading,
  onSelectStudent,
  selectedStudent,
  onStudentUpdated,
}: StudentsListProps) {
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = React.useState<Student | null>(null);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending_acceptance: {
        label: 'Aguardando Aceitação',
        variant: 'warning',
        color: 'text-yellow-600'
      },
      accepted: {
        label: 'Aceito',
        variant: 'success',
        color: 'text-green-600'
      },
      rejected: {
        label: 'Rejeitado',
        variant: 'destructive',
        color: 'text-red-600'
      }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: 'default',
      color: 'text-gray-600'
    };

    return (
      <Badge variant={statusInfo.variant as any} className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Estudantes Vinculados</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <User className="h-12 w-12 text-gray-400" />
          <div className="text-center">
            <h3 className="font-medium text-gray-900">Nenhum estudante vinculado</h3>
            <p className="text-gray-500 mt-1">
              Clique em "Adicionar Estudante" para começar
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">
        Estudantes Vinculados
        <span className="text-sm font-normal text-gray-500 ml-2">
          {students.length} estudante{students.length !== 1 ? 's' : ''}
        </span>
      </h2>

      {students.map((student) => (
        <Card
          key={student.student_id}
          className={`mb-4 cursor-pointer transition-colors ${
            selectedStudent?.student_id === student.student_id
              ? 'border-primary'
              : 'hover:border-primary/50'
          }`}
          onClick={() => onSelectStudent(student)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{student.user_profiles.name}</h3>
                <p className="text-sm text-gray-500">{student.user_profiles.email}</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    student.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {student.status === 'active' ? 'active' : 'inactive'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingStudent(student);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingStudent(student);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <EditStudentDialog
        student={editingStudent}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSuccess={() => {
          onStudentUpdated();
          setEditingStudent(null);
        }}
      />

      <DeleteStudentDialog
        student={deletingStudent}
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onSuccess={() => {
          onStudentUpdated();
          setDeletingStudent(null);
        }}
      />
    </div>
  );
} 