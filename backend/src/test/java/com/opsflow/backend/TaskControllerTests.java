
package com.opsflow.backend;

import com.opsflow.backend.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository taskRepository;

    @Test
    void getTasksShouldReturnSuccess() throws Exception {
        mockMvc.perform(get("/api/tasks")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void createTaskShouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "title": "Automated Test Task",
                        "description": "Created by a test",
                        "status": "TODO",
                        "priority": "HIGH"
                    }
                    """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title")
                        .value("Automated Test Task"));
    }

    @Test
    void blankTitleShouldReturnBadRequest() throws Exception {
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "title": "   ",
                        "description": "Invalid task",
                        "status": "TODO",
                        "priority": "MEDIUM"
                    }
                    """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void missingTaskShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/tasks/999999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateTaskWithCurrentVersionShouldSucceed()
            throws Exception {
        Task task = createSavedTask();

        mockMvc.perform(put("/api/tasks/" + task.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "title": "Updated Test Task",
                        "description": "Updated by a test",
                        "status": "IN_PROGRESS",
                        "priority": "HIGH",
                        "version": %d
                    }
                    """.formatted(task.getVersion())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title")
                        .value("Updated Test Task"));
    }

    @Test
    void updateTaskWithStaleVersionShouldReturnConflict()
            throws Exception {
        Task task = createSavedTask();

        mockMvc.perform(put("/api/tasks/" + task.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "title": "Stale Update",
                        "description": "Should not be saved",
                        "status": "DONE",
                        "priority": "LOW",
                        "version": %d
                    }
                    """.formatted(task.getVersion() - 1)))
                .andExpect(status().isConflict());
    }

    @Test
    void deleteTaskShouldReturnNoContent() throws Exception {
        Task task = createSavedTask();

        mockMvc.perform(delete("/api/tasks/" + task.getId()))
                .andExpect(status().isNoContent());

        org.junit.jupiter.api.Assertions.assertFalse(
                taskRepository.existsById(task.getId()));
    }

    private Task createSavedTask() {
        Task task = new Task();
        task.setTitle("Test Task");
        task.setDescription("Created for automated testing");
        task.setStatus("TODO");
        task.setPriority("MEDIUM");
        return taskRepository.save(task);
    }
}
