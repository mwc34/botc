socket.on('server message', (msg) => {
    alert_box_info.push({
        'text' : msg,
        'func' : () => {appendLog(msg)}
    })
    alert_box.check()
})

socket.on('pong', (ping) => {
    latency = ping
    reDrawHUD()
    if (manual_ping.timeout) {
        clearTimeout(manual_ping.timeout)
        manual_ping.timeout = null
    }
})

socket.on('manual pong', (time) => {
    if (manual_ping.timeout) {
        let ping = (new Date()).getTime() - manual_ping.time
        latency = ping
        reDrawHUD()
        manual_ping.timeout = setTimeout(calculatePing, 2000)
    }
})

socket.on('new host', (msg, extra) => {
    // Host rejected
    if (!msg) {
        reason = extra
        alert_box_info.push({'text' : reason})
        alert_box.check()
    }
    // Host accepted
    else {
        new_room = extra
        
        channel_id = sessionStorage.channel_id
        if (sessionStorage.saved_channel_id != sessionStorage.channel_id) {
            wipeSessionStorage()
        }
        
        if (sessionStorage.log) {
            setLog(sessionStorage.log)
        }
        else {
            clearLog()
        }
        
        appendLog(getLogDefaultStyle('Connected'))
        
        sessionStorage.saved_channel_id = sessionStorage.channel_id = channel_id
        client_type = sessionStorage.client_type = 1
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
        
        let sspi = {}
        for (let p of game_state.player_info) {
            sspi[p.seat_id] = {'character' : p.character, 'reminders' : p.reminders}
        }
        setSSPlayerInfo(sspi)
        
        reSize()
        reDraw()
        game.style.visibility = ''
        non_square.style.visibility = ''
        game_menu.style.visibility = 'hidden'
        
        if (new_room && sessionStorage.game_recovery) {
            for (let e of alert_box_info) {
                alert_box_info.pop()
            }
            alert_box_info.push({
                'text' : 'Would you like to restore the previous game state for this session?',
                'type' : 'confirm',
                'func' : (res) => {
                    if (res) {
                        let state = JSON.parse(sessionStorage.game_recovery)
                        
                        let new_e = state.curr_edition
                        for (let team in new_e.characters) {
                            for (let i=0; i<new_e.characters[team].length; i++) {
                                let role = new_e.characters[team][i]
                                if (!getCharacterFromID(role)) {
                                    for (let r of state.roles) {
                                        if (r.id == role) {
                                            new_e.characters[team][i] = r
                                            break
                                        }
                                    }
                                }
                            }
                        }
                        
                        if (new_e.fabled) {
                            for (let i=0; i<new_e.fabled.length; i++) {
                                let fabled = new_e.fabled[i]
                                if (!getFabledFromID(fabled)) {
                                    for (let f of state.fabled) {
                                        if (f.id == fabled) {
                                            new_e.fabled[i] = f
                                            break
                                        }
                                    }
                                }
                            }
                        }

                        socket.emit('new edition', channel_id, new_e)
                        delete state.curr_edition
                        delete state.roles
                        delete state.fabled
                        
                        socket.emit('reset game', channel_id, state)
                    }
                }
            })
            alert_box.check()
        }
        else {
            delete sessionStorage.game_recovery
        }
        
        calculatePing()
    }
})

socket.on('new player', (msg, reason) => {
    if (!msg) {
        alert_box_info.push({'text' : reason})
        alert_box.check()
    }
    else {
        
        channel_id = sessionStorage.channel_id
        if (sessionStorage.saved_channel_id != sessionStorage.channel_id) {
            wipeSessionStorage()
        }
        
        if (sessionStorage.log) {
            setLog(sessionStorage.log)
        }
        else {
            clearLog()
        }
        
        appendLog(getLogDefaultStyle('Connected'))
        
        sessionStorage.saved_channel_id = sessionStorage.channel_id = channel_id
        client_type = sessionStorage.client_type = 0
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

        setSSPlayerInfo(sspi)
        
        if (getSSDemonBluffs()) {
            game_state.demon_bluffs = getSSDemonBluffs()
        }
        
        reSize()
        reDraw()
        game.style.visibility = ''
        non_square.style.visibility = ''
        game_menu.style.visibility = 'hidden'
        
        calculatePing()
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
    if (client_type || game_state.log_status < 2) {
        appendLog(getLogNominationStyle(
            getLogPlayerStyle(getPlayerBySeatID(clock_info.nominator).name) 
            + (clock_info.free ? " free" : "") 
            + " nominated " 
            + getLogPlayerStyle(getPlayerBySeatID(clock_info.nominatee).name)  
            + " and got " + votes + " vote" + (votes == 1 ? '' : "s")
            + (votes ? " from " + vote_names : ".")))
    }
        
        
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
    if (game_state.day_phase) {
        for (let player of game_state.player_info) {
            player.nominated = false
            player.nominateed = false
        }
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
    reDraw()
})

socket.on('open nominations update', (state) => {
    game_state.nominations_open = state
    reDrawHUD()
})

socket.on('reveal grimoire', (grimoire) => {
    alert_box_info.push({
            'text' : 'Reveal Grimoire',
            'func' : () => {
                appendLog(getLogDefaultStyle('The grimoire has been revealed'))
                revealGrimoire(grimoire)
            }
    })
    alert_box.check()
    
})

socket.on('log status update', (status) => {
    game_state.log_status = status
    reDrawHUD()
})

socket.on('night action received', (seat_id) => {
    if (client_type) {
        appendLog(getPlayerBySeatID(seat_id).night_action)
        getPlayerBySeatID(seat_id).night_action = true
        reDrawNightActionPendings()
    }
})

socket.on('demon bluff update', (demon_bluffs) => {
    game_state.demon_bluffs = demon_bluffs
    setSSDemonBluffs(game_state.demon_bluffs)
    reDrawFabledDemonBluffsHUD()
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
        let delay_response = night_action.players || night_action.characters || night_action.confirm
        let msg = getLogNightActionStyle('Received Night Action from ' + getLogPlayerStyle('The Host') + ':<br>' + nightAlert(night_action))
        alert_box_info.push({'text' : msg, 'func' : () => {
            
            // Only log if had info
            if (game_state.log_status == 0 && (night_action.info.players.length > 0 || night_action.info.characters.length > 0 || night_action.info.info.length > 0)) {
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
            else if (delay_response) {
                afterInfoNightAction(night_action, timer, null)
            }
            
            
        }})
        alert_box.check()
        if (!delay_response) {
            afterInfoNightAction(night_action, timer, null)
        }
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
    
    let game_recovery = game_state.player_info.length == 0

    game_state = state
    
    token_click_type = 0
    token_menu_info.active = false
    night_action_info.start_time = null
    reminder_menu.style.visibility = 'hidden'
    night_action_menu.style.visibility = 'hidden'
    edition_menu.style.visibility = 'hidden'
    token_selected_seat_id = null
    
    if (your_seat_id == null && !client_type) {
        if (sessionStorage.seat_id != null && getPlayerBySeatID(sessionStorage.seat_id) && !getPlayerBySeatID(sessionStorage.seat_id).socket_id) {
            socket.emit('sit update', channel_id, getPlayerBySeatID(sessionStorage.seat_id).seat)
        }
        else {
            requestSitDown()
        }
    }
    
    for (let key in roles_by_id) {
        delete roles_by_id[key]
    }
    
    let sspi = getSSPlayerInfo()
    if (game_recovery) {
        for (let p of game_state.player_info) {
            if (p.seat_id in sspi) {
                p.character = sspi[p.seat_id].character
                p.reminders = sspi[p.seat_id].reminders
            }
        }
    }
    
    clearLog()
    wipeSessionStorage()
    sessionStorage.channel_id = sessionStorage.saved_channel_id = channel_id
    sessionStorage.client_type = client_type
    
    sspi = {}
    for (let p of game_state.player_info) {
        sspi[p.seat_id] = {'character' : p.character, 'reminders' : p.reminders}
    }
    setSSPlayerInfo(sspi)
    
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
    for (let e of alert_box_info) {
        alert_box_info.pop()
    }
    alert_box_info.push({'text' : finish_msg})
    alert_box.check()
    appendLog(finish_msg)
    reDrawHUD()
    reDrawFabledDemonBluffsHUD()
    wipeSessionStorage()
    client_type = null
    channel_id = null
    token_click_type = 0
    token_menu_info.active = false
    night_action_info.start_time = null
    reminder_menu.style.visibility = 'hidden'
    night_action_menu.style.visibility = 'hidden'
    edition_menu.style.visibility = 'hidden'
    token_selected_seat_id = null
})

socket.on('connect', () => {
    channel_id = null
    client_type = null
    if (sessionStorage.channel_id != null && sessionStorage.client_type != null) {
        if (parseInt(sessionStorage.client_type)) {
            socket.emit('new host', sessionStorage.channel_id)
        }
        else {
            socket.emit('new player', sessionStorage.channel_id)
        }
    }
    else {
        socket.disconnect()
    }
})

socket.on('disconnect', () => {
    if (game_menu.style.visibility == 'hidden' && client_type != null && channel_id != null) {
        for (let e of alert_box_info) {
            alert_box_info.pop()
        }
        alert_box_info.push({
            'text' : 'You have lost connection with the server'
        })
        alert_box.check()
    }
    
    if (client_type) {
        let state = {
            'log_status' : game_state.log_status,
            'edition' : game_state.edition,
            'curr_edition' : getEditionFromID(game_state.edition),
            'roles' : game_state.roles,
            'fabled' : game_state.fabled,
            'fabled_in_play' : game_state.fabled_in_play,
            'demon_bluffs' : game_state.demon_bluffs,
            'day_phase' : game_state.day_phase,
            'phase_counter' : game_state.phase_counter,
            'nominations_open' : game_state.nominations_open,
            'player_info' : game_state.player_info,
        }
        
        sessionStorage.game_recovery = JSON.stringify(state)
    }
    
    client_type = null
    channel_id = null
    reDrawHUD()
    reDrawSocketIcons()
})
























