import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from '@/contexts/UnifiedAuthContext';
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DiagnosticTool = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Função para navegar de volta ao dashboard
  const goBackToDashboard = () => {
    const userType = user?.user_metadata?.user_type || 'student';
    if (userType === 'parent') {
      navigate('/parent-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  const checkRelationship = async () => {
    if (!user?.email) {
      setErrorMsg("Você precisa estar logado para usar esta ferramenta");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setResults([]);

    try {
      // Log do email do responsável
      console.log(`Verificando relações para o responsável: ${user.email}`);
      addResult("info", `Responsável: ${user.email}`);

      // 1. Verificar guardians com o email do responsável
      const { data: guardiansData, error: guardiansError } = await supabase.client
        .from("guardians")
        .select("*")
        .eq("email", user.email);

      if (guardiansError) {
        console.error("Erro ao consultar guardians:", guardiansError);
        addResult("error", `Erro ao consultar guardians: ${guardiansError.message}`);
        setLoading(false);
        return;
      }

      if (!guardiansData || guardiansData.length === 0) {
        addResult("warning", `Nenhum registro encontrado na tabela guardians para o email ${user.email}`);
      } else {
        addResult("success", `Encontrados ${guardiansData.length} registros para o email ${user.email} na tabela guardians`);
        
        // Detalhar cada registro
        guardiansData.forEach((guardian, index) => {
          addResult("info", `Guardian ${index+1}: ID=${guardian.id}, student_id=${guardian.student_id}`);
        });
        
        // Extrair IDs dos estudantes
        const studentIds = guardiansData.map(g => g.student_id);
        
        // 2. Buscar perfis dos estudantes
        const { data: profilesData, error: profilesError } = await supabase.client
          .from("profiles")
          .select("*")
          .in("user_id", studentIds as string[]);
          
        if (profilesError) {
          console.error("Erro ao consultar profiles:", profilesError);
          addResult("error", `Erro ao consultar profiles: ${profilesError.message}`);
        } else if (!profilesData || profilesData.length === 0) {
          addResult("warning", "Nenhum perfil encontrado para os estudantes vinculados");
        } else {
          addResult("success", `Encontrados ${profilesData.length} perfis de estudantes`);
          
          // Detalhar cada perfil
          profilesData.forEach((profile, index) => {
            addResult("info", `Perfil ${index+1}: ID=${profile.id}, user_id=${profile.user_id}, full_name=${profile.full_name}`);
          });
        }
      }
      
      // 3. Se um email de estudante específico foi fornecido
      if (studentEmail) {
        addResult("info", `Verificando estudante específico: ${studentEmail}`);
        
        // Buscar o estudante pelo email
        const { data: userData, error: userError } = await supabase.client
          .from("users")
          .select("id, email")
          .eq("email", studentEmail)
          .single();
          
        if (userError) {
          addResult("warning", `Usuário com email ${studentEmail} não encontrado`);
        } else {
          addResult("success", `Usuário encontrado: ${studentEmail} (ID: ${userData.id})`);
          
          // Verificar se existe relação com o pai
          const { data: relationData, error: relationError } = await supabase.client
            .from("guardians")
            .select("*")
            .eq("student_id", String(userData.id))
            .eq("email", user.email);
            
          if (relationError) {
            addResult("error", `Erro ao verificar relação: ${relationError.message}`);
          } else if (!relationData || relationData.length === 0) {
            addResult("warning", `Nenhuma relação encontrada entre ${studentEmail} e ${user.email}`);
          } else {
            addResult("success", `Relação encontrada! O estudante ${studentEmail} está vinculado ao responsável ${user.email}`);
          }
        }
      }
      
      // 4. Validar estrutura das tabelas (limitado a 1 registro)
      addResult("info", "Verificando estrutura das tabelas...");
      
      const { data: guardianSample } = await supabase.client
        .from("guardians")
        .select("*")
        .limit(1);
        
      if (guardianSample && guardianSample.length > 0) {
        addResult("info", `Estrutura da tabela guardians: ${JSON.stringify(guardianSample[0])}`);
      }
      
      const { data: profileSample } = await supabase.client
        .from("profiles")
        .select("*")
        .limit(1);
        
      if (profileSample && profileSample.length > 0) {
        addResult("info", `Estrutura da tabela profiles: ${JSON.stringify(profileSample[0])}`);
      }

    } catch (error: any) {
      console.error("Erro geral:", error);
      setErrorMsg(error.message || "Ocorreu um erro ao verificar as relações");
    } finally {
      setLoading(false);
    }
  };

  const addResult = (type: "info" | "success" | "warning" | "error", message: string) => {
    setResults(prev => [...prev, { type, message }]);
  };

  const addManualRelationship = async () => {
    if (!user?.email || !studentEmail) {
      setErrorMsg("Email do responsável e do estudante são necessários");
      return;
    }

    setLoading(true);
    try {
      // 1. Buscar o ID do estudante
      const { data: userData, error: userError } = await supabase.client
        .from("users")
        .select("id")
        .eq("email", studentEmail)
        .single();

      if (userError) {
        throw new Error(`Estudante com email ${studentEmail} não encontrado`);
      }

      // 2. Verificar se a relação já existe
      const { data: existingRelation, error: relationCheckError } = await supabase.client
        .from("guardians")
        .select("id")
        .eq("student_id", String(userData.id))
        .eq("email", user.email);

      if (!relationCheckError && existingRelation && existingRelation.length > 0) {
        addResult("warning", "Esta relação já existe no banco de dados");
        return;
      }

      // 3. Criar a relação
      const { data, error } = await supabase.client
        .from("guardians")
        .insert([
          {
            student_id: String(userData.id),
            email: user.email,
            is_active: true,
            full_name: user.user_metadata?.full_name || "Responsável",
          }
        ]);

      if (error) {
        throw new Error(`Erro ao criar relação: ${error.message}`);
      }

      addResult("success", `Relação criada com sucesso entre ${studentEmail} e ${user.email}`);
      
      // Atualizar a lista de relações
      checkRelationship();
    } catch (error: any) {
      console.error("Erro ao adicionar relação:", error);
      addResult("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Botão de voltar */}
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goBackToDashboard} 
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <h1 className="text-3xl font-bold">Ferramenta de Diagnóstico</h1>
      <p className="text-muted-foreground">
        Verifique e gerencie relações entre responsáveis e estudantes
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Verificar Relações</CardTitle>
          <CardDescription>
            Verifique as relações do usuário atual com estudantes no banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Email do estudante (opcional)" 
                value={studentEmail} 
                onChange={(e) => setStudentEmail(e.target.value)}
              />
              <Button onClick={checkRelationship} disabled={loading}>
                {loading ? "Verificando..." : "Verificar"}
              </Button>
              {studentEmail && (
                <Button variant="outline" onClick={addManualRelationship} disabled={loading}>
                  Adicionar Relação
                </Button>
              )}
            </div>

            {errorMsg && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 mt-4">
              {results.map((result, index) => (
                <div key={index} className={`p-3 rounded-md text-sm ${
                  result.type === "success" ? "bg-green-50 text-green-700" :
                  result.type === "error" ? "bg-red-50 text-red-700" :
                  result.type === "warning" ? "bg-amber-50 text-amber-700" :
                  "bg-blue-50 text-blue-700"
                }`}>
                  {result.type === "success" && <CheckCircle className="inline-block h-4 w-4 mr-2" />}
                  {result.type === "error" && <AlertCircle className="inline-block h-4 w-4 mr-2" />}
                  {result.message}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            Usuário logado: {user?.email || "Nenhum"}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DiagnosticTool;
