
/**
 * Types related to student data
 */

/**
 * Student relationship to guardian/parent
 */
export interface StudentRelationship {
  student_id: string;
}

/**
 * Response from RPC function get_guardian_students
 */
export interface StudentRPCResponse {
  student_id: string;  // Changed from UUID to string to match usage
  student_email: string;
  student_name: string;
  relationship_date?: string;
}
