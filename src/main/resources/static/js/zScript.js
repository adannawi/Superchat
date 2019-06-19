'use strict';

var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');

var messageArea = document.querySelector('#messageArea');
var connectedUsers = document.querySelector('#connectedUsers');

var connectingElement = document.querySelector('.connecting');

var randomButton = document.querySelector('#randomName');

var stompClient = null;
var username = null;
var xmlHttp = null;


function code(){

	xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = ProcessRequest;
	xmlHttp.open("GET", "http://localhost:8000/currentusers", true);
	xmlHttp.send();
}
window.onload = code;

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
randomButton.addEventListener('click', randomName, true);

function ProcessRequest(){
	var message;
	console.log(xmlHttp);
	if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
		if (xmlHttp.responseText == "Not found"){
			message = "Not found";
		}else{
			var info = eval("(" + xmlHttp.responseText + ")");
			message = info;
		}
	document.querySelector('#connected-now').appendChild(document.createTextNode(message));
	}
}

function randomName(event){
	var char='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVQXYZ0123456789';
	var adjectives = ["Lazy", "Dependent", "Ambitious", "Brave", "Weak", "Murderous", "Intelligent", "Diligent", "Apathetic", "Depressed"];
	var nouns=["Narwhal", "Bottle", "Phone", "Car", "Whale", "Elephant", "Spring", "Rhino", "Cat", "Dog", "Mouse", "Rat", "Monkey"];
	var randomString = "";
	randomString += adjectives[Math.round(Math.random() * (adjectives.length - 1))];
	randomString += nouns[Math.round(Math.random() * (nouns.length - 1))];
	document.querySelector('#userName').value = randomString;
}





function connect(event){
	username = document.querySelector('#userName').value.trim();
	if (username){
		document.querySelector('#username-page').classList.add('hidden');
		document.querySelector('#chat-page').classList.remove('hidden');
		var socket = new SockJS('/ws');
		stompClient = Stomp.over(socket);
		stompClient.connect({}, onConnected, onError);
	}
    event.preventDefault();
}

function onConnected(event){
	// subscribe to the Public topic
	stompClient.subscribe('/topic/public', onMessageReceived);
	
	stompClient.send("/app/chat.addUser", {}, JSON.stringify({sender: username, type: 'JOIN'}))
			
	connectingElement.classList.add('hidden');
	connectedUsers.appendChild(
			document.createElement('li').appendChild(
					document.createElement('p').appendChild(
							document.createTextNode(username))));
					
}

function onError(event){
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';	
}

function sendMessage(event){
	var messageContent = messageInput.value.trim();
	if (messageContent && stompClient){
		var chatMessage = {sender: username, content:messageContent, type:'CHAT'};
		stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
		messageInput.value='';
	}
	event.preventDefault();
}

function onMessageReceived(payload){
	var message = JSON.parse(payload.body);
	var messageElement = document.createElement('li');
	var breakElement = document.createElement('hr');
	messageElement.appendChild(breakElement);
	
	if (message.type === 'JOIN'){
		message.content = message.sender + ' joined!';
	}else if (message.type === 'LEAVE'){
		message.content = message.sender + ' left!';
	}else{
		message.content = message.sender + ': ' + message.content;
	}
	var textElement = document.createElement('p');
	var messageText = document.createTextNode(message.content);
	textElement.appendChild(messageText);
	messageElement.appendChild(textElement);
	messageArea.appendChild(messageElement);
	messageArea.scrollTop = messageArea.scrollHeight;
}


function message(event){
}