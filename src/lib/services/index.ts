
// Re-export all services from a single entry point
import { studentProfileService } from './student/StudentProfileService';
import { studentRepository } from './student/StudentRepository';
import { guardianService } from './guardian/GuardianService';
import { locationService } from './location/LocationService';

// Consolidate services into a single studentService object 
// for backwards compatibility
export const studentService = {
  // Student profile methods
  getStudentsForGuardian: studentProfileService.getStudentsForGuardian.bind(studentProfileService),
  getStudentsByParent: studentProfileService.getStudentsByParent.bind(studentProfileService),
  
  // Guardian methods
  getGuardiansForStudent: guardianService.getGuardiansForStudent.bind(guardianService),
  getGuardiansByStudent: guardianService.getGuardiansByStudent.bind(guardianService),
  addGuardian: guardianService.addGuardian.bind(guardianService),
  
  // Location methods
  getStudentLocations: locationService.getStudentLocations.bind(locationService)
};

// Export individual services for direct usage
export { studentProfileService, studentRepository, guardianService, locationService };
