import React, { useState } from 'react';
import { InviteStudentForm } from '../components/student/InviteStudentForm';
import StudentsListContainer from '../components/student/StudentsListContainer';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Student } from '@/types/auth';

export function AddStudent() {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
              <InviteStudentForm />
            </div>
          </div>

          <div>
            <StudentsListContainer
              onSelectStudent={setSelectedStudent}
              selectedStudent={selectedStudent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;
