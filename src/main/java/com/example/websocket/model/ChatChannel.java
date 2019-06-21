package com.example.websocket.model;

import java.util.ArrayList;
import java.util.List;

public class ChatChannel {
	
	private String ID;
	private String name;
	private List<String> users = new ArrayList<String>();
	
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
	
	public List<String> getUsers(){
		return users;
	}
	
	public void addUser(String user) {
		this.users.add(user);
	}
	
	public void removeUser(String user) {
		this.users.remove(user);
	}
	
	public ChatChannel() {
		
	}
}
