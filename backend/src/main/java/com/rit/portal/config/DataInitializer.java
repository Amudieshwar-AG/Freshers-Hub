package com.rit.portal.config;

import com.rit.portal.entity.NotePyq;
import com.rit.portal.repository.NotePyqRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private NotePyqRepository noteRepository;

    @Override
    public void run(String... args) throws Exception {
        if (noteRepository.count() == 0) {
            noteRepository.saveAll(Arrays.asList(
                NotePyq.builder()
                    .title("Engineering Mathematics – Unit 1-5")
                    .subject("Mathematics")
                    .department("Computer Science & Engineering")
                    .semester(1)
                    .fileType("notes")
                    .downloadUrl("#")
                    .fileSize("4.2 MB")
                    .downloadsCount(348)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Physics PYQ 2020-2024")
                    .subject("Physics")
                    .department("Computer Science & Engineering")
                    .semester(1)
                    .fileType("pyq")
                    .downloadUrl("#")
                    .fileSize("8.1 MB")
                    .downloadsCount(512)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("C Programming Complete Notes")
                    .subject("Programming")
                    .department("Computer Science & Engineering")
                    .semester(1)
                    .fileType("notes")
                    .downloadUrl("#")
                    .fileSize("6.3 MB")
                    .downloadsCount(734)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Data Structures PYQ 2019-2024")
                    .subject("Data Structures")
                    .department("Computer Science & Engineering")
                    .semester(3)
                    .fileType("pyq")
                    .downloadUrl("#")
                    .fileSize("10.2 MB")
                    .downloadsCount(621)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Circuit Theory Full Notes")
                    .subject("Circuit Theory")
                    .department("Electronics & Communication")
                    .semester(2)
                    .fileType("notes")
                    .downloadUrl("#")
                    .fileSize("5.7 MB")
                    .downloadsCount(289)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Anna University Syllabus 2021")
                    .subject("Syllabus")
                    .department("All Departments")
                    .semester(1)
                    .fileType("syllabus")
                    .downloadUrl("#")
                    .fileSize("2.1 MB")
                    .downloadsCount(890)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Thermodynamics Notes")
                    .subject("Thermodynamics")
                    .department("Mechanical Engineering")
                    .semester(3)
                    .fileType("notes")
                    .downloadUrl("#")
                    .fileSize("3.9 MB")
                    .downloadsCount(201)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Digital Electronics PYQ")
                    .subject("Digital Electronics")
                    .department("Electronics & Communication")
                    .semester(4)
                    .fileType("pyq")
                    .downloadUrl("#")
                    .fileSize("7.3 MB")
                    .downloadsCount(445)
                    .uploadedAt(LocalDateTime.now())
                    .build()
            ));
            System.out.println("🌱 Database successfully seeded with Notes & PYQs test data!");
        }
    }
}
