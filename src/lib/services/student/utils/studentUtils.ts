
import { StudentRelationship } from '../types';

/**
 * Extract unique student IDs from relationship collections
 */
export function extractUniqueStudentIds(
  relationshipsByEmail: StudentRelationship[], 
  relationshipsById: StudentRelationship[]
): string[] {
  // Extract student IDs from relationships
  const allStudentIds: string[] = [];
  
  for (const rel of relationshipsByEmail) {
    if (rel && rel.student_id) {
      allStudentIds.push(rel.student_id);
    }
  }
  
  for (const rel of relationshipsById) {
    if (rel && rel.student_id) {
      allStudentIds.push(rel.student_id);
    }
  }
  
  // Create unique IDs using a Set
  const idSet = new Set<string>();
  const uniqueStudentIds: string[] = [];
  
  for (const id of allStudentIds) {
    if (!idSet.has(id)) {
      idSet.add(id);
      uniqueStudentIds.push(id);
    }
  }
  
  return uniqueStudentIds;
}
