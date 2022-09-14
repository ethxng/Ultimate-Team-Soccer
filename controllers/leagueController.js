let Player = require('../models/player');
let Team = require('../models/team');
let League = require('../models/league');

let async = require('async');
const { body, validationResult } = require('express-validator');
const pw = 'deeznuts';

exports.league_list = function(req, res, next){
    League.find({}).exec(function(err, all_leagues){
        if (err) return next(err);
        res.render('league_list', {title: "All Leagues", all_leagues: all_leagues});
    })
}

exports.league_detail = function(req, res, next){
    async.parallel({
        league: function(callback){
            League.findById(req.params.id).exec(callback);
        },
        all_teams: function(callback){
            Team.find({'league': req.params.id}).exec(callback);
        }
    }, function(err, results){
        if (err) return next(err);
        if (results.league === null){
            var err = new Error('League not found');
            err.status = 404;
            return next(err);
        }
        res.render('league_detail', {title: 'League Detail', league: results.league, all_teams: results.all_teams});
    });
}

exports.league_update_get = function(req, res, next){
    League.findById(req.params.id).exec(function(err, league){
        if (err)    return next(err);
        res.render('league_form', {title: "Update League", league: league});
    });
}

exports.league_update_post = [
    body('league_name', "League name must not be empty").trim().isLength({min: 1, max: 60}).escape(),
    body('country', "Country must not be empty").trim().isLength({min: 1, max: 60}).escape(),
    body('password', "Password must not be empty").trim().isLength({min: 1, max: 60}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let league = new League({
            league_name: req.body.league_name, 
            country: req.body.country, 
            _id: req.params.id
        });
        if (!errors.isEmpty() || req.body.password != pw){
            League.findById(req.params.id).exec(function(err, league){
                if (err)    return next(err);
                if (!errors.isEmpty()){
                    res.render('league_form', {title: "Update League", league: league, errors: errors.array()});
                } else{ // wrong password
                    res.render('league_form', {title: "Update League", league: league, password: false});
                }
            });
        } else {
            // update data
            League.findByIdAndUpdate(req.params.id, league, {}, function(err, updatedLeague){
                if (err) return next(err);
                // Successful - redirect to league detail page.
                res.redirect(updatedLeague.url);
            });
        }
    }
]

exports.league_delete_get = function(req, res, next){
    async.parallel({
        all_players: function(callback){
            Player.find({"league": req.params.id}).exec(callback);
        },
        all_teams: function(callback){
            Team.find({'league': req.params.id}).exec(callback);
        },
        league: function(callback){
            League.findById(req.params.id).exec(callback);
        }
    }, function(err, results){
        if (err) return next(err);
        if (results.league === null){
            res.redirect('/catalog/leagues');
        }
        res.render('league_delete', {title: "Delete League", league: results.league, all_players: results.all_players, all_teams: results.all_teams});
    });
}

exports.league_delete_post = function(req, res, next){
    League.findByIdAndRemove(req.params.id).exec(function(err){
        if (err) return next(err);
        res.redirect('/catalog/leagues');
    })
}

exports.league_create_get = function(req, res, next){
    res.render('league_form', {title: "Create League"});
}

exports.league_create_post = [
    body('league_name', "League name must not be empty").trim().isLength({min: 1, max: 60}).escape(),
    body('country', "Country must not be empty").trim().isLength({min: 1, max: 60}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let league = new League({
            league_name: req.body.league_name,
            country: req.body.country
        });
        if (!errors.isEmpty()){
            // errors spotted while validating
            res.render("league_form", {title: "Create League", league: league, errors: errors.array()});
            return;
        }
        else{
            league.save(function(err) {
                if (err) return next(err);
                // successful, redirect back to that league's page
                res.redirect(league.url);
            });
        }
    }
]