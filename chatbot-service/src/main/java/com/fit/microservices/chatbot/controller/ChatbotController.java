package com.fit.microservices.chatbot.controller;

import com.fit.microservices.chatbot.dto.ChatRequest;
import com.fit.microservices.chatbot.dto.ChatResponse;
import com.fit.microservices.chatbot.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        if (request == null || request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        ChatResponse response = chatbotService.getRecommendation(request.getPrompt());
        return ResponseEntity.ok(response);
    }
}
