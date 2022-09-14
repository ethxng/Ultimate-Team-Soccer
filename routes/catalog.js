let express = require("express");
let router = express.Router();
const multer = require('multer');

// for uploading photos
const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './public/images') // this path is relative to current file's position
    },
    filename: function(req, file, callback){
        let filename = file.originalname.toLowerCase().split(' ').join('_');
        callback(null, filename);
    }
});

const upload = multer({
    storage: storage, 
    fileFilter: (req, file, callback) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif"){
            callback(null, true);
        }else{
            callback(null, false);
            return callback(new Error("Allowed only .jpeg, .png, .jpg, and .gif"));
        }
    }
});
// require model controllers
let player_controller = require('../controllers/playerController');
let team_controller = require('../controllers/teamController');
let league_controller = require('../controllers/leagueController');

// Player Routes
// NOTE: middleware goes in order that they were declared (be careful about where to put what!!)
router.get('/', player_controller.index);
router.get('/player/create', player_controller.player_create_get);
router.post('/player/create', upload.single('photo'), player_controller.player_create_post);
// make sure to include Multer express for uploading photos for post update and create
router.get('/player/:id/delete', player_controller.player_delete_get);
router.post('/player/:id/delete', player_controller.player_delete_post);
router.get('/player/:id/update', player_controller.player_update_get);
router.post('/player/:id/update', upload.single('photo'), player_controller.player_update_post);
router.get('/player/:id', player_controller.player_detail);
router.get('/players', player_controller.player_list);


// Team Routes
router.get('/team/create', team_controller.team_create_get);
router.post('/team/create', team_controller.team_create_post);
router.get('/team/:id/update', team_controller.team_update_get);
router.post('/team/:id/update', team_controller.team_update_post);
router.get('/team/:id/delete', team_controller.team_delete_get);
router.post('/team/:id/delete', team_controller.team_delete_post);
router.get('/team/:id', team_controller.team_detail);
router.get('/teams', team_controller.team_list);

// League Routes
router.get('/league/create', league_controller.league_create_get);
router.post('/league/create', league_controller.league_create_post);
router.get('/league/:id/update', league_controller.league_update_get);
router.post('/league/:id/update', league_controller.league_update_post);
router.get('/league/:id/delete', league_controller.league_delete_get);
router.post('/league/:id/delete', league_controller.league_delete_post);
router.get('/league/:id', league_controller.league_detail);
router.get('/leagues', league_controller.league_list);

module.exports = router;