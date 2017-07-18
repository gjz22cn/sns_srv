var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var InvitationMessageSchema = new Schema({
  inviteFrom: { type: String },                         /* 邀请者name */
  inviteTo: { type: String },                           /* 被邀请者name */
  create_at: { type: Date, default: Date.now },        /* 添加时间 */
  msg: { type: String },                                 /* 邀请信息 */
  action: { type: Boolean, default: false },          /* 同意为true,拒绝为false */
  has_read: { type: Boolean, default: false }        /* 消息已读为true,未读为false */
});
InvitationMessageSchema.plugin(BaseModel);
//InvitationMessageSchema.index({master_id: 1, has_read: -1, create_at: -1});
InvitationMessageSchema.index({inviteFrom: 1,inviteTo: 1}, {unique: true});

mongoose.model('InvitationMessage', InvitationMessageSchema);
