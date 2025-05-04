
import React from 'react';
import { StudentFormProps, StudentFormValues } from './types/student-form.types';
import { useInviteStudent } from './hooks/useInviteStudent';
import { StudentForm } from './form/StudentForm';

export function InviteStudentForm({ onStudentAdded }: StudentFormProps) {
  const { isLoading, error, success, handleInviteStudent } = useInviteStudent(onStudentAdded);

  const onSubmit = async (data: StudentFormValues) => {
    await handleInviteStudent(data);
  };

  return (
    <StudentForm
      isLoading={isLoading}
      error={error}
      success={success}
      onSubmit={onSubmit}
    />
  );
}

export default InviteStudentForm;
