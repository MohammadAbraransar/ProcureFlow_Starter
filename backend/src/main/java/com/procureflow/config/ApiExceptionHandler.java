package com.procureflow.config;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(DuplicateKeyException.class)
    ProblemDetail duplicateKey(DuplicateKeyException ignored) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "An account or record with these details already exists.");
    }
}
