let Player = require('../models/player');
let League = require('../models/league');
let Team = require('../models/team');

let async = require('async');
const { body, validationResult } = require('express-validator');
const { update } = require('../models/team');
const pw = 'deeznuts';

exports.team_list = function(req, res, next){
    Team.find({}).exec(function(err, all_teams) {
        res.render("team_list", {title: "All Teams", error: err, all_teams: all_teams});
    });
}   

exports.team_detail = function(req, res, next){
    // req.params.id contains team's id
    async.parallel({
        team: function(callback){
            Team.findById(req.params.id).populate('league').exec(callback);
        },
        all_players: function(callback){
            Player.find({'team': req.params.id}).exec(callback);
        }
    }, function(err, results){
        if (err) return next(err);
        if (results.team === null){
            var err = new Error('Team not found');
            err.status = 404;
            return next(err);
        }
        res.render('team_detail', {title: "Team Detail", team: results.team, players: results.all_players});
    })
}

exports.team_update_get = function(req, res, next){
    async.parallel({
        all_leagues: function(callback){
            League.find({}).exec(callback);
        },
        team: function(callback){
            Team.findById(req.params.id).populate('league').exec(callback);
        }
    }, function(err, results){
        if (err) return next(err);
        if (results.team==null) { // No results.
            var err = new Error('Team not found');
            err.status = 404;
            return next(err);
        }
        res.render('team_form', {title: "Update Team", all_leagues: results.all_leagues, team: results.team});
    });
}

exports.team_update_post = [
    // validate input
    body('club_name', "Club name must not be empty").trim().isLength({min: 1, max: 100}).escape(),
    body('coach_name', "Coach name must not be empty").trim().isLength({min: 1, max: 100}).escape(),
    body('logo_color', "Logo color must not be empty").trim().isLength({min: 1, max: 20}).escape(),
    body('league', "League must not be empty").trim().isLength({min: 1}).escape(),
    body('password', "Password must not be empty").trim().isLength({min: 1}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let team = new Team({
            club_name: req.body.club_name,
            coach_name: req.body.coach_name, 
            logo_color: req.body.logo_color, 
            league: req.body.league,
            _id: req.params.id
        });
        if (!errors.isEmpty() || req.body.password != pw){
            async.parallel({
                all_leagues: function(callback){
                    League.find({}).exec(callback);
                },
                team: function(callback){
                    Team.findById(req.params.id).populate('league').exec(callback);
                }
            }, function(err, results){
                if (err) return next(err);
                if (!errors.isEmpty()){
                    res.render('team_form', {title: "Update Team", all_leagues: results.all_leagues, team: results.team, errors: errors.array()});
                } else{
                    res.render('team_form', {title: "Update Team", all_leagues: results.all_leagues, team: results.team, password: false});
                }
            });
        } else{
            Team.findByIdAndUpdate(req.params.id, team, {}, function(err, updatedTeam){
                if (err) return next(err);
                // Successful - redirect to team detail page.
                res.redirect(updatedTeam.url);
            });
        }
    }
]

exports.team_delete_get = function(req, res, next){
    async.parallel({
        all_players: function(callback){
            Player.find({'team': req.params.id}).exec(callback)
        },
        team: function(callback){
            Team.findById(req.params.id).exec(callback);
        }
    }, function(err, results){
        if (err) return next(err);
        if (results.team == null){
            res.redirect('/catalog/teams');
        }
        res.render('team_delete', {title: "Delete team", all_players: results.all_players, team: results.team});
    });
}

exports.team_delete_post = function(req, res, next){
    Team.findByIdAndRemove(req.params.id).exec(function(err){
        if (err) return next(err);
        // successful delete, redirect to all team's page
        res.redirect('/catalog/teams');
    })
}

exports.team_create_get = function(req, res, next){
    League.find({}).exec(function(err, results) {
        if (err) return next(err);
        res.render('team_form', {title: "Create Team", all_leagues: results});
    });
}

exports.team_create_post = [
    // validate input
    body('club_name', "Club name must not be empty").trim().isLength({min: 1, max: 100}).escape(),
    body('coach_name', "Coach name must not be empty").trim().isLength({min: 1, max: 100}).escape(),
    body('logo_color', "Logo color must not be empty").trim().isLength({min: 1, max: 20}).escape(),
    body('league', "League must not be empty").trim().isLength({min: 1}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let team = new Team(
            {
                club_name: req.body.club_name,
                coach_name: req.body.coach_name,
                logo_color: req.body.logo_color, 
                league: req.body.league
            }
        )
        if (!errors.isEmpty()){
            // errors spotted while validating
            League.find({}).exec(function(err, results) {
                if (err) return next(err);
                res.render('team_form', {title: "Create Team", all_leagues: results, team: team, errors: errors.array()});
            });
            return;
        }
        else{
            team.save(function(err){
                if (err) return next(err);
                // successful, redirect to that new team's page
                res.redirect(team.url);
            });
        }
    }
]