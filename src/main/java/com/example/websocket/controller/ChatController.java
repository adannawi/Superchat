package com.example.websocket.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.websocket.model.ChatMessage;

@Controller
public class ChatController {
	public static int connected = 0;
	public static List<String> users = new ArrayList<String>();
	
	@MessageMapping("/chat.sendMessage")
	@SendTo("/topic/public")
	public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
		return chatMessage;
	}
	
	@MessageMapping("/chat.addUser")
	@SendTo("/topic/public")
	public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
		headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
		connected++;
		users.add(chatMessage.getSender());
		return chatMessage;
	}
	
	@MessageMapping("/chat.getUsers")
	@SendTo("/topic/users")
	public List<String> getUsers(){
		getCount();
		return users;
	}
	
	@MessageMapping("/chat.getUserCount")
	@SendTo("/topic/utility")
	public int getCount() {
		return connected;
	}
	
	@GetMapping("/currentusers")
	@ResponseBody
	public int getConnectedUsers() {
		return connected;
	}
}
