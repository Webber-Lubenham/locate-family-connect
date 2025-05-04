
/**
 * Types related to guardians and their relationships with students
 */

/**
 * Guardian data as returned from the database
 */
export interface GuardianDBResponse {
  id: string;
  student_id: string | null;
  email: string;
  full_name?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Request to add a new guardian
 */
export interface AddGuardianRequest {
  studentId: string;
  email: string;
  relationshipType?: string;
  fullName?: string;
  phone?: string;
}

/**
 * Result of guardian operations
 */
export interface GuardianOperationResult {
  success: boolean;
  message?: string;
  data?: any;
}
