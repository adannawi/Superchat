package com.example.websocket.model;

public class ChatChannel {
	
	private String ID;
	private String name;
	
	public void setID(String ID) {
		ID = ID;
	}
	
	public String getID() {
		return ID;
	}
	
	public void setName(String name) {
		name = name;
	}
	
	public String getName() {
		return name;
	}
	
	public ChatChannel(String ID, String name) {
		this.ID = ID;
		this.name = name;
	}
	
	public ChatChannel() {
		
	}
}
