package com.taskmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanagement.dto.TaskResponse;
import com.taskmanagement.model.Task;
import com.taskmanagement.service.TaskService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @RequestBody Task task,
            Authentication authentication) {

        String email = authentication.getName();

        TaskResponse createdTask = taskService.createTask(email, task);

        return ResponseEntity.ok(createdTask);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(taskService.getTasks(email));
    }
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestBody Task task,
            Authentication authentication) {

        String email = authentication.getName();

        TaskResponse updatedTask =
                taskService.updateTask(email, id, task);

        return ResponseEntity.ok(updatedTask);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTask(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        taskService.deleteTask(email, id);

        return ResponseEntity.ok("Task deleted successfully");
    }
}