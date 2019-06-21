'use strict';

var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');

var messageRoom = document.querySelector('#messageRoom');
var messageArea = document.querySelector('#messageArea'+channelID);
var connectedUsers = document.querySelector('#connectedUsers');

var connectingElement = document.querySelector('.connecting');
var randomButton = document.querySelector('#randomName');

var stompClient = null;
var username = null;
var xmlHttp = null;
var chatSubscription = null;
var channelSub = null;
var currentUsers = 0;


var userStomp = null;
var userArea = document.querySelector('#userArea');



var channelID = 0;
var createChannelButton = document.querySelector('#channelCreate');
var channelSelectBox = document.querySelector('#channel-list');


//*** This code block runs on page load and is used to establish a web socket connection with the back end *** //
//***                 in order to receive a real time view of the connected user count									   *** //
window.onload = code;

function code(){
	var userSock = new SockJS('/users');
	userStomp = Stomp.over(userSock);
	userStomp.connect({}, mainConnected, onError);
}

function mainConnected(event){
	console.log('connected');
	userStomp.subscribe('/topic/utility', updateUserCount);
	userStomp.send('/app/chat.getUserCount', {}, '');
}

//**************************************************************************************************************//



channelSelectBox.onchange = changeChannel;

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
randomButton.addEventListener('click', randomName, true);
createChannelButton.addEventListener('click', displayCreateChannel, true);

function randomName(event){
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

async function onConnected(event){
	// subscribe to the Public topic
	stompClient.subscribe('/topic/users', updateUsers);
	stompClient.subscribe('/topic/public', onMessageReceived);
	chatSubscription = stompClient.subscribe('/topic/public/' + channelID, onMessageReceived);

	channelSub = stompClient.subscribe('/topic/utility/channels', updateChannels);
	await stompClient.send("/app/chat.getChannels", {}, '');
	stompClient.send("/app/chat.addUser", {}, JSON.stringify({sender: username, type: 'JOIN'}))
	stompClient.send("/app/chat.getUsers", {}, '')
	
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
		stompClient.send('/app/chat.sendMessage/' + channelID, {}, JSON.stringify(chatMessage));
		messageInput.value='';
	}
	event.preventDefault();
}

function onMessageReceived(payload){
	var message = JSON.parse(payload.body);
	var messageElement = document.createElement('li');
	var totalMessage = document.createElement('div');
	
	
	var userNameElement = document.createElement('span');
	var textElement = document.createElement('span');
	
	userNameElement.setAttribute('style', 'color: red; padding-left:5px;');
	textElement.setAttribute('style', 'color: red;');
	
	if (message.type === 'JOIN'){
		userNameElement.appendChild(document.createTextNode(message.sender));
		message.content = ' joined!';
		
	}else if (message.type === 'LEAVE'){
		userNameElement.appendChild(document.createTextNode(message.sender));
		message.content = ' left!';
		
	}else{
		textElement.setAttribute('style', 'color: black;');
		userNameElement.appendChild(document.createTextNode(message.sender));
		message.content = ': ' + message.content;
		
	}
	totalMessage.append(userNameElement);
	
	var messageText = document.createTextNode(message.content);
	textElement.appendChild(messageText);
	
	totalMessage.appendChild(textElement);
	
	messageElement.appendChild(totalMessage);
	console.log('in on message received: ' + messageArea);
	messageArea.appendChild(messageElement);
	messageArea.scrollTop = messageArea.scrollHeight;
}

function updateUsers(payload){
	userStomp.send('/app/chat.getUserCount', {}, '');
	var userListPre = payload.body.replace(/[\[\]"]+/g, '');
	var userList = userListPre.split(',');
	
	currentUsers = userList.length;
	
	while(userArea.firstChild) userArea.removeChild(userArea.firstChild);
	console.log(userList);
	for(var i = 0; i < userList.length; i++){
		var userListElement = document.createElement('li');
		userListElement.textContent = userList[i];
		userArea.appendChild(userListElement);
	}
}
	
function updateUserCount(payload){
	var connectedNow = document.querySelector('#connected-now');
	while(connectedNow.firstChild) connectedNow.removeChild(connectedNow.firstChild);
	connectedNow.appendChild(document.createTextNode(payload.body));		
}

// Function to update the channel list, currently buggy as it appends the channel list every time
// a user joins
async function updateChannels(payload){
	/*
	 * 				<!--  Channel functionality, append new messageArea on new channel, hide all others on channel select -->
					<div id = "messageRoom">
						<ul id="messageArea" class="list-unstyled"></ul>
					</div>
	 */
	// Populate dropbox with channel selections
	if (channelSelectBox.size == 0){
		var channels = JSON.parse(payload.body);
		var docfrag = document.createDocumentFragment();
		
		for(var i = 0; i < channels.length; i++){
			docfrag.appendChild(new Option(channels[i].name, channels[i].id));
			var messageUL = document.createElement('ul');
			messageUL.setAttribute('id', 'messageArea'+channels[i].id);
			messageUL.setAttribute('class', 'hidden');
			console.log(messageUL);
			messageRoom.appendChild(messageUL);
		}
		messageArea = document.querySelector('#messageArea'+channels[0].id);
		document.querySelector('#messageArea'+channels[0].id).setAttribute('class', 'list-unstyled');
		channelSelectBox.appendChild(docfrag);		
		channelSub.unsubscribe();
	}

}

// Function to change the user's current channel, the idea is to unsubscribe from the current chat channel,
// then subscribe to the new channel using the index of the dropdown selection as the channel id
function changeChannel(){
	chatSubscription.unsubscribe();
	chatSubscription = stompClient.subscribe('/topic/public/' + channelSelectBox.selectedIndex, onMessageReceived);
	channelID = channelSelectBox.selectedIndex;
	messageArea = document.querySelector('#messageArea'+channelID);
		
	// On channel change, set all children of the messageRoom div to hidden EXCEPT for the child that matches the selected channel
	var channelChildren = messageRoom.children;
	for (var i = 0; i < channelChildren.length; i++){
		var channelChild = channelChildren[i];
		if (channelID === i){
			channelChild.setAttribute('class', 'list-unstyled');
		}else{
			channelChild.setAttribute('class', 'hidden');
		}
	}
}

function displayCreateChannel(event){
	alert('yeet');
}