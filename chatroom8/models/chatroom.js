var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Chatroom = new Schema({
  secret: Boolean,
  users: [String],
  name: String
},{ 
  timestamps: { 
    createdAt: 'created_at'  
  }  
});

module.exports = mongoose.model('Chatroom', Chatroom);
