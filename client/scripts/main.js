const game = document.getElementById('game')
const game_menu = document.getElementById('gameMenu')
const tokens = document.getElementById('tokens')
const names = document.getElementById('names')
const host_menu = document.getElementById('hostMenu')
const player_menu = document.getElementById('playerMenu')
const death_tokens = document.getElementById('deathTokens')
const clock = document.getElementById('clock')
const hands = document.getElementById('hands')
const clock_buttons = document.getElementById('clockButtons')
const player_clock_buttons = document.getElementById('playerClockButtons')
const host_clock_buttons = document.getElementById('hostClockButtons')
const day_phase = document.getElementById('dayPhase')
const info = document.getElementById('info')
const add_player = document.getElementById('addPlayer')
const finish_game = document.getElementById('finishGame')
const cancel_select = document.getElementById('cancelSelect')
const reset_game = document.getElementById('resetGame')
const yes_votes = document.getElementById('yesVotes')
const no_votes = document.getElementById('noVotes')
const socket_icons = document.getElementById('socketIcons')
const night_action_pendings = document.getElementById('nightActionPendings')
const dead_votes = document.getElementById('deadVotes')
const sync_characters = document.getElementById('syncCharacters')
const reminders = document.getElementById('reminders')
const token_menu = document.getElementById('tokenMenu')
const choose_characters = document.getElementById('chooseCharacters')
const choose_fabled = document.getElementById('chooseFabled')
const current_edition = document.getElementById('currentEdition')
const change_edition = document.getElementById('changeEdition')
const change_phase = document.getElementById('changePhase')
const reminder_menu = document.getElementById('reminderMenu')
const shuffle_players = document.getElementById('shufflePlayers')
const leave_game = document.getElementById('leaveGame')
const host_connected = document.getElementById('hostConnected')
const channel_ID = document.getElementById('channelID')
const character_split = document.getElementById('characterSplit')
const alive_vote_info = document.getElementById('aliveVoteInfo')
const clock_vote_info = document.getElementById('clockVoteInfo')
const night_action_menu = document.getElementById('nightActionMenu')
const fabled_demon_bluffs_HUD = document.getElementById('fabledDemonBluffsHUD')
const fabled_tokens = document.getElementById('fabled')
const demon_bluffs = document.getElementById('demonBluffs')
const night_reminders = document.getElementById('nightReminders')
const square = document.getElementById('square')
const non_square = document.getElementById('nonSquare')
const info_HUD = document.getElementById('infoHUD')
const action_HUD = document.getElementById('actionHUD')
const info_hover_box = document.getElementById('infoHoverBox')
const open_reference_sheet = document.getElementById('openReferenceSheet')
const log_status = document.getElementById('logStatus')
const change_log_status = document.getElementById('changeLogStatus')
const change_background_image = document.getElementById('changeBackgroundImage')
const alert_box = document.getElementById('alertBox')
const game_log = document.getElementById('gameLog')
const current_ping = document.getElementById('currentPing')
const edition_menu = document.getElementById('editionMenu')
const edition_icon = document.getElementById('editionIcon')
const reveal_grimoire = document.getElementById('revealGrimoire')
const nomination_status = document.getElementById('nominationStatus')
const change_nomination_status = document.getElementById('changeNominationStatus')
const urlParams = new URLSearchParams(window.location.search);
const max_players = 20
const max_new_fabled_per_edition = 5
const max_reminders = 5
const log_status_count = 4
const deselected_opacity = 0.5
const created_night_actions = {}
const roles_by_id = {}
const website_url = 'https://evabs.soc.srcf.net'
const base_roles = []
window.fetch(website_url + '/json/roles.json').then(x => x.json()).then(x => {for (let role of x) {base_roles.push(role)}})
const base_editions = []
window.fetch(website_url + '/json/editions.json').then(x => x.json()).then(x => {for (let edition of x) {base_editions.push(edition)}})
const base_fabled = []
window.fetch(website_url + '/json/fabled.json').then(x => x.json()).then(x => {for (let fabled of x) {base_fabled.push(fabled)}})
const socket = io(website_url, {autoConnect: false})
Notification.requestPermission()
var size = Math.min(window.innerWidth, window.innerHeight)
var game_state = {
    'host_socket_id' : null,
    'log_status' : 0,
    'edition' : 'tb',
    'roles' : [],
    'editions' : [],
    'fabled' : [],
    'fabled_in_play' : [],
    'group_night_action' : [null, []],
    'demon_bluffs' : [],
    'player_info' : [],
    'clock_info' : {
        'nominator' : null,
        'nominatee' : null,
        'interval' : 2000, // Milliseconds
        'start_time' : null,
        'active' : false,
    },
    'day_phase' : false,
    'phase_counter' : 0,
    'nominations_open' : false,
}

var day_bg_image = 'url("assets/other/day.png")'
var night_bg_image = 'url("assets/other/night.jpg")'

var latency = null
const manual_ping = {
    'time' : null,
    'timeout' : true,
}
var client_type = null // 0 Player, 1 Client
var your_seat_id = null
var channel_id = null
var token_click_type = 0 // 0 Menu, 1 Sit, 2 Nominate, 3 Move Player, 4 Swap Seats, 5 Night Action
var token_selected_seat_id = null
var token_menu_info = {
    'type' : 0, // 0 Character Select, 1 General Select, 2 Night Choice
    'choices' : 1, // Number of choices
    'valid_teams' : [], // Empty is all - travelers / townsfolk / outsiders / minions / demons
    'active' : false, // Active or not
    'selected' : [], // Tokens selected
    'out_of_play' : false, // Only out of play
}

var fabled_demon_bluffs_HUD_focus = null

const default_night_action = [
    {'name' : 'Generic Night Info', 'info' : '<>'},
    {'name' : 'Alignment Change', 'info' : 'You are now <>'}
]

const alert_box_info = [] // Example item: {'text' : 'This is an alert', 'func' : () => {return 'Clicked!'}}

var night_action_info = {
    'base_time' : 15000,
    'time' : 0,
    'timed_out' : false,
    'name' : null,
    'start_time' : null,
    'in_players' : 0,
    'in_characters' : 0,
    'players' : [],
    'characters' : [],
    'info' : [],
    'confirm' : null,
    'player_restrictions' : [],
    'character_restrictions' : [],
    'grimoire' : false,
    'group' : false,
    'to_send_in_players' : 0,
    'to_send_in_characters' : 0,
    'seat_id' : your_seat_id,
    'func' : () => {
        night_action_info.start_time = null
        if (!client_type || getPlayerBySeatID(night_action_info.seat_id).socket_id) {
            
            let to_send = {
                'timed_out' : night_action_info.timed_out,
                'name' : night_action_info.name,
                'players' : Number(night_action_info.to_send_in_players),
                'characters' : Number(night_action_info.to_send_in_characters),
                'player_restrictions' : night_action_info.player_restrictions,
                'character_restrictions' : night_action_info.character_restrictions,
                'grimoire' : night_action_info.grimoire ? {'player_info' : game_state.player_info, 'demon_bluffs' : game_state.demon_bluffs} : null,
                'group' : Boolean(night_action_info.group),
                'time' : night_action_info.base_time, 
                'seat_id' : night_action_info.seat_id,
                'confirm' : night_action_info.confirm,
                'info' : {
                    'players' : night_action_info.players, 
                    'characters' : night_action_info.characters, 
                    'info' : (client_type || night_action_info.confirm == null ? night_action_info.info : ["The Confirm Response was <>", night_action_info.confirm])
                }
            }
            // Only send if had info in or is host
            let msg = getLogNightActionStyle(`Sent Night Action to ${getLogPlayerStyle(client_type ? getPlayerBySeatID(night_action_info.seat_id).name : 'The Host')}:<br>` + nightAlert(to_send, true))
            if (client_type) {
                getPlayerBySeatID(to_send.seat_id).night_action = msg
            }
            else if (game_state.log_status < 2 && (to_send.info.players.length > 0 || to_send.info.characters.length > 0 || to_send.info.info.length > 0)) {
                appendLog(msg)
            }   
            
            socket.emit('night action', channel_id, to_send)
        }
        else {
            alert_box_info.push({'text' : 'That player is not connected'})
            alert_box.check()
        }
        night_action_info.players = []
        night_action_info.characters = []
        reDrawTokens()
    }
}

const player_split = [
  {"townsfolk": 3, "outsider": 0, "minion": 1, "demon": 1},
  {"townsfolk": 3, "outsider": 1, "minion": 1, "demon": 1},
  {"townsfolk": 5, "outsider": 0, "minion": 1, "demon": 1},
  {"townsfolk": 5, "outsider": 1, "minion": 1, "demon": 1},
  {"townsfolk": 5, "outsider": 2, "minion": 1, "demon": 1},
  {"townsfolk": 7, "outsider": 0, "minion": 2, "demon": 1},
  {"townsfolk": 7, "outsider": 1, "minion": 2, "demon": 1},
  {"townsfolk": 7, "outsider": 2, "minion": 2, "demon": 1},
  {"townsfolk": 9, "outsider": 0, "minion": 3, "demon": 1},
  {"townsfolk": 9, "outsider": 1, "minion": 3, "demon": 1},
  {"townsfolk": 9, "outsider": 2, "minion": 3, "demon": 1}
]

// Get player info by seat_id
function getPlayerBySeatID(seat_id) {
    for (let player of game_state.player_info) {
        if (player.seat_id == seat_id) {
            return player
        }
    }
    return null
}

// Get player info by seat
function getPlayerBySeat(seat) {
    for (let player of game_state.player_info) {
        if (player.seat == seat) {
            return player
        }
    }
    return null
}

function getPlayerByCharacter(character) {
    for (let player of game_state.player_info) {
        if (player.character == character) {
            return player
        }
    }
    return null
}

function getTeamIDs(edition, team, out_of_play = false) {
    let ids = []
    if (team == 'extra') {
        ids = [null]
    }
    else {
        let e = getEditionFromID(edition)
        if (e && e.characters[team]) {
            ids = JSON.parse(JSON.stringify(e.characters[team]))
        }
    }
    
    if (out_of_play) {
        let in_play = []
        for (let p of game_state.player_info) {
            if (p.character && !in_play.includes(p.character)) {
                in_play.push(p.character)
            }
        }
        
        for (let i=ids.length-1; i >= 0; i--) {
            if (in_play.includes(ids[i])) {
                ids.splice(i, 1)
            }
        }
    }
    
    return ids
}

function getScopedNightActions(c) {
    let to_return = []
    let edition = getEditionFromID(game_state.edition)
    if (edition) {
        for (let team in edition.characters) {
            for (let id of edition.characters[team]) {
                let role = getCharacterFromID(id)
                if (role.nightActionsScoped) {
                    for (let a of role.nightActionsScoped) {
                        let team_restrictions = false
                        let r = a.scopeRestrictions || []
                        for (let i of ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']) {
                            if (r.includes(i)) {
                                team_restrictions = true
                                break
                            }
                        }
                        
                        if (!team_restrictions || (c != null && a.scopeRestrictions.includes(c.team))) {
                            if (a.scope == 'global') {
                                to_return.push(a)
                            }
                            else if (a.scope == 'local') {
                                if (getPlayerByCharacter(role.id) != null) {
                                    to_return.push(a)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return to_return
}

function getFabledFromID(id) {
    for (let f of base_fabled.concat(game_state.fabled)) {
        if (f.id == id) {
            return f
        }
    }
    return null
}

function getCharacterFromID(id) {
    if (Object.keys(roles_by_id).length == 0) {
        for (let role of base_roles.concat(game_state.roles)) {
            roles_by_id[role.id] = role
        }
    }
    if (id in roles_by_id) {
        return roles_by_id[id]
    }
    return null
}

function getEditionFromID(id) {
    for (let e of base_editions.concat(game_state.editions)) {
        if (e.id == id) {
            return e
        }
    }
    return null
}

function getEditionFromName(name) {
    for (let e of base_editions.concat(game_state.editions)) {
        if (e.name == name) {
            return e
        }
    }
    return null
}


function getIconPath(character) {
    let c = getCharacterFromID(character)
    if (!c) {
        c = getFabledFromID(character)
    }
    if (c) {
        if (c.icon) {
            return c.icon
        }
        else {
            return `assets/iconAssets/${c.id}.png`
        }
    }
    else if (character) {
        return `assets/iconAssets/${character}.png`
    }
    else {
        return ""
    }
}

function nightAlert(night_action, reverse_name = false) {
    let msg = ''
    let types = ['Info', 'Players', 'Characters']
    if (night_action.timed_out) {
        msg += 'Auto Response from Client<br>'
    }
    if (client_type && !reverse_name || !client_type && reverse_name) {
        msg += getLogPlayerStyle(getPlayerBySeatID(night_action.seat_id).name) + ' says: '
    }
    else {
        msg += getLogPlayerStyle('The Host') + ' says: '
    }
    
    msg += night_action.name + '<br>'
    let info = night_action.info
    for (let name of types) {
        let t = name.toLowerCase()
        if (info[t] && info[t].length > 0) {
            msg += ((info[t].length == 1 && name != 'Info') ? name.slice(0, -1) : name) + ': '
            if (name == 'Info') {
                msg += info[t][0].replace(/<>/, info[t][1]) + ', '
            }
            else if (name == 'Players') {
                for (let i of info[t]) {
                    msg += getLogPlayerStyle(getPlayerBySeatID(i).name) + ', '
                }
            }
            else if (name == 'Characters') {
                for (let i of info[t]) {
                    msg += getLogCharacterStyle(getCharacterFromID(i).name) + ', '
                }
            }
            msg = msg.slice(0, -2) + '<br>'
        }
    }
    if (msg.length > 0) {
        msg = msg.slice(0, -4)
    }

    return msg
}

function clockAnimation() {
    if (game_state.clock_info.start_time != null) {
        let progress = Math.min(1, ((new Date()).getTime() - game_state.clock_info.start_time) / (game_state.player_info.length * game_state.clock_info.interval))
        if (progress < 1) {
            window.requestAnimationFrame(clockAnimation)
        }
    }
    reDrawClock()
}

function nightActionAnimation() {
    if (night_action_info.start_time != null) {
        let time = (new Date()).getTime()

        remaining_time = Math.ceil(Math.max(0, night_action_info.time - (time - night_action_info.start_time)) / 1000)

        

        if (token_click_type == 5) {
            let p_r = night_action_info.player_restrictions
            let up_to = ''
            if (p_r.includes("cancel")) {
                up_to = 'up to '
            }
            let others = p_r.includes("others") ? ' other' : ''
            let alive_status = ''
            if (p_r.includes('alive') && !p_r.includes('dead')) {
                alive_status = ' alive'
            }
            else if (p_r.includes('dead') && !p_r.includes('alive')) {
                alive_status = ' dead'
            }
            let players = night_action_info.in_players == 1 ? ' player (' : ' players ('
            info.innerHTML = 'Choose ' + up_to + night_action_info.in_players + others + alive_status + players + (night_action_info.in_players - night_action_info.players.length) + ' remaining) in ' + remaining_time + ' seconds'
        }
        else {
            let up_to = ''
            if (night_action_info.character_restrictions.includes("cancel")) {
                up_to = 'up to '
            }
            let characters = token_menu_info.choices == 1 ? ' character (' : ' characters ('
            token_menu.children[0].innerHTML = 'Choose ' + up_to + token_menu_info.choices + characters + (token_menu_info.choices - token_menu_info.selected.length) + ' remaining) in ' + remaining_time + ' seconds'
        }
        
        if (remaining_time > 0) {
            window.requestAnimationFrame(nightActionAnimation)
        }
        else {
            night_action_info.timed_out = true
            if (token_click_type == 5) {
                token_click_type = 0
                if (night_action_info.in_characters > 0) {
                    night_action_info.start_time = (new Date()).getTime()
                    token_menu_info.type = 2
                    token_menu_info.choices = night_action_info.in_characters
                    token_menu_info.selected = []
                    token_menu_info.valid_teams = ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']
                    for (let i of ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']) {
                        if (!night_action_info.character_restrictions.includes(i)) {
                            token_menu_info.valid_teams.splice(token_menu_info.valid_teams.indexOf(i), 1)
                        }
                    }
                    if (token_menu_info.valid_teams.length == 0) {
                        token_menu_info.valid_teams = ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']
                    }
                    token_menu_info.out_of_play = night_action_info.character_restrictions.includes("outOfPlay")
                    token_menu_info.active = true
                    reDrawTokenMenu()
                    nightActionAnimation()
                }
                else {
                    night_action_info.func()
                }
                reDrawHUD()
            }
            // MAGIC NUMBER
            else {
                token_menu.children[3].onclick()
            }
        }
    }
}

function revealGrimoire(grimoire) {
    let sspi = getSSPlayerInfo()
    for (let p of grimoire.player_info) {
        // Change characters
        let player = getPlayerBySeatID(p.seat_id)
        player.character = p.character
        player.synced = true
        
        sspi[player.seat_id].character = p.character
        
        // Add reminders
        
        // Remove existing host ones
        for (let i=player.reminders.length-1; i >= 0; i--) {
            let r = player.reminders[i]
            if (r.host) {
                player.reminders.splice(i, 1)
            }
        }
        // Add new ones
        for (let r of p.reminders) {
            r.host = true
            player.reminders.splice(0, 0, r)
        }
        
        sspi[player.seat_id].reminders = player.reminders
    }
    setSSPlayerInfo(sspi)
    game_state.demon_bluffs = grimoire.demon_bluffs
    setSSDemonBluffs(game_state.demon_bluffs)
    
    reDrawTokens()
    reDrawNightReminders()
    reDrawReminders()
    reDrawFabledDemonBluffsHUD()
}

// For host after maybe done creation 
function startNightAction(night_action) {
    // Action specific data
    night_action_info.player_restrictions = night_action.playerRestrictions || []
    night_action_info.character_restrictions = night_action.characterRestrictions || []
    night_action_info.info = night_action.info ? [night_action.info] : []
    night_action_info.confirm = night_action.confirm ? night_action.confirm : null
    night_action_info.grimoire = Boolean(night_action.grimoire)
    night_action_info.group = Boolean(night_action.group)
    night_action_info.in_players = night_action.inPlayers || 0
    night_action_info.in_characters = night_action.inCharacters || 0
    night_action_info.to_send_in_players = night_action.players || 0
    night_action_info.to_send_in_characters = night_action.characters || 0
    
    // Process
    let prompt = true
    if (night_action.info) {
        alert_box_info.push({
            'text' : night_action.info,
            'type' : 'prompt',
            'func' : (res) => {
                if (res) {
                    night_action_info.info.push(res)
                }
                continueNightAction(night_action, res)
            }
        })
        alert_box.check()
    }
    else {
        continueNightAction(night_action, prompt)
    }
}

// For host after giving info prompt
function continueNightAction(night_action, prompt) {
    if (prompt) {
        if (night_action_info.in_players > 0) {
            night_action_info.start_time = null // (new Date()).getTime()
            token_click_type = 5
            reDrawHUD()
            nightActionAnimation()
        }
        else if (night_action_info.in_characters > 0) {
            night_action_info.start_time = null // (new Date()).getTime()
            token_menu_info.type = 2
            token_menu_info.choices = night_action_info.in_characters
            token_menu_info.selected = []
            token_menu_info.valid_teams = ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']
            for (let i of ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']) {
                if (!night_action_info.character_restrictions.includes(i)) {
                    token_menu_info.valid_teams.splice(token_menu_info.valid_teams.indexOf(i), 1)
                }
            }
            if (token_menu_info.valid_teams.length == 0) {
                token_menu_info.valid_teams = ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']
            }
            token_menu_info.out_of_play = night_action_info.character_restrictions.includes("outOfPlay")
            token_menu_info.active = true
            reDrawTokenMenu()
            nightActionAnimation()
        }
        else {
            night_action_info.func()
        }
    }
    else {
        alert_box_info.push({'text' : 'Night Action Cancelled'})
        alert_box.check()
    }
}

// For player after info/confirm
function afterInfoNightAction(night_action, timer, res) {
    let actions = (night_action.players > 0) + (night_action.characters > 0) + Boolean(night_action.grimoire) + Boolean(night_action.confirm)
    let time_left = (actions + 1) * night_action.time - ((new Date()).getTime() - timer)
    night_action_info.time = time_left / ((night_action.players > 0) + (night_action.characters > 0))
    night_action_info.seat_id = your_seat_id
    night_action_info.players = []
    night_action_info.info = []
    night_action_info.group = night_action.group
    night_action_info.confirm = res
    night_action_info.timed_out = false
    night_action_info.player_restrictions = night_action.player_restrictions || []
    night_action_info.character_restrictions = night_action.character_restrictions || []
    night_action_info.name = night_action.name
    night_action_info.characters = []
    night_action_info.in_players = night_action_info.to_send_in_players = night_action.players
    night_action_info.in_characters = night_action_info.to_send_in_characters = night_action.characters
    
    if (night_action_info.in_players > 0) {
        night_action_info.start_time = (new Date()).getTime()
        token_click_type = 5
        reDrawHUD()
        nightActionAnimation()
    }
    else if (night_action_info.in_characters > 0) {
        night_action_info.start_time = (new Date()).getTime()
        token_menu_info.type = 2
        token_menu_info.choices = night_action_info.in_characters
        token_menu_info.selected = []
        token_menu_info.valid_teams = ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']
        for (let i of ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']) {
            if (!night_action_info.character_restrictions.includes(i)) {
                token_menu_info.valid_teams.splice(token_menu_info.valid_teams.indexOf(i), 1)
            }
        }
        if (token_menu_info.valid_teams.length == 0) {
            token_menu_info.valid_teams = ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']
        }
        token_menu_info.out_of_play = night_action_info.character_restrictions.includes("outOfPlay")
        token_menu_info.active = true
        reDrawTokenMenu()
        nightActionAnimation()
    }
    else {
        night_action_info.func()
    }
}

function getMenuOpen() {
    return token_menu_info.active || (reminder_menu.style.visibility == '') || (night_action_menu.style.visibility == '') || (edition_menu.style.visibility == '')
}

function clearLog() {
    game_log.children[0].innerHTML = ''
    delete sessionStorage.log
}

function setLog(content) {
    game_log.children[0].innerHTML = content
    sessionStorage.log = game_log.children[0].innerHTML
}

function appendLog(msg) {
    let at_bottom = (game_log.children[0].scrollHeight - game_log.children[0].scrollTop - parseFloat(game_log.children[0].style.height) < 2)
    if (game_log.children[0].innerHTML.length > 0) {
        game_log.children[0].innerHTML += '<br><br>'
    }
    game_log.children[0].innerHTML += msg
    if (at_bottom) {
        game_log.children[0].scrollTop = game_log.children[0].scrollHeight
    }
    sessionStorage.log = game_log.children[0].innerHTML
}

function wipeSessionStorage() {
    for (let key in sessionStorage) {
        delete sessionStorage[key]
    }
}

function getSSPlayerInfo() {
    if (sessionStorage.player_info) {
        return JSON.parse(sessionStorage.player_info)
    }
    return undefined
}

function setSSPlayerInfo(player_info) {
    sessionStorage.player_info = JSON.stringify(player_info)
}

function getSSDemonBluffs() {
    if (sessionStorage.demon_bluffs) {
        return JSON.parse(sessionStorage.demon_bluffs)
    }
    return undefined
}

function setSSDemonBluffs(demon_bluffs) {
    sessionStorage.demon_bluffs = JSON.stringify(demon_bluffs)
}

function requestSitDown() {
    // Joining a game
    your_seat_id = null
    token_click_type = 1
    reDrawHUD()
}

function preloadImage(url) {
    let preImg = document.createElement('link')
    preImg.href = url
    preImg.rel = 'preload'
    preImg.as = 'image'
    document.head.appendChild(preImg)
}

function calculatePing(repeat) {
    if (manual_ping.timeout) {
        manual_ping.time = (new Date()).getTime()

        socket.emit('manual ping')
    }
}

function main() {
    setup()
    style()
    reSize()
    game_menu.style.visibility = ''
    
    // Rescue channel_id, client_type from params
    if (sessionStorage.channel_id == null && urlParams.get('id')) {
        sessionStorage.channel_id = urlParams.get('id')
    }
    
    if (sessionStorage.client_type == null && urlParams.get('type')) {
        sessionStorage.client_type = urlParams.get('type') == 'host' ? 1 : 0
    }
    
    // Try to connect
    if (sessionStorage.channel_id != null && sessionStorage.client_type != null) {
        socket.open()
    }
}