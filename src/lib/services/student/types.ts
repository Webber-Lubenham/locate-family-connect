
/**
 * Types related to student data and relationships
 */

import { Student } from '@/types/auth';

/**
 * Defines the structure for student-guardian relationships
 */
export interface StudentRelationship {
  student_id: string | null;
}

/**
 * Response from RPC function for student data
 */
export interface StudentRPCResponse {
  student_id: string;
  student_name: string | null;
  student_email: string | null;
  relationship_date: string | null;
}
