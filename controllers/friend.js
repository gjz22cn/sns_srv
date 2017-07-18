var validator  = require('validator');
var _          = require('lodash');
var at         = require('../common/at');
var message    = require('../common/message');
var EventProxy = require('eventproxy');
var User       = require('../proxy').User;
var InvitationMessage  = require('../proxy').InvitationMessage;
var Topic      = require('../proxy').Topic;
var Reply      = require('../proxy').Reply;
var config     = require('../config');

/**
 * 好友相关操作
 */

/* 根据用户名查询新的好友列表、新的好友邀请数  Get方式*/
exports.listFriends = function (req, res, next) {
  var name = req.params.name;
  var ep = EventProxy.create();
  ep.fail(next);

  //console.log("currUser：%s", req.session.user.loginname);
  if (name == null || name.length == 0) {
    var data = {ret:1, error:"用户名不能为空", friendsList:[], newInvitations:0};
    res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
    res.end(JSON.stringify(data));
  }
  else {
    User.getUserByLoginName(name, ep.done(function (user) {
      if (user == null || user.length == 0) {
        var data = {ret:1, error:"用户不存在", friendsList:[], newInvitations:0};
        res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
        res.end(JSON.stringify(data));
      }
      else {
        InvitationMessage.getInvitationByUser(user.name, ep.done(function (invitations) {
          var data;
          if (invitations == null || invitations.length == 0)
            data = {ret: 0, friendsList: user.friendsList, newInvitations: 0};
          else
            data = {ret: 0, friendsList: user.friendsList, newInvitations: invitations.length};
          res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
          res.end(JSON.stringify(data));
        }));
     }
    }));
  }
}

/* 根据用户名查询用户是否存在 Post方式 */
exports.search_user = function (req, res, next) {
  var name = req.body.name;
  var ep = EventProxy.create();
  ep.fail(next);

  console.log("param name: %s", name);
  if (name == null || name.length == 0) {
    var data = {ret:1, error:"用户名不能为空"};
    res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
    res.end(JSON.stringify(data));
  }
  else {
    User.getUserByLoginName(name, ep.done(function (user) {
      if (user == null || user.length == 0) {
        var data = {ret:1, error:"用户不存在"};
        res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
        res.end(JSON.stringify(data));
      }
      else
      {
        var data = {ret:0};
        res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
        res.end(JSON.stringify(data));
      }
    }));
  }
}

/* 添加好友（信息） Post方式 */
exports.addInvitationMessage = function (req, res, next) {
  var inviteFrom = null;
  var inviteTo = req.body.name;
  var msg = req.body.msg;

  var ep = EventProxy.create();
  ep.fail(next);

  if (req.session.user == null || req.session.user.length == 0) {
    var data = {ret: 1, error: "当前没有登录用户，不能邀请添加好友！"};
    res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
    res.end(JSON.stringify(data));
  }
  else if (inviteTo == null || inviteTo.length == 0) {
    var data = {ret: 1, error: "被邀请者的用户名为空！"};
    res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
    res.end(JSON.stringify(data));
  }
  else {
    inviteFrom = req.session.user.loginname;

    InvitationMessage.checkInvitation(inviteFrom, inviteTo, ep.done(function (data) {
          if((data != null) && (data.length != 0))
            InvitationMessage.resetHas_readAndAccept(inviteFrom, inviteTo, msg, ep.done('resetHas_readAndAccept'));
          else {
            InvitationMessage.newAndSave(inviteFrom, inviteTo, msg, ep.done(function () {
              var data = {ret: 0};
              res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
              res.end(JSON.stringify(data));
            }));
          }

          ep.all('resetHas_readAndAccept', function(){
            var data = {ret: 0};
            res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
            res.end(JSON.stringify(data));
          })
        }
    ));
  }
}

/* 获取新的好友邀请（信息） Get方式 */
exports.newInvitations = function (req, res, next) {
  var inviteTo = null;
  var newInvitations;
  var ep = EventProxy.create();

  ep.fail(next);

  if (req.session.user == null || req.session.user.length == 0) {
    var data = {ret:1, error:"当前没有登录用户，无法获取新的邀请信息！", invitations:[]};
    res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
    res.end(JSON.stringify(data));
  }
  else
  {
    inviteTo = req.session.user.loginname;

    InvitationMessage.getInvitationByUser(inviteTo, ep.done('getInvitations'));

    ep.all('getInvitations', function (invitations) {

        newInvitations = invitations;
        InvitationMessage.setHasRead(inviteTo, ep.done('retRes'));
    });

    ep.all('retRes', function () {
      var data;
      if (newInvitations == null || newInvitations.length == 0)
        data = {ret:0, invitations:[]};
      else
        data = {ret:0, invitations:newInvitations};

      res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
      res.end(JSON.stringify(data));
    });
  }
}

/* 接受或拒绝好友邀请 Post方式 */
exports.action = function (req, res, next) {
  var inviteTo = null;
  var inviteFrom = req.body.name;
  var action = req.body.action;

  var ep = EventProxy.create();
  ep.fail(next);

  if (req.session.user == null || req.session.user.length == 0) {
    var data = {ret: 1, error: "当前没有登录用户，不能邀请添加好友！"};
    res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
    res.end(JSON.stringify(data));
  }
  else if (inviteFrom == null || inviteFrom.length == 0) {
    var data = {ret: 1, error: "邀请者的用户名为空！"};
    res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
    res.end(JSON.stringify(data));
  }
  else
  {
      inviteTo = req.session.user.loginname;
      InvitationMessage.checkInvitation(inviteFrom, inviteTo, ep.done('setAction'));

      ep.all('setAction', function (data)
      {
        if(data == null || data.length == 0)
        {
          var data = {ret:1, error:"尚无邀请信息！"};
          res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
          res.end(JSON.stringify(data));
        }
        else
        {
          if(action == "accept")
            InvitationMessage.setAction(inviteFrom, inviteTo, true, ep.done('addFriend_inviteFrom'));
          else
            InvitationMessage.setAction(inviteFrom, inviteTo, false, ep.done('addFriend_refuse'));
        }
      });

      ep.all('addFriend_refuse', function () {
          var data = {ret:0};
          res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
          res.end(JSON.stringify(data));
      });

      ep.all('addFriend_inviteFrom', function () {
          User.addFriend(inviteFrom, inviteTo, ep.done('addFriend_inviteTo'));
      });

      ep.all('addFriend_inviteTo', function ()
      {
          User.addFriend(inviteTo, inviteFrom, function()
          {
            var data = {ret:0};
            res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
            res.end(JSON.stringify(data));
          });
      });
  }
}

/* 删除好友 */
exports.deleteFriend = function (req, res, next) {
  var inviteTo = null;
  var inviteFrom = req.body.name;

  var ep = EventProxy.create();
  ep.fail(next);

  if (req.session.user == null || req.session.user.length == 0) {
    var data = {ret: 1, error: "当前没有登录用户，不能邀请添加好友！"};
    res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
    res.end(JSON.stringify(data));
  }
  else if (inviteFrom == null || inviteFrom.length == 0) {
    var data = {ret: 1, error: "邀请者的用户名为空！"};
    res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
    res.end(JSON.stringify(data));
  }
  else {
    inviteTo = req.session.user.loginname;

    User.deleteFriend(inviteFrom, inviteTo, ep.done('deleteFrinend_inviteTo'));

    ep.all('deleteFrinend_inviteTo', function () {
      User.deleteFriend(inviteTo, inviteFrom, function () {
        var data = {ret: 0};
        res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
        res.end(JSON.stringify(data));
      })
    })
  }
}







