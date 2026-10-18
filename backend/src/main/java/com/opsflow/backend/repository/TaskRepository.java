
package com.opsflow.backend.repository;

import com.opsflow.backend.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
