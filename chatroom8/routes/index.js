var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');
var Chatroom = require('../models/chatroom');
var Message = require('../models/message');
var fse = require('fs-extra');
var path = require('path');

var exec = require('child_process').exec; 

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Chatroom 8', user: req.user, error: req.session.error });
});

router.get('/register', function(req, res) {
      res.render('register', {title:'Chatroom 8'});
});

router.post('/register', function(req, res) {
  Account.register(
    new Account({ username : req.body.username }),
    req.body.password, 
    function(err, account) {
      if (err) {
        return res.render('register', { title:'Chatroom 8',account : account, error: "ID existed" });
      }
      passport.authenticate('local')(req, res, function () {
        req.session.save(function (err) {
          if (err) {
            return next(err);
          }
          res.redirect('/');
        });
      });
    }
  ); // Account.register
});

router.get('/login', function(req, res) {
  res.render('login', {title:'Chatroom 8', user : req.user  });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  console.log(req.user.username ,"logs in.")
  res.redirect('/');
});

router.get('/rooms', function(req, res) {
  console.log("User ", req.user.username, "finds own rooms!!!!!!!!!!!!")
  Chatroom.find({ users: req.user.username }, function(err, rooms) {
    if (err) {
      res.status(500)
      return console.log("Chatroom loading error:", err)
    }
    res.send(rooms)
  });
});

// req.body ::
//    users: target user that should be with req.user to create room.
//    roomid: chat room name.
router.post('/rooms/new', function(req, res) {
  console.log("hwwwwwwww ", req.user, "->", req.body)
  req.body.users.push(req.user.username);

  Account.find({'username': {$in: req.body.users}}, function(err, users) {
    if (err) {
      res.status(500)
      return console.log("Error loading target users:", err)
    }
    // Only username is needed.
    users = users.map(x => x.username)

    console.log("Targets:", users)
    var room = new Chatroom({
      secret: req.body.secret,
      users: users,
      name: req.body.roomid
    })
    room.save(function(err) {
      if (err) {
        //res.status(500)
        return console.log("Error creating chatroom:", err)
      }
      res.json(room)
    })
  })
});

router.get('/friends', function(req, res) {
  console.log("User ", req.user.username, "finds own friends")
  Account.find({ username: req.user.username }, function(err, user) {
    if (err) {
      res.status(500)
      return console.log("friend-list loading error:", err)
    }
    target_user = user[0]
    console.log('User info' , target_user)
    res.send(target_user)
  });

});

// req.body ::
//    friend : to add friend
router.post('/friends/new', function(req, res) {
  console.log("friend to add ", req.user, "->", req.body)
  var info // for alert in public/index.js

  Account.findOne({ username: req.body.friend }, function(err, friend) {
    if (err) {
      //res.status(500)
      return console.log("friend loading error:", err)
    }
    console.log(friend)

    if (friend) {  // friend exists, else friend == null
      var friend_name = friend.username
      Account.findOne({ username: req.user.username }, function(err, user) {
        if (err) {
          res.status(500)
          return console.log("user loading error:", err)
        }
        var new_friend_list = user.friend_list
        if (new_friend_list.indexOf( friend_name ) < 0){
            new_friend_list.push(friend_name)
            info = 'Successfully add friend : ' + friend_name
        }
        else {
          info = 'friend : ' + friend_name + ' already exist!!'
        }
        user.friend_list = new_friend_list

        user.save(function (err){
          if (err) {
            //res.status(500)
            return console.log("Error adding friend:", err)
          }
          //res.json(user)
          res.json(info)
        });
      });
    }
    else {
      // no such user
      info = 'No such user : ' + req.body.friend + ' !!!'
      res.json(info)
    }
  });
});

// req.body ::
//    friend : to delete friend
router.post('/friends/delete', function(req, res) {
  console.log("friend to delete ", req.user, "->", req.body)

  var friend_name = req.body.friend
  var info // for alert in public/index.js
  Account.findOne({ username: req.user.username }, function(err, user) {
    if (err) {
      res.status(500)
      return console.log("user loading error:", err)
    }
    var new_friend_list = user.friend_list
    var index = new_friend_list.indexOf(friend_name);
    if (index < 0){
        // no such friend
        info = 'No such friend : ' + friend_name + ' !!!'
    }
    else {
       new_friend_list.splice(index, 1);
       info = 'Successfully delete friend : ' + friend_name
    }
    user.friend_list = new_friend_list

    user.save(function (err){
      if (err) {
        //res.status(500)
        return console.log("Error adding friend:", err)
      }
      //res.json(user)
      res.json(info)
    });
  });
});




router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});

router.post('/payload', function(req, res) {
  console.log("Get new repo push:", req.body.head_commit)
  exec('/usr/bin/git pull origin master', function(err, stdout, stderr){
    if (err) return err;
    console.log(stdout);
    res.status(200).send("Updated!"+stdout)
  });
});

router.post('/file', function(req, res) {
    console.log(req.files);
    if (!(req.files.fileToUpload)) {
      res.status(200).send([]);
      return console.log("No file!")
    }
    var len = req.files.fileToUpload.length;
    var paths = [];
    // Only one file will have no length
    if (typeof len === 'undefined' || !len) {
        var source = req.files.fileToUpload.file;
        var dest = global.appRoot + '/save/' + path.basename(source);
        var dest2 = global.appRoot + '/public/' + path.basename(source);
        fse.move(source, dest, function(err){
            if (err) return console.error(err)
            console.log("success!");
        });
        paths.push(path.basename(source));
        fse.move(source, dest2, function(err){
            if (err) return console.error(err)
            console.log("success!");
        });
    } else { 
      console.log("Multiple files!")
      for(var i=0; i<len; i++){
          var source = req.files.fileToUpload[i].file;
          var dest = global.appRoot + '/save/' + path.basename(source);
          fse.move(source, dest, function(err){
              if (err) return console.error(err)
              console.log("success!");
          });
          paths.push(path.basename(source));
      }
    }
    console.log("paths", paths);
    res.status(200).send(paths);
});
  

module.exports = router;
