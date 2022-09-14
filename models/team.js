let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let teamSchema = new Schema(
    {
        club_name: {type: String, required: true, minlength: 1, maxlength: 100},
        coach_name: {type: String, required: true, minlength: 1, maxlength: 100}, 
        logo_color: {type: String, required: true, minlength: 1, maxlength: 20, trim: true}, 
        league: {type: Schema.Types.ObjectId, ref: "League", require: true}
    }
);

teamSchema.virtual('url').get(function() {
    return '/catalog/team/' + this._id;
});

module.exports = mongoose.model('Team', teamSchema);