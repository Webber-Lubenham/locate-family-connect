
import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define form schema
const guardianFormSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().optional(),
  phone: z.string().optional(),
});

type GuardianFormValues = z.infer<typeof guardianFormSchema>;

interface AddGuardianFormProps {
  onSubmit: (values: GuardianFormValues) => Promise<void>;
}

const AddGuardianForm: React.FC<AddGuardianFormProps> = ({ onSubmit }) => {
  const form = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianFormSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
    },
  });

  const handleSubmit = async (values: GuardianFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Nome do responsável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="+55 11 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Adicionar
        </Button>
      </form>
    </Form>
  );
};

export default AddGuardianForm;
