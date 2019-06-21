package com.example.websocket.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.websocket.model.ChatChannel;
import com.example.websocket.model.ChatMessage;

@Controller
public class ChatController {
	public static int connected = 0;
	public static List<String> users = new ArrayList<String>();
	public static List<ChatChannel> channels = new ArrayList<ChatChannel>(Arrays.asList(
			new ChatChannel("0", "General"), new ChatChannel("1", "Offtopic")));
	
	@MessageMapping("/chat.sendMessage/{channelID}")
	@SendTo("/topic/public/{channelID}")
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
		return users;
	}
	
	@MessageMapping("/chat.getUserCount")
	@SendTo("/topic/utility")
	public int getCount() {
		return connected;
	}
	
	@MessageMapping("/chat.getChannels")
	@SendTo("/topic/utility/channels")
	public List<ChatChannel> returnChannels(){
		return channels;
	}
}
