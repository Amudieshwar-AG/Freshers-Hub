package com.rit.portal.service.ims;

import com.rit.portal.dto.ims.StudentDashboardDto.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@ConditionalOnProperty(name = "ims.client.type", havingValue = "mock", matchIfMissing = true)
public class MockImsClientImpl implements ImsClient {

    private final Map<String, StudentInfo> studentDb = new HashMap<>();
    private final Map<String, String> userPasswords = new HashMap<>();
    private final Map<String, ClassLocationInfo> locationDb = new HashMap<>();
    private final Map<String, List<ClassFacultyMember>> facultyDb = new HashMap<>();
    private final List<MockUserCredentialDto> mockUserList = new ArrayList<>();

    public MockImsClientImpl() {
        seedMockData();
    }

    private void seedMockData() {
        // ─────────────────────────────────────────────────────────────
        // 1. MOCK STUDENT 1: 2114251001 (CSE - Section A, Year 1, Sem 2)
        // ─────────────────────────────────────────────────────────────
        StudentInfo s1 = StudentInfo.builder()
                .studentId("2114251001")
                .regNumber("2114251001")
                .name("Anbu Kathir")
                .email("251001@ritchennai.edu.in")
                .degree("B.E.")
                .department("Computer Science & Engineering")
                .departmentCode("CSE")
                .year(1)
                .semester(2)
                .section("A")
                .batch("2025 - 2029")
                .regulation("2021 Regulation")
                .build();

        studentDb.put("2114251001", s1);
        studentDb.put("251001", s1);
        userPasswords.put("2114251001", "rit@2026");
        userPasswords.put("251001", "rit@2026");

        mockUserList.add(MockUserCredentialDto.builder()
                .regNumber("2114251001")
                .defaultPassword("rit@2026")
                .studentName("Anbu Kathir")
                .department("Computer Science & Engineering")
                .section("Sec A")
                .build());

        locationDb.put("CSE_A_2", ClassLocationInfo.builder()
                .roomNumber("LH-204")
                .buildingName("Dr. APJ Abdul Kalam Academic Block")
                .floor("2nd Floor")
                .wing("East Wing")
                .landmark("Next to CSE Department Library, Opposite to Seminar Hall")
                .build());

        facultyDb.put("CSE_A_2", List.of(
                ClassFacultyMember.builder()
                        .subjectCode("CS3201")
                        .subjectName("Data Structures & Algorithms")
                        .facultyName("Dr. R. Arunkumar")
                        .designation("Associate Professor & Class Incharge")
                        .email("arunkumar.r@ritchennai.edu.in")
                        .officeLocation("APJ Block, Cabin 208-B")
                        .phoneExtension("Ext. 312")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Arunkumar")
                        .isClassIncharge(true)
                        .build(),
                ClassFacultyMember.builder()
                        .subjectCode("MA3251")
                        .subjectName("Discrete Mathematics")
                        .facultyName("Dr. S. Malathi")
                        .designation("Professor (Mathematics)")
                        .email("malathi.s@ritchennai.edu.in")
                        .officeLocation("Science & Humanities Block, 1st Floor")
                        .phoneExtension("Ext. 118")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Malathi")
                        .isClassIncharge(false)
                        .build(),
                ClassFacultyMember.builder()
                        .subjectCode("CS3202")
                        .subjectName("Digital Principles & System Design")
                        .facultyName("Dr. M. Balaji")
                        .designation("Assistant Professor")
                        .email("balaji.m@ritchennai.edu.in")
                        .officeLocation("APJ Block, Cabin 104")
                        .phoneExtension("Ext. 325")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Balaji")
                        .isClassIncharge(false)
                        .build(),
                ClassFacultyMember.builder()
                        .subjectCode("GE3251")
                        .subjectName("Environmental Sciences & Sustainability")
                        .facultyName("Dr. T. Gayathri")
                        .designation("Assistant Professor (Chemistry)")
                        .email("gayathri.t@ritchennai.edu.in")
                        .officeLocation("Science Block, Chemistry Cabin 3")
                        .phoneExtension("Ext. 142")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathri")
                        .isClassIncharge(false)
                        .build(),
                ClassFacultyMember.builder()
                        .subjectCode("CS3271")
                        .subjectName("Data Structures Laboratory")
                        .facultyName("Dr. R. Arunkumar / Dr. K. Revathi")
                        .designation("Lab In-Charges")
                        .email("lab.cse@ritchennai.edu.in")
                        .officeLocation("Computing Center 3 (CC-03)")
                        .phoneExtension("Ext. 330")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Revathi")
                        .isClassIncharge(false)
                        .build()
        ));

        // ─────────────────────────────────────────────────────────────
        // 2. MOCK STUDENT 2: 2114251002 (AI&DS - Section B, Year 1, Sem 2)
        // ─────────────────────────────────────────────────────────────
        StudentInfo s2 = StudentInfo.builder()
                .studentId("2114251002")
                .regNumber("2114251002")
                .name("Priyadharshini M")
                .email("251002@ritchennai.edu.in")
                .degree("B.Tech.")
                .department("Artificial Intelligence & Data Science")
                .departmentCode("AIDS")
                .year(1)
                .semester(2)
                .section("B")
                .batch("2025 - 2029")
                .regulation("2021 Regulation")
                .build();

        studentDb.put("2114251002", s2);
        studentDb.put("251002", s2);
        userPasswords.put("2114251002", "rit@2026");
        userPasswords.put("251002", "rit@2026");

        mockUserList.add(MockUserCredentialDto.builder()
                .regNumber("2114251002")
                .defaultPassword("rit@2026")
                .studentName("Priyadharshini M")
                .department("AI & Data Science")
                .section("Sec B")
                .build());

        locationDb.put("AIDS_B_2", ClassLocationInfo.builder()
                .roomNumber("LH-301")
                .buildingName("Sir Isaac Newton Innovation Block")
                .floor("3rd Floor")
                .wing("North Wing")
                .landmark("Opposite AI Centre of Excellence, Near Lift Lobby")
                .build());

        facultyDb.put("AIDS_B_2", List.of(
                ClassFacultyMember.builder()
                        .subjectCode("AD3251")
                        .subjectName("Data Structures Design")
                        .facultyName("Dr. N. Saravanan")
                        .designation("Associate Professor & Class Incharge")
                        .email("saravanan.n@ritchennai.edu.in")
                        .officeLocation("Newton Block, Cabin 302")
                        .phoneExtension("Ext. 401")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Saravanan")
                        .isClassIncharge(true)
                        .build(),
                ClassFacultyMember.builder()
                        .subjectCode("AD3252")
                        .subjectName("Foundations of Artificial Intelligence")
                        .facultyName("Prof. J. Daniel")
                        .designation("Assistant Professor")
                        .email("daniel.j@ritchennai.edu.in")
                        .officeLocation("Newton Block, Cabin 306")
                        .phoneExtension("Ext. 405")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel")
                        .isClassIncharge(false)
                        .build(),
                ClassFacultyMember.builder()
                        .subjectCode("MA3251")
                        .subjectName("Probability and Statistics")
                        .facultyName("Dr. V. Lakshmi")
                        .designation("Professor (Mathematics)")
                        .email("lakshmi.v@ritchennai.edu.in")
                        .officeLocation("Science Block, Cabin 108")
                        .phoneExtension("Ext. 119")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Lakshmi")
                        .isClassIncharge(false)
                        .build()
        ));

        // ─────────────────────────────────────────────────────────────
        // 3. MOCK STUDENT 3: 2114251003 (ECE - Section A, Year 1, Sem 2)
        // ─────────────────────────────────────────────────────────────
        StudentInfo s3 = StudentInfo.builder()
                .studentId("2114251003")
                .regNumber("2114251003")
                .name("Rahul V")
                .email("251003@ritchennai.edu.in")
                .degree("B.E.")
                .department("Electronics & Communication Engineering")
                .departmentCode("ECE")
                .year(1)
                .semester(2)
                .section("A")
                .batch("2025 - 2029")
                .regulation("2021 Regulation")
                .build();

        studentDb.put("2114251003", s3);
        studentDb.put("251003", s3);
        userPasswords.put("2114251003", "rit@2026");
        userPasswords.put("251003", "rit@2026");

        mockUserList.add(MockUserCredentialDto.builder()
                .regNumber("2114251003")
                .defaultPassword("rit@2026")
                .studentName("Rahul V")
                .department("Electronics & Comm. Engg.")
                .section("Sec A")
                .build());

        locationDb.put("ECE_A_2", ClassLocationInfo.builder()
                .roomNumber("LH-105")
                .buildingName("Rabindranath Tagore Academic Block")
                .floor("1st Floor")
                .wing("South Wing")
                .landmark("Near Department Auditorium")
                .build());

        facultyDb.put("ECE_A_2", List.of(
                ClassFacultyMember.builder()
                        .subjectCode("EC3251")
                        .subjectName("Circuit Analysis")
                        .facultyName("Dr. I. Chandra")
                        .designation("Professor & Class Incharge")
                        .email("chandra.i@ritchennai.edu.in")
                        .officeLocation("Tagore Block, Cabin 112")
                        .phoneExtension("Ext. 502")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Chandra")
                        .isClassIncharge(true)
                        .build()
        ));
    }

    @Override
    public ImsLoginResponse authenticate(String regNumber, String password) {
        if (regNumber == null || regNumber.isBlank()) {
            return ImsLoginResponse.builder()
                    .success(false)
                    .message("Register Number is required.")
                    .build();
        }

        String cleanedReg = regNumber.trim();
        StudentInfo student = studentDb.get(cleanedReg);

        if (student == null) {
            String digits = cleanedReg.replaceAll("[^0-9]", "");
            student = studentDb.get(digits);
        }

        if (student == null) {
            student = StudentInfo.builder()
                    .studentId(cleanedReg)
                    .regNumber(cleanedReg)
                    .name("Student (" + cleanedReg + ")")
                    .email(cleanedReg + "@ritchennai.edu.in")
                    .degree("B.E.")
                    .department("Computer Science & Engineering")
                    .departmentCode("CSE")
                    .year(1)
                    .semester(2)
                    .section("A")
                    .batch("2025 - 2029")
                    .regulation("2021 Regulation")
                    .build();
            studentDb.put(cleanedReg, student);
            userPasswords.put(cleanedReg, "rit@2026");
        }

        String expectedPassword = userPasswords.getOrDefault(cleanedReg, "rit@2026");
        boolean isValid = password != null && (
                password.equals(expectedPassword) ||
                password.equals("rit@2026") ||
                password.equals("password") ||
                password.equals("123456")
        );

        if (!isValid) {
            return ImsLoginResponse.builder()
                    .success(false)
                    .message("Invalid Register Number or Password. Default password: rit@2026")
                    .build();
        }

        String token = "ims_session_" + student.getRegNumber() + "_" + UUID.randomUUID().toString().substring(0, 8);

        return ImsLoginResponse.builder()
                .success(true)
                .message("IMS Login Successful")
                .token(token)
                .student(student)
                .build();
    }

    @Override
    public List<MockUserCredentialDto> getAvailableMockUsers() {
        return Collections.unmodifiableList(mockUserList);
    }

    @Override
    public DashboardResponse getStudentDashboard(String studentId) {
        StudentInfo student = getStudentInfo(studentId);
        String classKey = student.getDepartmentCode() + "_" + student.getSection() + "_" + student.getSemester();

        ClassLocationInfo location = locationDb.getOrDefault(classKey, locationDb.get("CSE_A_2"));
        List<ClassFacultyMember> faculty = facultyDb.getOrDefault(classKey, facultyDb.get("CSE_A_2"));
        DaySchedule schedule = getDaySchedule(studentId, LocalDate.now());

        return DashboardResponse.builder()
                .student(student)
                .classLocation(location)
                .facultyList(faculty)
                .todaySchedule(schedule)
                .isMockData(true)
                .build();
    }

    @Override
    public StudentInfo getStudentInfo(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            return studentDb.get("2114251001");
        }
        String cleaned = studentId.trim();
        StudentInfo student = studentDb.get(cleaned);
        if (student != null) return student;

        String digits = cleaned.replaceAll("[^0-9]", "");
        return studentDb.getOrDefault(digits, studentDb.get("2114251001"));
    }

    @Override
    public ClassLocationInfo getClassLocation(String department, String section, int semester) {
        String key = department + "_" + section + "_" + semester;
        return locationDb.getOrDefault(key, locationDb.get("CSE_A_2"));
    }

    @Override
    public List<ClassFacultyMember> getClassFaculty(String department, String section, int semester) {
        String key = department + "_" + section + "_" + semester;
        return facultyDb.getOrDefault(key, facultyDb.get("CSE_A_2"));
    }

    @Override
    public DaySchedule getDaySchedule(String studentId, LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        String dayName = (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) ? "MONDAY" : day.name();

        LocalTime now = LocalTime.now();
        List<TimetablePeriod> periods = buildTimetableForDay(studentId, dayName, now);

        return DaySchedule.builder()
                .dayOfWeek(dayName)
                .date(date)
                .periods(periods)
                .build();
    }

    private List<TimetablePeriod> buildTimetableForDay(String studentId, String dayOfWeek, LocalTime now) {
        List<TimetablePeriod> list = new ArrayList<>();

        String[][] slots = {
                {"1", "08:45 AM - 09:40 AM", "08:45", "09:40"},
                {"2", "09:40 AM - 10:35 AM", "09:40", "10:35"},
                {"3", "10:50 AM - 11:45 AM", "10:50", "11:45"},
                {"4", "11:45 AM - 12:40 PM", "11:45", "12:40"},
                {"5", "01:30 PM - 02:25 PM", "13:30", "14:25"},
                {"6", "02:25 PM - 03:20 PM", "14:25", "15:20"}
        };

        boolean isAids = studentId != null && studentId.contains("251002");
        String room = isAids ? "LH-301" : "LH-204";
        String lab = isAids ? "AI-02 Lab" : "CC-03 Lab";

        String[][] subjects;
        if ("WEDNESDAY".equalsIgnoreCase(dayOfWeek) || "FRIDAY".equalsIgnoreCase(dayOfWeek)) {
            subjects = new String[][]{
                    {isAids ? "AD3251" : "CS3201", isAids ? "Data Structures Design" : "Data Structures & Algorithms", "THEORY", isAids ? "Dr. N. Saravanan" : "Dr. R. Arunkumar", room},
                    {"MA3251", isAids ? "Probability & Stats" : "Discrete Mathematics", "THEORY", isAids ? "Dr. V. Lakshmi" : "Dr. S. Malathi", room},
                    {isAids ? "AD3271" : "CS3271", isAids ? "AI & DS Practical Lab" : "Data Structures Laboratory", "LAB", isAids ? "Dr. N. Saravanan" : "Dr. R. Arunkumar", lab},
                    {isAids ? "AD3271" : "CS3271", isAids ? "AI & DS Practical Lab" : "Data Structures Laboratory", "LAB", isAids ? "Dr. N. Saravanan" : "Dr. R. Arunkumar", lab},
                    {isAids ? "AD3252" : "CS3202", isAids ? "Foundations of AI" : "Digital Principles & System Design", "THEORY", isAids ? "Prof. J. Daniel" : "Dr. M. Balaji", room},
                    {"GE3251", "Environmental Sciences", "THEORY", "Dr. T. Gayathri", room}
            };
        } else {
            subjects = new String[][]{
                    {"MA3251", isAids ? "Probability & Stats" : "Discrete Mathematics", "THEORY", isAids ? "Dr. V. Lakshmi" : "Dr. S. Malathi", room},
                    {isAids ? "AD3251" : "CS3201", isAids ? "Data Structures Design" : "Data Structures & Algorithms", "THEORY", isAids ? "Dr. N. Saravanan" : "Dr. R. Arunkumar", room},
                    {isAids ? "AD3252" : "CS3202", isAids ? "Foundations of AI" : "Digital Principles & System Design", "THEORY", isAids ? "Prof. J. Daniel" : "Dr. M. Balaji", room},
                    {"GE3251", "Environmental Sciences", "THEORY", "Dr. T. Gayathri", room},
                    {isAids ? "AD3251" : "CS3201", isAids ? "AI Problem Solving Tutorial" : "DSA Tutorial & Problem Solving", "TUTORIAL", isAids ? "Dr. N. Saravanan" : "Dr. R. Arunkumar", room},
                    {"LIB", "Digital Library & Research Hours", "LIBRARY", "Chief Librarian", "Central Library - 2nd Floor"}
            };
        }

        for (int i = 0; i < slots.length; i++) {
            LocalTime start = LocalTime.parse(slots[i][2]);
            LocalTime end = LocalTime.parse(slots[i][3]);

            String status = "UPCOMING";
            if (now.isAfter(end)) {
                status = "COMPLETED";
            } else if (now.isAfter(start) && now.isBefore(end)) {
                status = "ONGOING";
            }

            list.add(TimetablePeriod.builder()
                    .periodNumber(Integer.parseInt(slots[i][0]))
                    .timeSlot(slots[i][1])
                    .startTime(slots[i][2])
                    .endTime(slots[i][3])
                    .subjectCode(subjects[i][0])
                    .subjectName(subjects[i][1])
                    .type(subjects[i][2])
                    .facultyName(subjects[i][3])
                    .venue(subjects[i][4])
                    .status(status)
                    .build());
        }

        return list;
    }
}
