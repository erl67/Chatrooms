var timeoutID;
var timeout = 5000;
var room = 0;
var chats = [];
var button;
var textarea;
var username;
var uid = {{g.user.id}};

document.addEventListener("DOMContentLoaded", function() {
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() { 
		handleRoom(httpRequest)
	};

	httpRequest.open("GET", "/r");
	httpRequest.send();
	function handleRoom(httpRequest) {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				room = httpRequest.responseText;
			}
		}
	}
	
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() { 
		handleUser(httpRequest)
	};
	
	httpRequest.open("GET", "/u");
	httpRequest.send();
	function handleUser(httpRequest) {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				username = httpRequest.responseText;
			}
		}
	}

	button = document.getElementsByTagName("button")[0];
	button.addEventListener("click", sendMsg, true);
	textarea = document.getElementsByTagName("textarea")[0];


	getChats();
	timeoutID = window.setTimeout(poller, timeout);

});

function getChats() {
	var httpRequest = new XMLHttpRequest();

	httpRequest.onreadystatechange = function() { 
		handleChat(httpRequest)
	};

	httpRequest.open("GET", "/chats");
	httpRequest.send();
}

function handleChat(httpRequest) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 200) {
			chats[chats.length] = httpRequest.responseText;
			var updates = chats[chats.length-1] - chats[chats.length-2];
			if (updates > 0) {
				//alert("New Chat length = " + chats[chats.length-1] + " new = " + updates);
				getUpdates(updates);
			} else if (chats.length > 10) {
				chats = [chats[0]];
			}
		}
	}
}

function getUpdates(count) {
	var httpRequest = new XMLHttpRequest();

	httpRequest.onreadystatechange = function() { 
		handleUpdates(httpRequest)
	};

	httpRequest.open("POST", "/updates/" + count); //count
	httpRequest.send();
}

function handleUpdates(httpRequest) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 200) {
			var table = document.getElementById('chat-table');
			var updates = httpRequest.responseText;
			updates = JSON.parse(updates);
			var count = Object.keys(updates).length;

			Object.keys(updates).forEach(function(k){
			    console.log(k + ' - ' + updates[k]);
				var row = table.insertRow(-1);				
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
				cell1.classList.add('text-center');
				cell1.classList.add('w-25');
				alert ("uid" + uid + " " + updates[k].creator)
				if (parseInt(uid) == parseInt(updates[k].creator)) {
					cell1.innerHTML = username;
					row.classList.add('table-primary');
				} else {
					cell1.innerHTML = updates[k].creator;
					row.classList.add('table-secondary');
				}
				cell2.innerHTML = updates[k].message;
				cell2.setAttribute('title', updates[k].created)
			});
			
			var table = document.getElementById('chat-table');

			colorize(['container']);
			colorizeText(['container'], true);
		}
	}
}


function sendMsg() {
	var httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}

	var msg = document.getElementsByTagName("textarea")[0].value;

	httpRequest.onreadystatechange = function() { handleSendMsg(httpRequest, msg) };

	httpRequest.open("POST", "/new_msg");
	httpRequest.setRequestHeader('Content-Type', 'application/json');

	var data = new Object();
	data.msg = textarea.value;
	data = JSON.stringify(data);

	httpRequest.send(data);
}

function handleSendMsg(httpRequest, msg) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 204) {
			//alert(msg);
			textarea.value = "";
			poller();
		} else {
			alert("There was a problem with the post request.");
		}
	}
}

function poller() {
	getChats();
	window.setTimeout(poller, timeout);
}
