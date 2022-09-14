let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let playerSchema = new Schema(
    {
        full_name: {type: String, required: true, minlength: 1, maxlength: 100}, 
        age: {type: Number, required: true, min: 14, max: 100}, 
        position: {type: String, required: true,
        enum: ['Goalkeeper', "Full-Back", 'Wing-Back', 'Centre-Back', 'Sweeper', 'Centre Midfield', 'Defensive Midfield', 'Attacking Midfield', 'Centre Forward', 'Winger', 'Second Striker', 'Striker'],
        default: 'Goalkeeper'
        }, 
        team: {type: Schema.Types.ObjectId, ref: 'Team', required: true}, 
        league: {type: Schema.Types.ObjectId, ref: 'League', required: true}, 
        photo: {type: String} // photo url (optional)
    }
);

playerSchema.virtual('url').get(function() {
    return '/catalog/player/' + this._id;
});

module.exports = mongoose.model('Player', playerSchema);