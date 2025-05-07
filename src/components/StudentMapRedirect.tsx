import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

/**
 * Componente de redirecionamento para manter compatibilidade com URLs antigas
 * Redireciona de /student-map/:id para /guardian/student-map/:id
 */
const StudentMapRedirect: React.FC = () => {
  // Obtém o parâmetro de ID da URL atual
  const { id } = useParams<{ id: string }>();
  
  // Constrói o caminho de destino com o mesmo ID
  const targetPath = `/guardian/student-map/${id}`;
  
  // Log para diagnóstico
  console.log(`[Navigation] Redirecting from old student map path to: ${targetPath}`);
  
  // Retorna um componente de redirecionamento
  return <Navigate to={targetPath} replace />;
};

export default StudentMapRedirect;
