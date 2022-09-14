#! /usr/bin/env node

// this file populates some sample data for us
console.log('This script populates some test players, teams, and leagues to your database. Specified database as argument - e.g.: populatedb mongodb+srv://soccer:elephant69@cluster0.2crog.mongodb.net/soccer_players?retryWrites=true&w=majority');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/

var async = require('async');
var Player = require('./models/player');
var Team = require('./models/team');
var League = require('./models/league');

// set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var players = []
var teams = []
var leagues = []

function playerCreate(full_name, age, position, team, league, photo, cb){
    let player_detail = {full_name: full_name, age: age, position: position, team: team, league: league};
    if (photo != false) { // if photo is given
        player_detail.photo = photo;
    }

    let player = new Player(player_detail);
    player.save(function (err) {
        if (err){
            cb(err, null);
            return;
        }
        console.log("New Player: " + player);
        players.push(player);
        cb(null, player);
    });
}

function teamCreate(club_name, coach_name, logo_color, league, cb){
    let team_detail = {club_name: club_name, coach_name: coach_name, logo_color: logo_color, league: league};
    let team = new Team(team_detail);
    team.save(function (err) {
        if (err){
            cb(err, null);
            return;
        }
        console.log("New Team: " + team);
        teams.push(team);
        cb(null, team);
    });
}

function leagueCreate(league_name, country, cb){
    let league_detail = {league_name: league_name, country: country};
    let league = new League(league_detail);
    league.save(function (err) {
        if (err){
            cb(err, null);
            return;
        }
        console.log("New League: " + league);
        leagues.push(league);
        cb(null, league);
    });
}

// create league first, then team, then players
function createLeagues(cb) {
    async.series([
        function(callback){
            leagueCreate("Premier League", "England", callback);
        },
        function(callback) {
            leagueCreate("LaLiga", "Spain", callback);
        },
        function(callback){
            leagueCreate("Serie A", "Italy", callback);
        },
        function(callback) {
            leagueCreate("Bundesliga", "Germany", callback);
        },
        function(callback){
            leagueCreate("Ligue 1", "France", callback);
        },
    ], cb); // optional callback
}

function createTeams(cb){
    async.series([
        function(callback){
            teamCreate("Manchester United", "Ralf Rangnick", "red", leagues[0], callback);
        },
        function(callback){
            teamCreate("Real Madrid", "Carlo Ancelotti", 'white', leagues[1], callback);
        },
        function(callback){
            teamCreate('Juventus', "Massimiliano Allergi", 'black', leagues[2], callback);
        },
        function(callback){
            teamCreate('Barcelona FC', "Xavi", 'darkblue', leagues[1], callback);
        },
        function(callback){
            teamCreate("Borussia Dortmund", "Marco Rose", 'yellow', leagues[3], callback);
        }
    ], cb); // optional callback
}

function createPlayers(cb){
    async.series([
        function(callback){
            playerCreate('Cristiano Ronaldo', 36, "Striker", teams[0], leagues[0], 'cristiano_ronaldo.png', callback);
        }, 
        function(callback){
            playerCreate('Toni Kroos', 32, 'Centre Midfield', teams[1], leagues[1], false, callback);
        }, 
        function(callback){
            playerCreate("Leonardo Bonucci", 34, 'Centre-Back', teams[2], leagues[2], 'leonardo_bonucci.png', callback);
        }, 
        function(callback){
            playerCreate("Ter Stegen", 29, 'Goalkeeper', teams[3], leagues[1], false, callback);
        }
    ], cb) // optional callback
}

async.series([
    createLeagues,
    createTeams,
    createPlayers
], function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Players: '+players);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});