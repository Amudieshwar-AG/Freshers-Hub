package com.rit.portal.service.ims;

import com.rit.portal.dto.ims.StudentDashboardDto.*;
import java.time.LocalDate;
import java.util.List;

public interface ImsClient {
    ImsLoginResponse authenticate(String regNumber, String password);
    List<MockUserCredentialDto> getAvailableMockUsers();
    DashboardResponse getStudentDashboard(String studentId);
    StudentInfo getStudentInfo(String studentId);
    ClassLocationInfo getClassLocation(String department, String section, int semester);
    List<ClassFacultyMember> getClassFaculty(String department, String section, int semester);
    DaySchedule getDaySchedule(String studentId, LocalDate date);
}
