var models  = require('../models');
var InvitationMessage = models.InvitationMessage;
var utility = require('utility');
var uuid    = require('node-uuid');

/**
 * 根据用户名查询未读取的好友邀请数
 * @param userName 用户名
 * @param {Function} callback 回调函数
 */
exports.getInvitationByUser = function (userName, callback) {
  if (userName.length === 0) {
    return callback(null, []);
  }
  //InvitationMessage.find({}, callback);
  //console.log("inviteTo：%s", userName);

  InvitationMessage.find({'inviteTo': userName,'has_read': false},{'inviteFrom':1, 'msg':1, '_id':0}, callback);
};

/*
 * 向邀请信息表中添加一条邀请信息
 * @param inviteFrom 发出邀请者的用户名
 * @param inviteTo 被邀请者的用户名
 * @param msg 邀请信息
 * @param {Function} callback 回调函数
* */
exports.newAndSave = function (inviteFrom, inviteTo, msg, callback) {
  var invitation         = new InvitationMessage();
  invitation.inviteTo    = inviteTo;
  invitation.inviteFrom   = inviteFrom;
  invitation.msg        = msg;
  invitation.has_read = false; /* 新添加的邀请信息默认未读 */
  invitation.action = false;   /* 新添加的邀请信息默认拒绝 */
  invitation.save(callback);
};

/*
 * 设置action为 true或false
 * @param inviteFrom 发出邀请者的用户名
 * @param inviteTo 被邀请者的用户名
 * @param action accept或decline
 * @param {Function} callback 回调函数
 * */
exports.setAction = function (inviteFrom, inviteTo, action, callback) {
  InvitationMessage.update({'inviteFrom':inviteFrom, 'inviteTo':inviteTo}, {'$set':{'action':action}},callback);
};

/**
 * 根据邀请者和被邀请者用户名查询是否有对应的邀请信息
 * @param inviteFrom 邀请者用户名
 * @param inviteTo 被邀请者用户名
 * @param {Function} callback 回调函数
 */
exports.checkInvitation = function (inviteFrom, inviteTo, callback) {
  InvitationMessage.find({'inviteTo': inviteTo,'inviteFrom': inviteFrom}, callback);
};

/*
 * 设置has_read为true
 * @param inviteTo 被邀请者的用户名
 * @param {Function} callback 回调函数
 * */
exports.setHasRead = function (inviteTo, callback) {

  console.log("setHasRead inviteTo：%s", inviteTo);
  InvitationMessage.update({'inviteTo':inviteTo}, {'$set':{'has_read':true}}, {multi:true}, callback);
};

/*
 * 重置has_read和accept为false
 * @param inviteFrom 邀请者的用户名
 * @param inviteTo 被邀请者的用户名
 * @param {Function} callback 回调函数
 * */
exports.resetHas_readAndAccept = function(inviteFrom, inviteTo, msg, callback){
  console.log("setHasRead inviteFrom：%s", inviteFrom);
  console.log("setHasRead inviteTo：%s", inviteTo);
  InvitationMessage.update({'inviteFrom':inviteFrom,'inviteTo':inviteTo}, {'$set':{'has_read':false, 'action':false, 'msg':msg, 'create_at':Date.now()}}, {multi:true}, callback);
}