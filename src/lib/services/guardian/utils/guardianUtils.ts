
import { GuardianData } from '@/types/database';
import { GuardianDBResponse } from '../types';

/**
 * Convert database guardian data to GuardianData interface
 */
export function mapToGuardianData(guardianDbData: GuardianDBResponse[]): GuardianData[] {
  return guardianDbData.map(item => ({
    id: item.id,
    student_id: item.student_id || null,
    guardian_id: null, // Not present in the database, default to null
    email: item.email,
    full_name: item.full_name || 'Nome não informado',
    phone: item.phone,
    is_active: !!item.is_active,
    created_at: item.created_at,
    relationship_type: null, // Not present in the database, default to null
    status: 'active' as const
  }));
}
