
package com.opsflow.backend;

import com.opsflow.backend.repository.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    private static final Set<String> VALID_STATUSES =
            Set.of("TODO", "IN_PROGRESS", "DONE");

    private static final Set<String> VALID_PRIORITIES =
            Set.of("LOW", "MEDIUM", "HIGH");

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    private void validateTask(Task task) {
        if (task.getStatus() == null ||
                !VALID_STATUSES.contains(task.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be TODO, IN_PROGRESS, or DONE");
        }

        if (task.getPriority() == null ||
                !VALID_PRIORITIES.contains(task.getPriority())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Priority must be LOW, MEDIUM, or HIGH");
        }
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Task not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task createTask(@Valid @RequestBody Task task) {
        task.setId(null);
        validateTask(task);
        return taskRepository.save(task);
    }

  
@PutMapping("/{id}")
public Task updateTask(
        @PathVariable Long id,
        @Valid @RequestBody Task updatedTask) {

    Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Task not found"));

    if (updatedTask.getVersion() == null
            || !updatedTask.getVersion().equals(task.getVersion())) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Task was modified. Please refresh and try again.");
    }

    validateTask(updatedTask);

    task.setTitle(updatedTask.getTitle());
    task.setDescription(updatedTask.getDescription());
    task.setStatus(updatedTask.getStatus());
    task.setPriority(updatedTask.getPriority());

    return taskRepository.save(task);
}


    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Task not found");
        }

        taskRepository.deleteById(id);
    }
}
