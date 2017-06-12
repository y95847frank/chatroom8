function reloadrooms() {
  if (!document.getElementById('roomlist')) {
    console.log("Not login yet.")
    return
  }
  console.log("reload room!");
  $.get('/rooms', function(data) {
    $('#roomlist').empty()
    console.log(data);
    var k = ''
    var i = 0
    data.forEach(function(room) {
      console.log(room)
      
      room.users.forEach(function(u){
          
          if (k.indexOf(u) < 0){
           $('#onlinelist').append('<font color="#b35900"> '+u+' </font>')
           k += u
           k += ' '
          }
      })
      
      $('#roomlist').append(
        '<div class="room-box"><a href="/message/'+room._id+'">'+room.name+'</a></div>'
      )
    })
  })
}

$(document).ready(function() {
  reloadrooms();
})

function createProom() {
  var name = prompt("Private room name plz:")
  if (name === null) {  // User cancelled creating room.
    return;
  } else if (name == '') {
    alert("No empty room name!!!")
    return;
  } else if (!(/^[a-zA-Z0-9- ]*$/.test(name))) {
    alert("Only english and number are acceptable.");
    return;
  }

  var index = 0;
  var list = [];
  var curuser = "";
  while (true) {
    var curuser = prompt(
      "Invite user #"+index+" to join chat! "+
      "(empty string for end of user list)"
    )
    if (curuser === null) {
      console.log("User cancelled creating room.")
      return;
    } else if (curuser == "") {
      break;
    }
    list.push(curuser)
    index += 1;
  }
  
  var b = 1;
  console.log("Room:", name)
  console.log("Users:", list)
  console.log("Secret:", b)
  
  $.ajax({
    type: 'POST',
    url: '/rooms/new',
    data: JSON.stringify({secret: b, users: list, roomid: name}), // or JSON.stringify ({name: 'jonas'}),
    success: function(data) {
      console.log(data)
      reloadrooms()
    },
    contentType: "application/json",
    dataType: 'json'
  });
}

function createroom() {
  var name = prompt("Room name plz:")
  if (name === null) {  // User cancelled creating room.
    return;
  } else if (name == '') {
    alert("No empty room name!!!")
    return;
  } else if (!(/^[a-zA-Z0-9- ]*$/.test(name))) {
    alert("Only english and number are acceptable.");
    return;
  }

  var index = 0;
  var list = [];
  var curuser = "";
  while (true) {
    var curuser = prompt(
      "Invite user #"+index+" to join chat! "+
      "(empty string for end of user list)"
    )
    if (curuser === null) {
      console.log("User cancelled creating room.")
      return;
    } else if (curuser == "") {
      break;
    }
    list.push(curuser)
    index += 1;
  }
  
  var b = 0;
  console.log("Room:", name)
  console.log("Users:", list)
  console.log("Secret:", b)
  
  $.ajax({
    type: 'POST',
    url: '/rooms/new',
    data: JSON.stringify({secret: b, users: list, roomid: name}), // or JSON.stringify ({name: 'jonas'}),
    success: function(data) {
      console.log(data)
      reloadrooms()
    },
    contentType: "application/json",
    dataType: 'json'
  });
}
