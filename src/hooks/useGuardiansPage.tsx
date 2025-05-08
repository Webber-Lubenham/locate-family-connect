
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";

interface Guardian {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export function useGuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddGuardian, setShowAddGuardian] = useState(false);
  const { toast } = useToast();
  const { user } = useUnifiedAuth();

  // Fetch guardians for the current student
  const fetchGuardians = async () => {
    if (!user?.id) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("guardians")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar responsáveis:", error);
        setError("Não foi possível carregar seus responsáveis");
        return;
      }

      setGuardians(data || []);
    } catch (err) {
      console.error("Erro ao processar dados:", err);
      setError("Ocorreu um erro ao processar os dados dos responsáveis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchGuardians();
    }
  }, [user?.id]);

  // Add a new guardian
  const addGuardian = async (
    email: string, 
    fullName: string, 
    phone: string
  ) => {
    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }

    // Validate email
    if (!email || !email.includes("@")) {
      throw new Error("Email do responsável é obrigatório e deve ser válido");
    }

    // Check if guardian already exists
    const { data: existingGuardian } = await supabase
      .from("guardians")
      .select("id")
      .eq("student_id", user.id)
      .eq("email", email);
    
    if (existingGuardian && existingGuardian.length > 0) {
      throw new Error("Este responsável já está vinculado à sua conta");
    }
    
    // Add the new guardian
    const { error } = await supabase
      .from("guardians")
      .insert([
        {
          student_id: user.id,
          email: email,
          full_name: fullName || null,
          phone: phone || null,
          is_active: true
        }
      ]);

    if (error) {
      console.error("Erro ao adicionar responsável:", error);
      throw new Error(error.message || "Erro ao adicionar responsável");
    }

    // Close the modal and refresh the list
    setShowAddGuardian(false);
    fetchGuardians();
    
    toast({
      title: "Responsável adicionado com sucesso",
      description: "O responsável foi vinculado à sua conta",
    });
  };

  // Remove a guardian
  const removeGuardian = async (guardianId: string) => {
    if (!user?.id) {
      return;
    }

    try {
      const { error } = await supabase
        .from("guardians")
        .delete()
        .eq("id", guardianId)
        .eq("student_id", user.id);

      if (error) {
        console.error("Erro ao remover responsável:", error);
        toast({
          title: "Erro ao remover responsável",
          description: error.message || "Não foi possível remover o responsável",
          variant: "destructive",
        });
        return;
      }

      fetchGuardians();
      
      toast({
        title: "Responsável removido",
        description: "O responsável foi desvinculado da sua conta",
      });
    } catch (err: any) {
      console.error("Erro ao remover responsável:", err);
      toast({
        title: "Erro ao remover responsável",
        description: err.message || "Ocorreu um erro ao remover o responsável",
        variant: "destructive",
      });
    }
  };

  // Send invite email to guardian
  const sendInviteEmail = async (guardianEmail: string, guardianName: string | null) => {
    if (!user?.id) {
      return;
    }

    try {
      const recipientName = guardianName || "Responsável";
      const studentName = user.user_metadata?.full_name || "Estudante";
      
      // URL for registration
      const registrationUrl = `${window.location.origin}/register`;
      
      // Call API to send email
      const { error } = await supabase.functions.invoke("invite-guardian", {
        body: {
          to: guardianEmail,
          subject: `Convite para acompanhar ${studentName} no EduConnect`,
          recipientName,
          studentName,
          registrationUrl
        }
      });

      if (error) {
        console.error("Erro ao enviar convite:", error);
        toast({
          title: "Erro ao enviar convite",
          description: "Não foi possível enviar o email de convite",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Convite enviado",
        description: `Um email de convite foi enviado para ${guardianEmail}`,
      });
    } catch (err: any) {
      console.error("Erro ao enviar convite:", err);
      toast({
        title: "Erro ao enviar convite",
        description: err.message || "Ocorreu um erro ao enviar o convite",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    guardians,
    loading,
    error,
    showAddGuardian,
    setShowAddGuardian,
    fetchGuardians,
    addGuardian,
    removeGuardian,
    sendInviteEmail,
  };
}
