
import { BaseService } from '../base/BaseService';
import { Student } from '@/types/auth';
import { studentRepository } from './StudentRepository';
import { extractUniqueStudentIds } from './utils/studentUtils';

/**
 * Service responsible for managing student profile data
 */
export class StudentProfileService extends BaseService {
  /**
   * Fetch students for the current guardian
   */
  async getStudentsForGuardian(): Promise<Student[]> {
    try {
      console.log('[StudentProfileService] Starting student fetch for guardian');
      // Get current user
      const user = await this.getCurrentUser();
      console.log('[StudentProfileService] Authenticated user:', user.id, user.email);
      
      try {
        // First attempt: Try to use the RPC function
        const { data, error } = await this.supabase.rpc('get_guardian_students');
        
        if (error) {
          console.warn('[StudentProfileService] RPC error:', error);
          // Let it continue to fallback
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log('[StudentProfileService] Found students via RPC:', data.length);
          // Convert to Student type
          const students: Student[] = data.map((item: any) => ({
            id: item.student_id,
            name: item.student_name || '',
            email: item.student_email || '',
            created_at: '',
            status: 'active',
            avatar_url: null,
            phone: null,
          }));
          return students;
        }
      } catch (rpcError) {
        console.error('[StudentProfileService] RPC method failed, using fallback:', rpcError);
        // Continue to fallback
      }
      
      // Fallback: Query the guardians table directly
      console.log('[StudentProfileService] Using fallback method to fetch students');
      const { data: guardiansData, error: guardiansError } = await this.supabase
        .from('guardians')
        .select('student_id')
        .eq('email', user.email)
        .eq('is_active', true);
        
      if (guardiansError) {
        throw guardiansError;
      }
      
      if (!guardiansData || guardiansData.length === 0) {
        console.log('[StudentProfileService] No guardian relationships found');
        return [];
      }
      
      // Extract student IDs
      const studentIds = guardiansData.map(g => g.student_id);
      console.log('[StudentProfileService] Found student IDs:', studentIds);
      
      // Fetch student profiles
      const { data: profilesData, error: profilesError } = await this.supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentIds);
        
      if (profilesError) {
        throw profilesError;
      }
      
      // Get user data for any missing profiles
      const { data: usersData, error: usersError } = await this.supabase
        .from('users')
        .select('*')
        .in('id', studentIds);
        
      if (usersError) {
        throw usersError;
      }
      
      // Combine data
      const students: Student[] = studentIds.map(id => {
        const profile = profilesData?.find(p => p.user_id === id);
        const user = usersData?.find(u => u.id === id);
        
        return {
          id: id,
          name: profile?.full_name || user?.email?.split('@')[0] || '',
          email: profile?.email || user?.email || '',
          created_at: user?.created_at || '',
          status: 'active',
          avatar_url: null,
          phone: profile?.phone || null,
        };
      });
      
      console.log('[StudentProfileService] Returning students from fallback:', students.length);
      return students;
    } catch (error) {
      console.error('[StudentProfileService] Error fetching students:', error);
      this.showError('Não foi possível buscar os estudantes');
      return [];
    }
  }
  
  /**
   * Alias for getStudentsForGuardian to support hooks
   */
  async getStudentsByParent(): Promise<Student[]> {
    return this.getStudentsForGuardian();
  }
}

export const studentProfileService = new StudentProfileService();
