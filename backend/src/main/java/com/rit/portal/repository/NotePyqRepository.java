package com.rit.portal.repository;

import com.rit.portal.entity.NotePyq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotePyqRepository extends JpaRepository<NotePyq, Integer> {
    List<NotePyq> findBySemester(Integer semester);
    List<NotePyq> findByDepartment(String department);
    List<NotePyq> findByFileType(String fileType);
}
