socket.on('new host', (msg) => {
    // Host rejected
    if (!msg) {
        alert_box_info.push({'text' : 'Channel: ' + channel_id + ' is already in use'})
        alert_box.check()
    }
    // Host accepted
    else {
        sessionStorage.channel_id = channel_id
        client_type = 1
        sessionStorage.client_type = client_type
        game_state = msg
        token_click_type = 0
        your_seat_id = null
        token_menu_info.active = false
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
            if (!sspi[p.seat_id]) {
                sspi[p.seat_id] = {'character' : p.character, 'reminders' : p.reminders}
            }
        }
        if (sessionStorage.log) {
            setLog(sessionStorage.log)
        }
        setSSPlayerInfo(sspi)
    }
})

socket.on('new player', (msg) => {
    if (!msg) {
        alert_box_info.push({'text' : 'Channel: ' + channel_id + ' is not available to join'})
        alert_box.check()
    }
    else {
        sessionStorage.channel_id = channel_id
        client_type = 0
        sessionStorage.client_type = client_type
        game_state = msg
        token_click_type = 0
        your_seat_id = null
        token_menu_info.active = false
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
            if (!sspi[p.seat_id]) {
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
        if (sessionStorage.log) {
            setLog(sessionStorage.log)
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
    if (client_type) {
        alert_box_info.push({
            'text' : 'Enter the new name',
            'type' : 'prompt',
            'func' : (res) => {
                if (res) {
                    socket.emit('name update', channel_id, {'seat_id' : player.seat_id, 'name' : res})
                }
            }
        })
        alert_box.check()
    }
    reDrawHUD()
})

socket.on('name update', (name_update) => {
    let player = getPlayerBySeatID(name_update.seat_id)
    player.name = name_update.name
    reDrawNames()
})

socket.on('character update', (character_update) => {
    let player = getPlayerBySeatID(character_update.seat_id)
    player.character = character_update.character
    let sspi = getSSPlayerInfo()
    sspi[player.seat_id].character = player.character
    setSSPlayerInfo(sspi)
    player.synced = true
    if (player.seat_id == your_seat_id) {
        let text = 'Your character has changed to: ' + (!player.character ? 'Empty' : getCharacterFromID(player.character).name)
        alert_box_info.push({'text' : text,
                             'func' : () => {
                                 appendLog(null, text)
                                 reDrawTokens()
                                 reDrawNightReminders()
                                 reDrawHUD()
                             }})
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
        appendLog(null, player.name + " died")
    }
    else if (!player.alive && alive_update.alive) {
        appendLog(null, player.name + " was revived")
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
            vote_names += player.name + ', '
        }
    }
    if (votes) {
        vote_names = vote_names.slice(0, -2)
    }
    
    let clock_info = game_state.clock_info
    appendLog(2, (
        getPlayerBySeatID(clock_info.nominator).name 
        + (clock_info.free ? " free" : "") 
        + " nominated " 
        + getPlayerBySeatID(clock_info.nominatee).name 
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

socket.on('phase update', (day_phase) => {
    game_state.day_phase = day_phase
    appendLog(0, `Phase change to ${day_phase == true ? 'day' : 'night'}`)
    // Wipe nominations
    for (let player of game_state.player_info) {
        player.nominated = false
        player.nominateed = false
    }
    reDrawChangePhase()
})

socket.on('edition update', (edition) => {
    game_state.edition = edition
    reDraw()
})

socket.on('new edition', (edition) => {
    game_state.editions.push(edition)
    reDrawEditionMenu()
    if (client_type) {
        socket.emit('edition update', channel_id, edition.id)
    }
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
        let msg = nightAlert(night_action)
        appendLog(1, 'Received Night Action:<br>' + msg)
        alert_box_info.push({'text' : msg})
        alert_box.check()
    }
    else {
        let timer = (new Date()).getTime()
        let msg = nightAlert(night_action)
        appendLog(1, 'Received Night Action:<br>' + msg)
        alert_box_info.push({'text' : msg, 'func' : () => {
            if (night_action.name == 'Demon Info') {
                game_state.demon_bluffs = night_action.info.characters
                setSSDemonBluffs(game_state.demon_bluffs)
                reDrawDemonBluffs()
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

socket.on('reset', (state) => {
    for (let key in state) {
        if (key == 'player_info') {
            for (let player of state[key]) {
                for (let key2 in player) {
                    let match = getPlayerBySeatID(player.seat_id)
                    if (match != null) {
                        if (!(['reminders', 'character'].includes(key2)) || (key2 == 'character' && your_seat_id == player.seat_id)) {
                            match[key2] = player[key2]
                            if (key2 == 'character') {
                                let sspi = getSSPlayerInfo()
                                sspi[player.seat_id].character = player.character
                                setSSPlayerInfo(sspi)
                            }
                        } else if (client_type) {
                            if (key2 == 'character') {
                                match[key2] = player[key2]
                            }
                        }
                    }
                    else {
                        game_state.player_info.push(player)
                    }
                }
            }
        }
        else if (!['demon_bluffs', 'group_night_action'].includes(key)) {
            game_state[key] = state[key]
        }
    }
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
        reDrawPlayers()
        alert_box_info.push({'text' : 'Your seat was removed', 'func' : () => {requestSitDown();reDrawHUD();}})
        alert_box.check()
    }
    reDrawHUD()
})

socket.on('kick update', (seat_id) => {
    let player = getPlayerBySeatID(seat_id)
    player.socket_id = false
    reDrawSocketIcons()
    if (player.seat_id == your_seat_id) {
        your_seat_id = null
        delete sessionStorage.seat_id
        reDrawPlayers()
        alert_box_info.push({'text' : 'You were kicked from your seat', 'func' : () => {requestSitDown()}})
        alert_box.check()
    }
})

socket.on('host update', (host_update) => {
    game_state.host_socket_id = host_update
    reDrawHUD()
})

socket.on('finish', () => {
    alert_box_info.push({'text' : 'Your game has closed', 'func' : () => {
        reDrawHUD()
        reDrawDemonBluffs()
        game_menu.style.visibility = ''
        game.style.visibility = 'hidden'
        non_square.style.visibility = 'hidden'
        clearLog()
        wipeSessionStorage()
    }})
    alert_box.check()
    
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
    
    if (sessionStorage.log) {
        setLog(sessionStorage.log)
        appendLog(null, 'Reconnected')
    }
    else {
        appendLog(null, 'Connected')
    }
    
    
    game_menu.style.visibility = ''
    game.style.visibility = 'hidden'
    non_square.style.visibility = 'hidden'
})

socket.on('disconnect', () => {
    // window.location.reload()
})
























