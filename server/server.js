const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    pingInterval: 20000,
    pingTimeout: 10000,
})

const fs = require("fs")
const path = require("path")

app.use(function(req, res, next) {
  res.setHeader('x-debug', 'hit')
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.setHeader('Expires', '-1')
  res.setHeader('Pragma', 'no-cache')
  next();
});

// app.use('/', express.static('~/public_html/'))
// app.use('/tokens/', express.static('~/public_html/tokens/'))
// app.use('/icons/', express.static('~/public_html/icons/'))

// // Serving Client Side

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

for (let page of getAllFiles('/home/societies/evabs/public_html/')) {
    page = page.replace('/home/societies/evabs/public_html','')
    app.get(page, (req, res) => {
        res.sendFile('/home/societies/evabs/public_html' + page)
    })
}

app.get('/reference_sheet', (req, res) => {
    let channel_id = req.query.channel_id
    let edition_id = req.query.edition_id
    if (channel_id in game_states && edition_id) {
        let edition = null
        for (let e of game_states[channel_id].editions) {
            if (e.id == edition_id) {
                edition = e
                break
            }
        }
        if (edition && edition.reference_sheet) {
            // Custom
            if (edition.id in game_states[channel_id].edition_reference_sheets) {
                let pdfData = game_states[channel_id].edition_reference_sheets[edition.id]
                res.writeHead(200, {
                'Content-Length': Buffer.byteLength(pdfData),
                'Content-Type': 'application/pdf'})
                //'Content-disposition': 'attachment;filename=test.pdf',})
                .end(pdfData);
            }
            else {
                res.sendFile(`/home/societies/evabs/public_html/reference_sheets/${edition.id}.pdf`)
            }
        }
    }
})

// Useful functions


// Copy state
function copy(state) {
    let new_state = {}
    if ('night_actions' in state) {
        for (let i in state) {
            if (i != 'night_actions') {
                new_state[i] = state[i]
            }
        }
        new_state['night_actions'] = {}
    }
    else {
        new_state = state
    }
    return JSON.parse(JSON.stringify(new_state))
}

// Emit to all sockets in channel
function channelEmit(channel_id, eventName, msg, emitToHost = true) {
    let state = game_states[channel_id]
    if (state.host_socket_id != null && emitToHost) {
        io.to(state.host_socket_id).emit(eventName, msg)
    }
    for (let player of state.player_info) {
        if (player.socket_id != null) {
            io.to(player.socket_id).emit(eventName, msg)
        }
    }
    for (let spectator of state.spectators) {
        io.to(spectator).emit(eventName, msg)
    }
}

// Censor state
function censorState(state, socket_id) {
    state = copy(state)
    
    delete state.spectators
    delete state.night_actions
    delete state.roles_by_id
    delete state.edition_reference_sheets
    state.group_night_action = {'name' : null, 'data' : {}}
    for (let player of state.player_info) {
        if (player.socket_id != socket_id && state.host_socket_id != socket_id) {
            player.character = null
            player.reminders = []
        }
        player.socket_id = (player.socket_id == null) ? false : true
    }
    state.demon_bluffs = (state.host_socket_id == socket_id) ? state.demon_bluffs : []
    state.host_socket_id = (state.host_socket_id == null) ? false : true
    state.roles = (state.host_socket_id == socket_id) ? state.roles : roles
    
    return state
}

function getCharacterFromID(state, id) {
    if (Object.keys(state.roles_by_id).length == 0) {
        for (let role of state.roles) {
            state.roles_by_id[role.id] = role
        }
    }
    if (id in state.roles_by_id) {
        return state.roles_by_id[id]
    }
    return null
}

// Get player info by seat
function getPlayerBySeat(state, seat) {
    for (let player of state.player_info) {
        if (player.seat == seat) {
            return player
        }
    }
    return null
}

// Get player info by seat_id
function getPlayerBySeatID(state, seat_id) {
    for (let player of state.player_info) {
        if (player.seat_id == seat_id) {
            return player
        }
    }
    return null
}

// Get player info by name
function getPlayerByName(state, name) {
    for (let player of state.player_info) {
        if (player.name == name) {
            return player
        }
    }
    return null
}

// Get player info by socket_id
function getPlayerBySocketID(state, socket_id) {
    for (let player of state.player_info) {
        if (player.socket_id == socket_id) {
            return player
        }
    }
    return null
}

const max_players = 20

// Roles json

var roles = JSON.parse(fs.readFileSync('/home/societies/evabs/public_html/roles.json', 'utf8'));

var editions = JSON.parse(fs.readFileSync('/home/societies/evabs/public_html/editions.json', 'utf8'));

// Game Data, one for each channel id

const game_states = {}

const base_state = {
    'host_socket_id' : null,
    'spectators' : [],
    'night_actions' : {},
    'roles_by_id' : {},
    'edition_reference_sheets' : {},
    'group_night_action' : {
        'name' : null,
        'data' : {}, // seat_id : {'players' : []}
    },
    'next_seat_id' : 0,
    'edition' : 'tb',
    'editions' : copy(editions),
    'roles' : copy(roles),
    'demon_bluffs' : [],
    'player_info' : [],
    'clock_info' : {
        'nominator' : null,
        'nominatee' : null,
        'interval' : 2000, // Milliseconds
        'start_time' : null,
        'active' : false,
        'free' : false,
    },
    'day_phase' : false,
    'nominations_open' : false,
}

const base_player_info = {
    'name' : null,
    'seat' : null,
    'seat_id' : null,
    'socket_id' : null,
    'alive' : true,
    'character' : null,
    'nominated' : false,
    'nominateed' : false,
    'dead_vote' : true,
    'reminders' : [],
    'voting' : false,
    'synced' : true,
}

// Socket Updates

io.on('connection', (socket) => {
    console.log('User Connected: ' + socket.id);
    
    
    // Host connecting
    socket.on('new host', (channel_id) => {
        // Room already taken
        if (channel_id in game_states && game_states[channel_id].host_socket_id != null) {
            socket.emit('new host', false)
        }
        // Room available
        else {
            if (!(channel_id in game_states)) {
                game_states[channel_id] = copy(base_state)
            }
            game_states[channel_id].host_socket_id = socket.id
            socket.emit('new host', censorState(game_states[channel_id], socket.id))
            channelEmit(channel_id, 'host update', true)
        }
    })
    
    // Player connecting
    socket.on('new player', (channel_id) => {
        if (channel_id in game_states) {
            // Send game info
            socket.emit('new player', censorState(game_states[channel_id], socket.id))
            game_states[channel_id].spectators.push(socket.id)
        }
        else {
            socket.emit('new player', false)
        }
    })
    
    // Sit update
    socket.on('sit update', (channel_id, seat) => {
        if (channel_id in game_states) {
            let player = getPlayerBySeat(game_states[channel_id], seat)
            if (player != null) {
                // Seat free
                if (player.socket_id == null) {
                    player.socket_id = socket.id
                    
                    socket.emit('sit update', player.seat_id)
                    
                    if (game_states[channel_id].spectators.includes(socket.id)) {
                        game_states[channel_id].spectators.splice(game_states[channel_id].spectators.indexOf(socket.id), 1)
                    }
                    
                    if (player.character != null) {
                        socket.emit('character update', {'seat_id' : player.seat_id, 'character' : player.character})
                    }
                    
                    // Update players
                    channelEmit(channel_id, 'socket update', {'seat_id' : player.seat_id, 'socket_id' : true})
                }
                // Seat taken
                else {
                    socket.emit('sit update', null)
                }
            }
        }
    })
    
    // Add update
    socket.on('add update', (channel_id, name) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id && !game_states[channel_id].clock_info.active && game_states[channel_id].player_info.length < max_players) {
            let state = game_states[channel_id]
            let player = copy(base_player_info)
            player.seat = state.player_info.length
            player.seat_id = state.next_seat_id
            if (name) {
                // Name available
                if (getPlayerByName(game_states[channel_id], name) == null) {
                    player.name = name
                }
            }
            state.next_seat_id++
            state.player_info.push(player)
            channelEmit(channel_id, 'add update', player)
        }
    })
    
    // Name Update
    socket.on('name update', (channel_id, name_update) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id) {
            let player = getPlayerBySeatID(game_states[channel_id], name_update.seat_id)
            if (player != null) {
                // Name available
                if (getPlayerByName(game_states[channel_id], name_update.name) == null) {
                    player.name = name_update.name
                    channelEmit(channel_id, 'name update', {'seat_id' : player.seat_id, 'name' : player.name})
                }
            }
        }
    })
    
    // Character Update
    socket.on('character update', (channel_id, character_update) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id) {
            let player = getPlayerBySeatID(game_states[channel_id], character_update.seat_id)
            let c = getCharacterFromID(game_states[channel_id], character_update.character)
            if (player != null && (c || !character_update.character)) {
                // If turning into traveler
                if (c && c.team == 'traveler') {
                    player.character = character_update.character || null
                    channelEmit(channel_id, 'character update', {'seat_id' : player.seat_id, 'character' : player.character})
                }
                else {
                    // Use to be a traveler
                    if (player.character && getCharacterFromID(game_states[channel_id], player.character).team == 'traveler') {
                        player.character = character_update.character || null
                        for (let p of game_states[channel_id].player_info) {
                            if (p.socket_id != null && player.socket_id != p.socket_id) {
                                io.to(p.socket_id).emit('character update', {'seat_id' : player.seat_id, 'character' : null})
                            }
                        }
                        for (let spectator of game_states[channel_id].spectators) {
                            io.to(spectator).emit('character update', {'seat_id' : player.seat_id, 'character' : null})
                        }
                    }
                    else {
                        player.character = character_update.character || null
                    }
                    for (let i of [player.socket_id, game_states[channel_id].host_socket_id]) {
                        if (i != null) {
                            io.to(i).emit('character update', {'seat_id' : player.seat_id, 'character' : player.character})
                        }
                    }
                } 
            }
        }
    })
    
    // Alive update
    socket.on('alive update', (channel_id, alive_update) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id) {
            let player = getPlayerBySeatID(game_states[channel_id], alive_update.seat_id)
            if (player != null) {
                player.alive = Boolean(alive_update.alive)
                if (player.alive) {
                    player.dead_vote = true
                }
                channelEmit(channel_id, 'alive update', {'seat_id' : player.seat_id, 'alive' : player.alive}) 
            }
        }
    })
    
    // Edition update
    socket.on('edition update', (channel_id, edition_update) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id) {
            let options = []
            for (let edition of game_states[channel_id].editions) {
                options.push(edition.id)
            }
            if (options.includes(edition_update)) {
                game_states[channel_id].edition = edition_update
                channelEmit(channel_id, 'edition update', game_states[channel_id].edition)
            }
        }
    })
    
    // Edition Reference Sheet Update
    socket.on('reference sheet update', (channel_id, edition_id, reference_sheet) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id) {
            let edition = null
            for (let e of game_states[channel_id].editions) {
                if (e.id == edition_id) {
                    edition = e
                }
            }
            if (edition && !edition.reference_sheet) {
                edition.reference_sheet = Boolean(reference_sheet)
                if (edition.reference_sheet) {
                    game_states[channel_id].edition_reference_sheets[edition.id] = reference_sheet
                    channelEmit(channel_id, 'reference sheet update', {'id' : edition.id, 'reference_sheet' : edition.reference_sheet})
                }
            }
        }
    })
    
    // New Edition update
    socket.on('new edition', (channel_id, edition) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id) {
            edition = {
                'id' : edition.id, 
                'name' : edition.name, 
                'characters' : edition.characters, 
                'icon' : edition.icon, 
                'reference_sheet' : false
            }
            let valid = edition.id && edition.name && edition.characters.constructor == Object && edition.icon
            if (valid) {
                // Check unique
                for (let e of game_states[channel_id].editions) {
                    if (e.id == edition.id || e.name == edition.name) {
                        valid = false
                    }
                }
                if (valid) {
                    let max_counts = {
                        'townsfolk' : 13,
                        'outsider' : 4,
                        'minion' : 4,
                        'demon' : 4,
                        'traveler' : 5,
                    }
                    // Check characters
                    for (let team in edition.characters) {
                        for (let id of edition.characters[team]) {
                            let c = getCharacterFromID(game_states[channel_id], id)
                            if (!c || c.team != team) {
                                valid = false
                            }
                            else {
                                max_counts[team]--
                                if (max_counts[team] < 0) {
                                    valid = false
                                }
                            }
                        }
                        
                    }
                    
                    if (valid) {
                        game_states[channel_id].editions.push(edition)
                        channelEmit(channel_id, 'new edition', edition)
                    }
                }
            }
        }
    })
    
    // Role update
    socket.on('role update', (channel_id, roles) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id) {
            game_states[channel_id].roles = roles
        }
    })
    
    // Open Nominations Update
    socket.on('open nominations update', (channel_id, open_update) => {
        let state = game_states[channel_id]
        if (state && socket.id == state.host_socket_id) {
            if (state.day_phase && open_update != state.nominations_open) {
                state.nominations_open = open_update
                channelEmit(channel_id, 'open nominations update', open_update)
            }
        }
    })
    
    // Seat update
    socket.on('seat update', (channel_id, seat_update) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id && !game_states[channel_id].clock_info.active) {
            let new_state = copy(game_states[channel_id])
            let seats_unused = [...Array(new_state.player_info.length).keys()]
            let to_return = {}

            for (let player of new_state.player_info) {

                if (player.seat_id in seat_update) {
                    player.seat = seat_update[player.seat_id]
                    to_return[player.seat_id] = player.seat
                }

                if (seats_unused.includes(player.seat)) {
                    seats_unused.splice(seats_unused.indexOf(player.seat), 1)
                }
            }

            if (seats_unused.length == 0) {
                game_states[channel_id] = new_state
                channelEmit(channel_id, 'seat update', to_return)
            }
        }
    })
    
    // Reminder update
    socket.on('reminder update', (channel_id, reminder_update) => {
        if (channel_id in game_states && game_states[channel_id].host_socket_id == socket.id) {
            let player = getPlayerBySeatID(game_states[channel_id], reminder_update.seat_id)
            if (player != null && reminder_update.reminders) {
                let new_reminders = []
                for (let r of reminder_update.reminders) {
                    new_reminders.push({'icon' : r.icon, 'text' : r.text})
                }
                player.reminders = new_reminders
            }
        }
    })
    
    // Demon Bluff Update
    socket.on('demon bluff update', (channel_id, demon_bluffs) => {
        if (channel_id in game_states && game_states[channel_id].host_socket_id == socket.id) {
            game_states[channel_id].demon_bluffs = demon_bluffs
        }
    })
    
    // Vote update
    socket.on('vote update', (channel_id, vote_update) => {
        if (channel_id in game_states && game_states[channel_id].clock_info.active) {
            let player = getPlayerBySocketID(game_states[channel_id], socket.id)
            if (player != null) {
                let clock_info = game_states[channel_id].clock_info
                
                // Check if not passed their turn
                let curr_time = (new Date()).getTime()
                let segments = game_states[channel_id].player_info.length
                let position = (segments + player.seat - getPlayerBySeatID(game_states[channel_id], clock_info.nominatee).seat) % segments
                position = position == 0 ? segments : position
                let cut_off = position * clock_info.interval
                if ((clock_info.start_time == null || curr_time - clock_info.start_time < cut_off) && (!(Boolean(vote_update) && !player.alive && !player.dead_vote) || clock_info.free)) {
                    player.voting = Boolean(vote_update)
                    channelEmit(channel_id, 'vote update', {'seat_id' : player.seat_id, 'voting' : player.voting})
                }
            }
        }
    })
    
    // Interval update
    socket.on('interval update', (channel_id, interval_update) => {
        if (channel_id in game_states && game_states[channel_id].host_socket_id == socket.id) {
            // Vote hasn't started
            let clock_info = game_states[channel_id].clock_info
            if (clock_info.start_time == null) {
                clock_info.interval = Number(interval_update)
                channelEmit(channel_id, 'interval update', clock_info.interval)
            }
        }
    })
    
    // Nomination update
    socket.on('nomination update', (channel_id, nomination_update) => {
        if (channel_id in game_states && !game_states[channel_id].clock_info.active && game_states[channel_id].day_phase) {
            let state = game_states[channel_id]
            let clock_info = state.clock_info
            // Valid person doing the nomination
            let nominator = getPlayerBySeatID(state, nomination_update.nominator)
            let nominatee = getPlayerBySeatID(state, nomination_update.nominatee)
            if (nominator != null && nominatee != null && (socket.id == state.host_socket_id || socket.id == nominator.socket_id) && (nominator.alive || nomination_update.free)) {
                // Haven't already nominated/nominateed
                if ((!nominator.nominated && !nominatee.nominateed) || nomination_update.free) {
                    clock_info.nominator = nominator.seat_id
                    clock_info.nominatee = nominatee.seat_id
                    clock_info.active = true
                    clock_info.free = Boolean(nomination_update.free)
                    channelEmit(channel_id, 'nomination update', clock_info)
                }
            }
        }
    })
    
    // Start vote update
    socket.on('start vote update', (channel_id) => {
        if (channel_id in game_states 
                && game_states[channel_id].host_socket_id == socket.id 
                && game_states[channel_id].clock_info.active 
                && game_states[channel_id].day_phase) {
            
            let clock_info = game_states[channel_id].clock_info
            
            // Vote not already started
            if (clock_info.start_time == null) {
                clock_info.start_time = (new Date()).getTime()
                channelEmit(channel_id, 'start vote update')
            }
        }
    })
    
    // Reset vote update
    socket.on('reset vote update', (channel_id) => {
        if (channel_id in game_states 
                && game_states[channel_id].host_socket_id == socket.id 
                && game_states[channel_id].clock_info.active 
                && game_states[channel_id].day_phase) {
            
            let clock_info = game_states[channel_id].clock_info
            // Vote started
            if (clock_info.start_time != null) {
                clock_info.start_time = null
                channelEmit(channel_id, 'reset vote update')
            }
        }
    })
    
    // Finish vote update
    socket.on('finish vote update', (channel_id) => {
        if (channel_id in game_states 
                && game_states[channel_id].host_socket_id == socket.id 
                && game_states[channel_id].clock_info.active 
                && game_states[channel_id].day_phase) {
            
            let state = game_states[channel_id]
            let clock_info = game_states[channel_id].clock_info
            let curr_time = (new Date()).getTime()
            
            // Vote finished
            if (clock_info.start_time != null && (curr_time - clock_info.start_time > clock_info.interval * state.player_info.length)) {
                for (let player of state.player_info) {
                    if (!player.alive && player.dead_vote && player.voting && !clock_info.free) {
                        player.dead_vote = false
                    }
                }
                if (!clock_info.free) {
                    getPlayerBySeatID(state, clock_info.nominator).nominated = true
                    getPlayerBySeatID(state, clock_info.nominatee).nominateed = true
                }
                
                channelEmit(channel_id, 'finish vote update')
            }
            // Vote unfinished
            else {
                channelEmit(channel_id, 'cancel vote update')
            }
            
            // Reset voting
            for (let player of state.player_info) {
                player.voting = false
            }
            
            clock_info.start_time = null
            clock_info.nominatee = null
            clock_info.nominator = null
            clock_info.active = false
            clock_info.free = false
        }
    })
    
    // Phase update
    socket.on('phase update', (channel_id, day_phase) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id && !game_states[channel_id].clock_info.active && Object.getOwnPropertyNames(game_states[channel_id].night_actions).length == 0) {
            let state = game_states[channel_id]
            if (state.day_phase != Boolean(day_phase)) {
                state.day_phase = Boolean(day_phase)
                // Wipe nominations
                for (let player of state.player_info) {
                    player.nominated = false
                    player.nominateed = false
                }
                state.nominations_open = false
                channelEmit(channel_id, 'phase update', state.day_phase)
            }
        }
    })
    
    // Night Action
    socket.on('night action', (channel_id, night_action) => {
        if (channel_id in game_states && !game_states[channel_id].day_phase) {
            if (socket.id == game_states[channel_id].host_socket_id) {
                let player = getPlayerBySeatID(game_states[channel_id], night_action.seat_id)
                if (player != null && player.socket_id != null && !(player.seat_id in game_states[channel_id].night_actions)) {
                    let info = night_action.info
                    if (info != null) {
                        info = {'characters' : info.characters, 'players' : info.players, 'info' : info.info}
                    }
                    let wait_time = ((night_action.players > 0) + (night_action.characters > 0) + Boolean(night_action.grimoire) + Boolean(night_action.confirm) + 1) * night_action.time
                    if (Number.isInteger(wait_time) 
                                && wait_time > 0 
                                && Number.isInteger(night_action.characters) 
                                && Number.isInteger(night_action.players) 
                                && info != null 
                                && (!night_action.group 
                                        || !game_states[channel_id].group_night_action.name 
                                        || game_states[channel_id].group_night_action.name == night_action.name
                                    )
                            ) {
                        io.to(player.socket_id).emit('night action', {
                            'name' : night_action.name, 
                            'time' : night_action.time, 
                            'characters' : night_action.characters, 
                            'players' : night_action.players, 
                            'info' : info,
                            'grimoire' : (night_action.grimoire), // ? censorState(game_states[channel_id], game_states[channel_id].host_socket_id) : null),
                            'confirm' : (night_action.confirm),
                            'group' : Boolean(night_action.group),
                            'player_restrictions' : night_action.player_restrictions,
                            'character_restrictions' : night_action.character_restrictions})
                        game_states[channel_id].night_actions[player.seat_id] = setTimeout(() => {
                                let data = game_states[channel_id].group_night_action.data
                                if (player.seat_id in data) {
                                    delete data[player.seat_id]
                                    io.to(player.socket_id).emit('group night action update', {'name' : null, 'data' : {}})
                                    if (Object.keys(data).length == 0) {
                                        game_states[channel_id].group_night_action.name = null
                                        io.to(game_states[channel_id].host_socket_id).emit('group night action update', {'name' : null, 'data' : {}})
                                    }
                                }
                                delete game_states[channel_id].night_actions[player.seat_id]
                                
                                io.to(game_states[channel_id].host_socket_id).emit('night action', {'seat_id' : player.seat_id, 'name' : night_action.name, 'info' : {'info' : [player.name + ' didn\'t respond', '']}})
                            }, wait_time + 5000) // MAGIC NUMBER
                        
                        if (night_action.group) {
                            if (!game_states[channel_id].group_night_action.name) {
                                game_states[channel_id].group_night_action.name = night_action.name
                            }
                            game_states[channel_id].group_night_action.data[player.seat_id] = {'players' : [], 'characters' : []}
                            for (let seat_id in game_states[channel_id].group_night_action.data) {
                                io.to(getPlayerBySeatID(game_states[channel_id], seat_id).socket_id).emit('group night action update', game_states[channel_id].group_night_action)
                            }
                            if (game_states[channel_id].host_socket_id) {
                                io.to(game_states[channel_id].host_socket_id).emit('group night action update', game_states[channel_id].group_night_action)
                            }
                        }
                    }
                }
                else {
                    io.to(game_states[channel_id].host_socket_id).emit('night action', {'seat_id' : player.seat_id, 'name' : night_action.name, 'info' : {'info' : ['That player doesn\'t exist or is already handling a night action', '']}})
                }
            }
            else if (getPlayerBySocketID(game_states[channel_id], socket.id) != null) {
                let player = getPlayerBySocketID(game_states[channel_id], socket.id)
                if (player.seat_id in game_states[channel_id].night_actions) {
                    clearTimeout(game_states[channel_id].night_actions[player.seat_id])
                    
                    let data = game_states[channel_id].group_night_action.data
                    if (player.seat_id in data) {
                        delete data[player.seat_id]
                        io.to(player.socket_id).emit('group night action update', {'name' : null, 'data' : {}})
                        if (Object.keys(data).length == 0) {
                            game_states[channel_id].group_night_action.name = null
                            io.to(game_states[channel_id].host_socket_id).emit('group night action update', {'name' : null, 'data' : {}})
                        }
                    }
                    
                    delete game_states[channel_id].night_actions[player.seat_id]
                    
                    if (night_action.info != null && night_action.name != null && night_action.seat_id != null) {
                        io.to(game_states[channel_id].host_socket_id).emit('night action', night_action) // TODO Bad Security?
                    }
                    else {
                        io.to(game_states[channel_id].host_socket_id).emit('night action', {'seat_id' : player.seat_id, 'name' : night_action.name, 'info' : {'info' : ['The player didn\'t respond correctly', '']}})
                    }
                }
            }
        }
    })
    
    // Group Night Action Update
    socket.on('group night action update', (channel_id, players) => {
        if (channel_id in game_states) {
            let player = getPlayerBySocketID(game_states[channel_id], socket.id)
            if (player.seat_id in game_states[channel_id].night_actions) {
                let data = game_states[channel_id].group_night_action.data
                if (player.seat_id in data) {
                    data[player.seat_id].players = players
                    for (let seat_id in data) {
                        io.to(getPlayerBySeatID(game_states[channel_id], seat_id).socket_id).emit('group night action update', game_states[channel_id].group_night_action)
                    }
                    if (game_states[channel_id].host_socket_id) {
                        io.to(game_states[channel_id].host_socket_id).emit('group night action update', game_states[channel_id].group_night_action)
                    }
                }
            }
        }
    })
    
    // Reveal Grimoire
    socket.on('reveal grimoire', (channel_id, state) => {
        channelEmit(channel_id, 'reveal grimoire', state, false)
    })
    
    // Reset
    socket.on('reset', (channel_id) => {
        if (channel_id in game_states) {
            // Give total info
            let state = game_states[channel_id]
            socket.emit('reset', censorState(state, socket.id))
        }
    })
    
    // Remove update
    socket.on('remove update', (channel_id, seat_id) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id && !game_states[channel_id].clock_info.active) {
            let state = game_states[channel_id]
            let player = getPlayerBySeatID(state, seat_id)
            if (player != null) {
                channelEmit(channel_id, 'remove update', seat_id)
                state.player_info.splice(state.player_info.indexOf(player), 1)
                for (let i = player.seat+1; i <= state.player_info.length; i++) {
                    let t = getPlayerBySeat(state, i)
                    t.seat--
                }
            }
        }
    })
    
    // Kick update
    socket.on('kick update', (channel_id, seat_id) => {
        let player = getPlayerBySeatID(game_states[channel_id], seat_id)
        if (channel_id in game_states && (socket.id == game_states[channel_id].host_socket_id || (player != null && player.socket_id == socket.id))) {
            if (player != null && player.socket_id != null) {
                channelEmit(channel_id, 'kick update', seat_id)
                player.socket_id = null
            }
        }
    })
    
    // Host Leave
    socket.on('host leave', (channel_id) => {
        if (channel_id in game_states && (socket.id == game_states[channel_id].host_socket_id)) {
            game_states[channel_id].host_socket_id = null
            channelEmit(channel_id, 'host update', false)
        }
    })
    
    // Game finish
    socket.on('finish', (channel_id) => {
        if (channel_id in game_states && socket.id == game_states[channel_id].host_socket_id) {
            channelEmit(channel_id, 'finish')
            delete game_states[channel_id]
        }
    })
    
    // Disconnect
    socket.on('disconnect', () => {
        console.log('User Disconnected: ' + socket.id)
        for (let channel_id in game_states) {
            if (game_states[channel_id].host_socket_id == socket.id) {
                game_states[channel_id].host_socket_id = null
                channelEmit(channel_id, 'host update', false)
            }
            
            let player = getPlayerBySocketID(game_states[channel_id], socket.id)
            if (player != null) {
                player.socket_id = null
                channelEmit(channel_id, 'kick update', player.seat_id)
            }
            if (game_states[channel_id].spectators.includes(socket.id)) {
                game_states[channel_id].spectators.splice(game_states[channel_id].spectators.indexOf(socket.id), 1)
            }
        }
    })
})

// Listen
console.log('Server Loaded')
// server.listen('~/myapp/web.sock')
server.listen('40457')