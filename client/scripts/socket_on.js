socket.on('server message', (msg) => {
    alert_box_info.push({
        'text' : msg
    })
    alert_box.check()
})

socket.on('new host', (msg, reason) => {
    // Host rejected
    if (!msg) {
        alert_box_info.push({'text' : reason})
        alert_box.check()
    }
    // Host accepted
    else {
        
        if (sessionStorage.log) {
            setLog(sessionStorage.log)
        }
        if (sessionStorage.channel_id == channel_id) {
            appendLog(getLogDefaultStyle('Reconnected'))
        }
        else {
            appendLog(getLogDefaultStyle('Connected'))
        }
        sessionStorage.channel_id = channel_id
        client_type = 1
        sessionStorage.client_type = client_type
        game_state = msg
        for (let key in roles_by_id) {
            delete roles_by_id[key]
        }
        token_click_type = 0
        your_seat_id = null
        token_menu_info.active = false
        night_action_info.start_time = null
        reminder_menu.style.visibility = 'hidden'
        night_action_menu.style.visibility = 'hidden'
        edition_menu.style.visibility = 'hidden'
        token_selected_seat_id = null
        reSize()
        reDraw()
        game.style.visibility = ''
        non_square.style.visibility = ''
        game_menu.style.visibility = 'hidden'
        
        if (!sessionStorage.player_info) {
            setSSPlayerInfo({})
        }
        let sspi = getSSPlayerInfo()
        for (let p of game_state.player_info) {
            sspi[p.seat_id] = {'character' : p.character, 'reminders' : p.reminders}
        }
        setSSPlayerInfo(sspi)
    }
})

socket.on('new player', (msg, reason) => {
    if (!msg) {
        alert_box_info.push({'text' : reason})
        alert_box.check()
    }
    else {
        
        if (sessionStorage.log) {
            setLog(sessionStorage.log)
        }
        if (sessionStorage.channel_id == channel_id) {
            appendLog(getLogDefaultStyle('Reconnected'))
        }
        else {
            appendLog(getLogDefaultStyle('Connected'))
        }
        sessionStorage.channel_id = channel_id
        client_type = 0
        sessionStorage.client_type = client_type
        game_state = msg
        for (let key in roles_by_id) {
            delete roles_by_id[key]
        }
        token_click_type = 0
        your_seat_id = null
        token_menu_info.active = false
        night_action_info.start_time = null
        reminder_menu.style.visibility = 'hidden'
        night_action_menu.style.visibility = 'hidden'
        edition_menu.style.visibility = 'hidden'
        token_selected_seat_id = null
        reSize()
        reDraw()
        game.style.visibility = ''
        non_square.style.visibility = ''
        game_menu.style.visibility = 'hidden'
        if (sessionStorage.seat_id != null && getPlayerBySeatID(sessionStorage.seat_id) && !getPlayerBySeatID(sessionStorage.seat_id).socket_id) {
            socket.emit('sit update', channel_id, getPlayerBySeatID(sessionStorage.seat_id).seat)
        }
        else {
            requestSitDown()
        }
        if (!sessionStorage.player_info) {
            setSSPlayerInfo({})
        }
        let sspi = getSSPlayerInfo()
        for (let p of game_state.player_info) {
            // Fix travelers
            if (!sspi[p.seat_id] 
                    || (p.character && getCharacterFromID(p.character).team == 'traveler') 
                    || (sspi[p.seat_id].character && getCharacterFromID(sspi[p.seat_id].character).team == 'traveler')) {
                sspi[p.seat_id] = {'character' : p.character, 'reminders' : p.reminders}
            }
            else {
                let player = sspi[p.seat_id]
                if (player) {
                    p.character = player.character
                    p.reminders = player.reminders
                }
            }
        }
        
        if (getSSDemonBluffs()) {
            game_state.demon_bluffs = getSSDemonBluffs()
        }
        setSSPlayerInfo(sspi)
    }
})

socket.on('sit update', (seat_id) => {
    if (seat_id == null) {
        alert_box_info.push({'text' : 'That seat is occupied', 'func' : () => {requestSitDown()}})
        alert_box.check()
    }
    else {
        your_seat_id = seat_id
        sessionStorage.seat_id = your_seat_id
        
        reDraw()
    }
})

socket.on('socket update', (socket_update) => {
    let player = getPlayerBySeatID(socket_update.seat_id)
    player.socket_id = socket_update.socket_id
    reDrawSocketIcons()
})

socket.on('add update', (player) => {
    game_state.player_info.push(player)
    let sspi = getSSPlayerInfo()
    sspi[player.seat_id] = {'character' : player.character, 'reminders' : player.reminders}
    setSSPlayerInfo(sspi)
    reSizePlayers()
    reDrawPlayers()
    reDrawHUD()
})

socket.on('name update', (name_update) => {
    let player = getPlayerBySeatID(name_update.seat_id)
    player.name = name_update.name
    reDrawNames()
})

socket.on('character update', (character_update) => {
    let player = getPlayerBySeatID(character_update.seat_id)
    let old_character = player.character
    player.character = character_update.character
    let sspi = getSSPlayerInfo()
    sspi[player.seat_id].character = player.character
    setSSPlayerInfo(sspi)
    player.synced = true
    let text = ''
    if (player.seat_id == your_seat_id) {
        text = getLogDefaultStyle('Your character has changed to: ' + (!player.character ? 'Empty' : getLogCharacterStyle(getCharacterFromID(player.character).name)))
        alert_box_info.push({'text' : text,
                             'func' : () => {
                                 appendLog(text)
                                 reDrawTokens()
                                 reDrawNightReminders()
                                 reDrawHUD()
                             }})
        alert_box.check()
    }
    else if (!client_type && ((old_character && getCharacterFromID(old_character).team == 'traveler') 
                    || (character_update.character && getCharacterFromID(character_update.character).team == 'traveler'))) {
        
        // Change to a traveler
        if (character_update.character && getCharacterFromID(character_update.character).team == 'traveler') {
            text = getLogDefaultStyle(`The character of ${player.name} has changed to: ${getLogCharacterStyle(getCharacterFromID(character_update.character).name)}`)
        }
        // Changed from a traveler
        else {
            text = getLogDefaultStyle(`Player ${player.name} is no longer a Traveler`)
        }
        alert_box_info.push({
            'text' : text,
            'func' : () => {
                appendLog(text)
                reDrawTokens()
                reDrawNightReminders()
                reDrawHUD()
            }
        })
        alert_box.check()
    }
    else {
        reDrawTokens()
        reDrawNightReminders()
        reDrawHUD()
    }
})

socket.on('alive update', (alive_update) => {
    let player = getPlayerBySeatID(alive_update.seat_id)
    if (player.alive && !alive_update.alive) {
        appendLog(getLogDefaultStyle(getLogPlayerStyle(player.name) + " died"))
    }
    else if (!player.alive && alive_update.alive) {
        appendLog(getLogDefaultStyle(getLogPlayerStyle(player.name) + " was revived"))
    }
    
    player.alive = alive_update.alive
    if (player.alive) {
        player.dead_vote = true
    }
    reDrawDeathTokens()
    reDrawDeadVotes()
    reDrawHUD()
})

socket.on('seat update', (seat_update) => {
    for (let seat_id in seat_update) {
        getPlayerBySeatID(seat_id).seat = seat_update[seat_id]
    }
    reDrawPlayers()
})

socket.on('vote update', (vote_update) => {
    let player = getPlayerBySeatID(vote_update.seat_id)
    player.voting = vote_update.voting
    reDrawVotes()
    reDrawClock()
})

socket.on('interval update', (interval) => {
    game_state.clock_info.interval = interval
    reDrawClock()
})

socket.on('nomination update', (clock_info) => {
    game_state.clock_info = clock_info
    reDrawClock()
    reDrawVotes()
})

socket.on('start vote update', () => {
    game_state.clock_info.start_time = (new Date()).getTime()
    clockAnimation()
})

socket.on('reset vote update', () => {
    game_state.clock_info.start_time = null
    reDrawClock()
})

socket.on('finish vote update', () => {
    let votes = 0
    let vote_names = ""
    for (let player of game_state.player_info) {
        if (player.voting) {
            votes++
            vote_names += getLogPlayerStyle(player.name) + ', '
        }
    }
    if (votes) {
        vote_names = vote_names.slice(0, -2)
    }
    
    let clock_info = game_state.clock_info
    appendLog(getLogNominationStyle(
        getLogPlayerStyle(getPlayerBySeatID(clock_info.nominator).name) 
        + (clock_info.free ? " free" : "") 
        + " nominated " 
        + getLogPlayerStyle(getPlayerBySeatID(clock_info.nominatee).name)  
        + " and got " + votes + " vote" + (votes == 1 ? '' : "s")
        + (votes ? " from " + vote_names : ".")))
        
        
    for (let player of game_state.player_info) {
        if (!player.alive && player.dead_vote && player.voting && !clock_info.free) {
            player.dead_vote = false
        }
    }
    if (!clock_info.free) {
        getPlayerBySeatID(clock_info.nominator).nominated = true
        getPlayerBySeatID(clock_info.nominatee).nominateed = true
    }
    
    // Reset voting
    for (let player of game_state.player_info) {
        player.voting = false
    }
    
    clock_info.start_time = null
    clock_info.nominatee = null
    clock_info.nominator = null
    clock_info.active = false
    clock_info.free = false
    reDrawPlayers()
    reDrawClock()
    reDrawHUD()
    
})

socket.on('cancel vote update', () => {
    let clock_info = game_state.clock_info
    
    // Reset voting
    for (let player of game_state.player_info) {
        player.voting = false
    }
    
    clock_info.start_time = null
    clock_info.nominatee = null
    clock_info.nominator = null
    clock_info.active = false
    clock_info.free = false
    reDrawPlayers()
    reDrawClock()
})

socket.on('phase update', (phase_update) => {
    game_state.day_phase = phase_update.day_phase
    game_state.phase_counter = phase_update.phase_counter
    appendLog(getLogPhaseStyle(`Phase change to ${game_state.day_phase == true ? 'Day' : 'Night'} ${game_state.phase_counter}`))
    // Wipe nominations
    for (let player of game_state.player_info) {
        player.nominated = false
        player.nominateed = false
    }
    game_state.nominations_open = false
    reDrawHUD()
})

socket.on('fabled in play update', (fabled_in_play) => {
    game_state.fabled_in_play = fabled_in_play
    reDrawFabledDemonBluffsHUD()
})

socket.on('edition update', (edition) => {
    game_state.edition = edition
    reDraw()
})

socket.on('reference sheet update', (reference_sheet_update) => {
    getEditionFromID(reference_sheet_update.id).reference_sheet = reference_sheet_update.reference_sheet
    reDrawHUD()
})

socket.on('new edition', (new_edition_update) => {
    game_state.editions.push(new_edition_update.edition)
    game_state.roles = game_state.roles.concat(new_edition_update.new_roles)
    for (let role of new_edition_update.new_roles) {
        roles_by_id[role.id] = role
    }
    game_state.fabled = game_state.fabled.concat(new_edition_update.new_fabled)
    reDrawEditionMenu()
    if (client_type) {
        socket.emit('edition update', channel_id, new_edition_update.edition.id)
    }
})

socket.on('open nominations update', (state) => {
    game_state.nominations_open = state
    reDrawHUD()
})

socket.on('reveal grimoire', (grimoire) => {
    alert_box_info.push({
            'text' : 'Reveal Grimoire',
            'func' : () => {revealGrimoire(grimoire)}
    })
    alert_box.check()
    
})

socket.on('group night action update', (group_night_action) => {
    game_state.group_night_action = group_night_action
    reDrawTokens()
    reDrawNames()
    reDrawTokenMenu()
})

socket.on('night action', (night_action) => {
    if (client_type) {
        let msg = getLogNightActionStyle('Received Night Action from ' + getLogPlayerStyle(getPlayerBySeatID(night_action.seat_id).name) + ':<br>' + nightAlert(night_action))
        
        // Only log if had info
        if (night_action.server_response ||
                night_action.timed_out ||
                night_action.info.players.length > 0 || 
                night_action.info.characters.length > 0 || 
                night_action.info.info.length > 0
            ) {
            appendLog(msg)
            alert_box_info.push({'text' : msg})
            alert_box.check()
        }
        getPlayerBySeatID(night_action.seat_id).night_action = false
        reDrawNightActionPendings()
        
    }
    else {
        new Notification(`BotC: ${channel_id}`, { "body": `Night Action: ${night_action.name}`});
        let timer = (new Date()).getTime()
        let msg = getLogNightActionStyle('Received Night Action from ' + getLogPlayerStyle('The Host') + ':<br>' + nightAlert(night_action))
        alert_box_info.push({'text' : msg, 'func' : () => {
            
            // Only log if had info
            if (night_action.info.players.length > 0 || night_action.info.characters.length > 0 || night_action.info.info.length > 0) {
                appendLog(msg)
            }
            
            if (night_action.name == 'Demon Info') {
                game_state.demon_bluffs = night_action.info.characters
                setSSDemonBluffs(game_state.demon_bluffs)
                reDrawFabledDemonBluffsHUD()
            }
            if (night_action.grimoire) {
                revealGrimoire(night_action.grimoire)
            }
            
            if (night_action.confirm) {
                alert_box_info.push({
                    'text' : night_action.confirm,
                    'type' : 'confirm',
                    'func' : (res) => {
                        afterInfoNightAction(night_action, timer, res)
                    }
                })
            }
            else {
                afterInfoNightAction(night_action, timer, null)
            }
            
            
        }})
        alert_box.check()
    }
})

socket.on('reset game', (state) => {
    for (let e of alert_box_info) {
        alert_box_info.pop()
    }
    
    alert_box_info.push({
        'text' : 'The Host has reset the game',
    })
    alert_box.check()
    clearLog()
    wipeSessionStorage()
    sessionStorage.channel_id = channel_id
    sessionStorage.client_type = client_type
    if (your_seat_id != null) {
        sessionStorage.seat_id = your_seat_id
    }
    game_state = state
    for (let key in roles_by_id) {
        delete roles_by_id[key]
    }
    
    let sspi = {}
    for (let p of game_state.player_info) {
        sspi[p.seat_id] = {'character' : p.character, 'reminders' : p.reminders}
    }
    setSSPlayerInfo(sspi)
    
    token_click_type = 0
    token_menu_info.active = false
    night_action_info.start_time = null
    reminder_menu.style.visibility = 'hidden'
    night_action_menu.style.visibility = 'hidden'
    edition_menu.style.visibility = 'hidden'
    token_selected_seat_id = null
    reSize()
    reDraw()
    
})

socket.on('remove update', (seat_id) => {
    let player = getPlayerBySeatID(seat_id)
    game_state.player_info.splice(game_state.player_info.indexOf(player), 1)
    for (let i = player.seat+1; i <= game_state.player_info.length; i++) {
        let t = getPlayerBySeat(i)
        t.seat--
    }
    let sspi = getSSPlayerInfo()
    delete sspi[player.seat_id]
    setSSPlayerInfo(sspi)
    
    reSizePlayers()
    reDrawPlayers()
    if (player.seat_id == your_seat_id) {
        your_seat_id = null
        delete sessionStorage.seat_id
        reDrawPlayers()
        alert_box_info.push({'text' : 'Your seat was removed', 'func' : () => {requestSitDown();reDrawHUD();}})
        alert_box.check()
    }
    reDrawHUD()
})

socket.on('kick update', (kick_update) => {
    let player = getPlayerBySeatID(kick_update.seat_id)
    player.socket_id = false
    reDrawSocketIcons()
    if (player.seat_id == your_seat_id) {
        your_seat_id = null
        delete sessionStorage.seat_id
        reDrawPlayers()
        
        let f = () => {
            if (channel_id != null) {
                requestSitDown()
            }
        }
        
        if (!kick_update.self_kick) {
            alert_box_info.push({'text' : 'You were kicked from your seat', 'func' : () => {f()}})
            alert_box.check()
        }
        else {
            f()
        }
    }
})

socket.on('host update', (host_update) => {
    game_state.host_socket_id = host_update
    reDrawHUD()
})

socket.on('finish', (finish_msg) => {
    alert_box_info.push({'text' : finish_msg})
    alert_box.check()
    reDrawHUD()
    reDrawFabledDemonBluffsHUD()
    game_menu.style.visibility = ''
    game.style.visibility = 'hidden'
    non_square.style.visibility = 'hidden'
    clearLog()
    wipeSessionStorage()
})

socket.on('connect', () => {
    // Rescue channel_id, client_type from storage or params
    if (sessionStorage.channel_id) {
        channel_id = sessionStorage.channel_id
    }
    else if (urlParams.get('id')) {
        channel_id = urlParams.get('id')
    }
    
    if (sessionStorage.client_type) {
        client_type = Number(sessionStorage.client_type)
    }
    else if (urlParams.get('type')) {
        client_type = urlParams.get('type') == 'host' ? 1 : 0
    }
    
    if (channel_id && client_type != null) {
        if (client_type) {
            socket.emit('new host', channel_id)
        }
        else {
            socket.emit('new player', channel_id)
        }
    }
    else {
        socket.disconnect()
    }
})

socket.on('disconnect', () => {
    if (game_menu.style.visibility == 'hidden') {
        alert_box_info.push({
            'text' : 'You have lost connection with the server'
        })
        alert_box.check()
    }
    game_menu.style.visibility = ''
    game.style.visibility = 'hidden'
    non_square.style.visibility = 'hidden'
    
})
























