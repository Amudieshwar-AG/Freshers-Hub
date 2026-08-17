package com.rit.portal.service.ims;

import com.rit.portal.dto.ims.StudentDashboardDto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@ConditionalOnProperty(name = "ims.client.type", havingValue = "real")
public class RealImsClientImpl implements ImsClient {

    @Value("${ims.base-url:https://api.ims.ritchennai.edu.in}")
    private String imsBaseUrl;

    @Value("${ims.api-key:}")
    private String imsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders createHeaders(String studentId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Nexus-App-Secret", imsApiKey);
        if (studentId != null && !studentId.isBlank()) {
            headers.set("X-Student-Id", studentId);
        }
        headers.set("Accept", "application/json");
        return headers;
    }

    @Override
    public ImsLoginResponse authenticate(String regNumber, String password) {
        String url = imsBaseUrl + "/api/v1/auth/student-login";
        ImsLoginRequest request = ImsLoginRequest.builder()
                .regNumber(regNumber)
                .password(password)
                .build();
        HttpEntity<ImsLoginRequest> entity = new HttpEntity<>(request, createHeaders(null));
        ResponseEntity<ImsLoginResponse> resp = restTemplate.exchange(url, HttpMethod.POST, entity, ImsLoginResponse.class);
        return resp.getBody();
    }

    @Override
    public List<MockUserCredentialDto> getAvailableMockUsers() {
        return Collections.emptyList();
    }

    @Override
    public DashboardResponse getStudentDashboard(String studentId) {
        String url = imsBaseUrl + "/api/v1/dashboard/me";
        HttpEntity<?> entity = new HttpEntity<>(createHeaders(studentId));
        ResponseEntity<DashboardResponse> resp = restTemplate.exchange(url, HttpMethod.GET, entity, DashboardResponse.class);
        DashboardResponse body = resp.getBody();
        if (body != null) {
            body.setMockData(false);
        }
        return body;
    }

    @Override
    public StudentInfo getStudentInfo(String studentId) {
        String url = imsBaseUrl + "/api/v1/students/me";
        HttpEntity<?> entity = new HttpEntity<>(createHeaders(studentId));
        ResponseEntity<StudentInfo> resp = restTemplate.exchange(url, HttpMethod.GET, entity, StudentInfo.class);
        return resp.getBody();
    }

    @Override
    public ClassLocationInfo getClassLocation(String department, String section, int semester) {
        String url = String.format("%s/api/v1/classes/location?dept=%s&sec=%s&sem=%d", imsBaseUrl, department, section, semester);
        HttpEntity<?> entity = new HttpEntity<>(createHeaders(null));
        return restTemplate.exchange(url, HttpMethod.GET, entity, ClassLocationInfo.class).getBody();
    }

    @Override
    public List<ClassFacultyMember> getClassFaculty(String department, String section, int semester) {
        String url = String.format("%s/api/v1/classes/faculty?dept=%s&sec=%s&sem=%d", imsBaseUrl, department, section, semester);
        HttpEntity<?> entity = new HttpEntity<>(createHeaders(null));
        ClassFacultyMember[] array = restTemplate.exchange(url, HttpMethod.GET, entity, ClassFacultyMember[].class).getBody();
        return array != null ? Arrays.asList(array) : Collections.emptyList();
    }

    @Override
    public DaySchedule getDaySchedule(String studentId, LocalDate date) {
        String url = String.format("%s/api/v1/timetable/me?date=%s", imsBaseUrl, date.toString());
        HttpEntity<?> entity = new HttpEntity<>(createHeaders(studentId));
        return restTemplate.exchange(url, HttpMethod.GET, entity, DaySchedule.class).getBody();
    }
}
