
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { apiService } from '@/lib/api/api-service';

interface StudentDetails {
  name: string;
  email: string;
}

export function useStudentDetails(studentId: string | null, userEmail?: string) {
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    async function fetchStudentDetails() {
      try {
        // Try to get student details from API service
        const response = await apiService.getStudentDetails(studentId);
        
        if (response.success && response.data) {
          setStudentDetails({
            name: response.data.full_name || 'Estudante',
            email: response.data.email || ''
          });
        } else {
          // If API service didn't find details, fallback to location data
          if (userEmail) {
            const { data: locData } = await supabase.client.rpc(
              'get_student_locations', 
              { p_guardian_email: userEmail, p_student_id: studentId }
            );
            
            if (locData && locData.length > 0) {
              const studentData = locData[0];
              
              // Extract student details from location data
              if (studentData.student_name || studentData.student_email) {
                setStudentDetails({
                  name: studentData.student_name || 'Estudante',
                  email: studentData.student_email || ''
                });
                return;
              }
            }
            
            // If we still don't have details, use default values
            setStudentDetails({
              name: 'Estudante',
              email: ''
            });
          } else {
            // Set default values if no userEmail provided
            setStudentDetails({
              name: 'Estudante',
              email: ''
            });
          }
        }
      } catch (err) {
        console.error('[DEBUG] Exception in fetchStudentDetails:', err);
        // Set a default name if we couldn't fetch the details
        setStudentDetails({
          name: 'Estudante',
          email: ''
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudentDetails();
  }, [studentId, userEmail]);

  return { studentDetails, loading };
}
