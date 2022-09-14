let getLeague = function(){
    let result = document.getElementById('league');
    return result.value;
}

let choose = document.getElementById('player');
let player_selected = null;

if (choose != null){
    player_selected = JSON.parse(choose.value);
    console.log(player_selected);
}    

let teams = [];
var options = document.getElementById('team').options;
for (let i = 0; i < options.length; i++) {
    console.log(options[i].value);
    let opt = JSON.parse(options[i].value);
    teams.push(opt);
}


function removeAllOptions(){
    let team = document.getElementById('team');
    let options = team.options;
    for (let i = 0; i < options.length; i++) {
        team.remove(i);
        i--;
    }
}
function changeLeagueForUpdatingPlayer(){
    if (player_selected != null)
        document.getElementById('league').value = player_selected[1];
}
function setNameForPlayer(){
    if (player_selected != null){
        document.getElementById('full_name').value = player_selected[3];
    }
}
function setAgeForPlayer(){
    if (player_selected != null){
        document.getElementById('age').value = player_selected[4];
    }
}
// remove all options before render the list again based on the choosen league
// value of team is in the form of an array of size 3: [team._id, team.league._id, team.club_name]
// value of player is in the form of an array of size 5: [player.team._id, player.league._id, player.team.club_name, player.full_name, player.age]
function changeClubBasedOnLeague() {
    // use e.target.value to access the league
    removeAllOptions();
    let leagueId = getLeague().toString();
    console.log(leagueId);
    let team_list = document.getElementById('team');
    for (let i = 0; i < teams.length; i++){
        //console.log((teams[i]).length);
        if (teams[i][1].toString() === leagueId){
            let opt = document.createElement('option');
            opt.value = `["${teams[i][0]}", "${teams[i][1]}"]`;
            opt.textContent = teams[i][2];
            team_list.appendChild(opt);
        }
        if (player_selected != null && teams[i][0].toString() === player_selected[0].toString() && player_selected[1].toString() === leagueId){
            //team_list.value = '{"team" : "' + teams[i].team + '", "league" : "' + teams[i].league + '"}';
            team_list.value = `["${teams[i][0]}", "${teams[i][1]}"]`;
        }
    }
}

// running these functions
setNameForPlayer();
setAgeForPlayer();
changeLeagueForUpdatingPlayer();
changeClubBasedOnLeague();

document.getElementById('league').addEventListener('change', () => {
    changeClubBasedOnLeague();
});

console.log(document.getElementById('full_name').value);
console.log(document.getElementById('age').value);
console.log(document.getElementById('position').value);
