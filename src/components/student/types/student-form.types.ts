
import { z } from 'zod';

// Define the schema for form validation
export const studentFormSchema = z.object({
  email: z.string().email({
    message: "Por favor insira um email válido.",
  }),
  name: z.string().min(1, {
    message: "O nome é obrigatório.",
  }),
});

// Use z.infer to derive the type from the schema
export type StudentFormValues = z.infer<typeof studentFormSchema>;

// Define the common props interface
export interface StudentFormProps {
  onStudentAdded?: () => void;
}
