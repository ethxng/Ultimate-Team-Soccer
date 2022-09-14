let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let leagueSchema = new Schema(
    {
        league_name: {type: String, required: true, minlength: 1, maxlength: 60}, 
        country: {type: String, required: true, minlength: 1, maxlength: 60}
    }
);

leagueSchema.virtual('url').get(function() {
    return '/catalog/league/' + this._id;
});

module.exports = mongoose.model('League', leagueSchema);