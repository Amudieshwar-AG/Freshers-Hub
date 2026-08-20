package com.rit.portal;

import com.rit.portal.entity.CommunityAnswer;
import com.rit.portal.entity.CommunityQuestion;
import com.rit.portal.entity.NotePyq;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class EntityMappingTest {

    @Test
    void testNotePyqBuilderDefaults() {
        NotePyq note = NotePyq.builder()
                .title("Data Structures Notes")
                .subject("Data Structures")
                .department("CSE")
                .semester(3)
                .fileType("notes")
                .downloadUrl("https://example.com/ds.pdf")
                .fileSize("2.4 MB")
                .build();

        assertNotNull(note);
        assertEquals(0, note.getDownloadsCount());
        assertNotNull(note.getUploadedAt());
        assertTrue(note.getUploadedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test
    void testCommunityQuestionBuilderDefaults() {
        CommunityQuestion question = CommunityQuestion.builder()
                .title("How to prepare for CAT-1?")
                .body("Looking for reference materials and past questions.")
                .author("Student123")
                .build();

        assertNotNull(question);
        assertEquals(0, question.getUpvotes());
        assertFalse(question.getIsAnswered());
        assertNotNull(question.getTags());
        assertNotNull(question.getAnswers());
        assertNotNull(question.getCreatedAt());
    }

    @Test
    void testCommunityAnswerBuilderDefaults() {
        CommunityAnswer answer = CommunityAnswer.builder()
                .body("Focus on Unit 1 and Unit 2 standard questions.")
                .author("Senior456")
                .build();

        assertNotNull(answer);
        assertEquals(0, answer.getUpvotes());
        assertFalse(answer.getIsAccepted());
        assertNotNull(answer.getCreatedAt());
    }
}
