var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var renderHelper = require('../common/render_helper');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;
var utility   = require('utility');
//var _ = require('lodash');

var TransmitSchema = new Schema({
	topic_id: { type: ObjectId },
	transmit_user_id: { type: ObjectId },
	transmit_at:{ type: Date, default: Date.now },
});
TransmitSchema.plugin(BaseModel);
TransmitSchema.index({topic_id: 1, transmit_user_id: 1}, {unique: true});

mongoose.model('Transmit', TransmitSchema);