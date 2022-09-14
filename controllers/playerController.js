let Team = require('../models/team');
let League = require('../models/league');
let Player = require('../models/player');

const { body,validationResult } = require('express-validator');
const async = require('async');
let pw = 'deeznuts';
const fs = require('fs');

exports.index = function(req, res, next){
    Player.find({}).populate('team').populate('league').exec(function(err, all_players){
        res.render('index', {title: 'The Ultimate Squad', error: err, all_players: all_players});
    });
}

exports.player_list = function(req, res, next){
    Player.find({}).populate('team').exec(function(err, all_players){
        if (err) return next(err);
        res.render('player_list', {title: "All of your players", error: err, all_players: all_players});
    });
}

exports.player_detail = function(req, res, next){
    // remember req.params.id that comes with this request
    Player.findById(req.params.id).populate('team').populate('league').exec(function(err, player){
        if (err) return next(err);
        if (player === null){
            var err = new Error('Player not found');
            err.status = 404;
            return next(err);
        }
        // found player, so render
        res.render('player_detail', {title: "Player Detail", player: player });
    });
}

exports.player_update_get = function(req, res, next){
    async.parallel({
        all_teams: function(callback){
            Team.find({}).exec(callback);
        },
        all_leagues: function(callback){
            League.find({}).exec(callback);
        }, 
        player: function(callback){
            Player.findById(req.params.id).populate('team').populate('league').exec(callback);
        }
    }, function(err, results){
        if (err) return next(err);
        if (results.player==null) { // No results.
            var err = new Error('Player not found');
            err.status = 404;
            return next(err);
        }
        res.render('player_form', {title: "Update Player", all_teams: results.all_teams, all_leagues: results.all_leagues, player: results.player});
    })
}

exports.player_update_post = [
    // req will come with a photo, make sure to update in database and in the images folder
    
    body('full_name', 'Full name must not be empty!').trim().isLength({min: 1}).escape(),
    body('age', 'Must be a valid age').trim().isInt({min: 14, max: 100}).escape(),
    body('position', 'Position must not be empty').trim().isLength({ min: 1 }).escape(),
    body('league', "League must not be empty").trim().isLength({ min: 1 }).escape(),
    body('team', "Team must not be empty").trim().isLength({ min: 1 }).escape(),
    body('password', "Password must not be empty").trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
       const errors = validationResult(req);
       let teamId = '';
       for (let i = 0; i < req.body.team.length; i++){
           if (!isNaN(parseInt(req.body.team.charAt(i)))){
               for (let j = i; j < i+24; j++){
                    teamId += req.body.team.charAt(j);
               }
               break;
           }
       }
       let player;
        // get photo if it's available
        if (req.file !== undefined){
            if (req.file.originalname != null){
                console.log(req.file.originalname);
                player = new Player({
                    full_name: req.body.full_name,
                    age: req.body.age,
                    position: req.body.position, 
                    league: req.body.league,
                    team: teamId,
                    photo: req.file.originalname,
                    _id: req.params.id 
                });
            }
        }
        else{
            player = new Player({
                full_name: req.body.full_name,
                age: req.body.age,
                position: req.body.position, 
                league: req.body.league,
                team: teamId,
                _id: req.params.id 
            });
        }
        if (!errors.isEmpty() || req.body.password != pw){
            // errors spotted while validating
            async.parallel({
                all_teams: function(callback){
                    Team.find({}).exec(callback);
                },
                all_leagues: function(callback){
                    League.find({}).exec(callback);
                },
                oldPlayer: function(callback){
                    Player.findById(req.params.id).populate('team').populate('league').exec(callback);
                }
            }, function(err, results){
                if (err) return next(err);
                if (!errors.isEmpty()){
                    res.render('player_form', {title: 'Create Player', all_teams: results.all_teams, all_leagues: results.all_leagues, player: results.oldPlayer, errors: errors.array()});
                } else{
                    // if password is false, pug will render form with message error wrong password
                    res.render('player_form', {title: 'Create Player', all_teams: results.all_teams, all_leagues: results.all_leagues, player: results.oldPlayer, password: false});
                }
            });
            return;
        } else{ // no errors and password is correct
            // using an array for async series, first remove the old picture, then upload new ones, if nescessary
            async.series([
                function(callback){
                    Player.findById(req.params.id).exec(function(err, results){
                        if (err) return next(err);
                        // only remove a photo if both old and new photo exists
                        if (results.photo != undefined && player.photo != undefined){
                            // remove old photo
                            fs.unlink('./public/images/' + results.photo, function(err) {
                                if (err){
                                    callback(err, null);
                                    return;
                                }
                            });
                        }
                        callback(err, null);
                    });
                },
                function(callback){
                    Player.findByIdAndUpdate(req.params.id, player, {}, function(err, newPlayer){
                        if (err) {
                            callback(err, null);
                            return next(err);
                        }
                        // successful update, return to that player's updated detail page
                        res.redirect(newPlayer.url);
                    });
                }
            ], function(err){
                if(err) return next(err);
            });
        }
    }
]

exports.player_delete_get = function(req, res, next){
    Player.findById(req.params.id).populate('team').populate('league').exec(function(err, results){
        if (err)    return next(err);
        if (results == null){
            res.redirect('/catalog/players');
        }
        res.render('player_delete', {title: "Delete Player", player: results});
    });
}

exports.player_delete_post = function(req, res, next){
    // make sure to delete photo in the images folder before actually deleting 
    Player.findByIdAndRemove(req.body.playerid, (err, player) => {
        if (err) return next(err);
        // successful delete - return to all players' page
        if (player.photo != undefined) { // if photo is available, delete
            fs.unlink('./public/images/' + player.photo, function(err) {
                if (err){
                    return next(err);
                }
            });
        }
        res.redirect('/catalog/players');
    }) 
}

exports.player_create_get = function(req, res, next){
    async.parallel({
        all_teams: function(callback){
            Team.find({}).exec(callback);
        },
        all_leagues: function(callback){
            League.find({}).exec(callback);
        }
    }, function(err, results){
        if (err) return next(err);
        res.render('player_form', {title: 'Create Player', all_teams: results.all_teams, all_leagues: results.all_leagues});
    });
}

exports.player_create_post = [
   // validate input
   body('full_name', 'Full name must not be empty!').trim().isLength({min: 1}).escape(),
   body('age', 'Must be a valid age').trim().isInt({min: 14, max: 100}).escape(),
   body('position', 'Position must not be empty').trim().isLength({ min: 1 }).escape(),
   body('league', "League must not be empty").trim().isLength({ min: 1 }).escape(),
   body('team', "Team must not be empty").trim().isLength({ min: 1 }).escape(),

   (req, res, next) => {
       const errors = validationResult(req);
       let teamId = '';
       // extracting the team id from select value
       for (let i = 0; i < req.body.team.length; i++){
           if (!isNaN(parseInt(req.body.team.charAt(i)))){
               for (let j = i; j < i+24; j++){
                    teamId += req.body.team.charAt(j);
               }
               break;
           }
       }
       let player_detail = {
           // this will leave only one white space between words
           full_name: req.body.full_name,
           age: req.body.age,
           position: req.body.position, 
           league: req.body.league,
           team: teamId, 
       }
       // get photo if it's available
       if (req.file !== undefined){
            if (req.file.originalname != null){
                player_detail.photo = req.file.originalname;
            }
       }
       let player = new Player(player_detail);
       if (!errors.isEmpty()){
           // errors spotted while validating. render create GET page again
           async.parallel({
                all_teams: function(callback){
                    Team.find({}).exec(callback);
                },
                all_leagues: function(callback){
                    League.find({}).exec(callback);
                }
            }, function(err, results){
                if (err) return next(err);
                res.render('player_form', {title: 'Create Player', all_teams: results.all_teams, all_leagues: results.all_leagues, player: player, errors: errors.array()});
            });
            return;
       }
       else{
           // data form is valid
           player.save(function(err){
               if (err) return next(err);
               // successful, redirect to that new player's page
               res.redirect(player.url);
           });
       }
   }
];