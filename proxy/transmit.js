var models  = require('../models');
var Transmit    = models.Transmit;
var utility = require('utility');
var uuid    = require('node-uuid');
var logger = require('../common/logger')

exports.transmitAndSave = function (topic_id, transmit_user_id, transmit_at, callback) {
	  var transmit       = new Transmit();
	  transmit.topic_id  = topic_id;
	  transmit.transmit_user_id       = transmit_user_id;
	  transmit.transmit_at = transmit_at;
	  transmit.save(callback);
};

exports.getTopicsIDByUserID= function (query,opt,callback) {
	Transmit.find(query,{},function(err,topicIDs){
		 if (err) {
		      return callback(err);
		    }
		    if (topicIDs.length === 0) {
		      return callback(null, []);
		    }
		    return callback(null, topicIDs);
	});
};
