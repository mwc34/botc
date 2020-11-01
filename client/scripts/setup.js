function setup() {
    game.style.position = 'absolute'
    preloadImage('assets/other/day.png')
    preloadImage('assets/other/night.jpg')
    document.body.style.backgroundImage = 'url("assets/other/night.jpg")'
    document.body.style.backgroundRepeat = 'no-repeat'
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.backgroundSize = 'cover'
    
    document.onkeydown = (key) => {
        // Close Alert Box
        if (alert_box.style.visibility == '') {
            if (key.key == 'Enter' && !key.shiftKey) {
                for (let i=2; i<5; i++) {
                    if (alert_box.children[i].style.display == 'flex') {
                        alert_box.children[i].children[0].onclick()
                        break
                    }
                }
            }
            else if (key.key == 'Escape') {
                for (let i=2; i<5; i++) {
                    if (alert_box.children[i].style.display == 'flex') {
                        alert_box.children[i].children[alert_box.children[i].childElementCount-1].onclick()
                        break
                    }
                }
            }
        }
    }
    
    window.onresize = () => {
        clearTimeout(window.resizedFinished)
        window.resizedFinished = setTimeout(() => {
            reSize()
            reDraw()
        }, 250)
    }
    
    setupMenu()
    setupClock()
    setupTokens()
    setupNames()
    setupDeathTokens()
    setupVotes()
    setupSocketIcons()
    setupDeadVote()
    setupReminders()
    setupGameMenu()
    setupDayPhase()
    setupInfo()
    setupAddPlayer()
    setupFinishGame()
    setupCancelSelect()
    setupRefresh()
    setupSyncCharacters()
    setupTokenMenu()
    setupChooseCharacters()
    setupOpenReferenceSheet()
    setupChangeEdition()
    setupReminderMenu()
    setupShufflePlayers()
    setupLeaveGame()
    setupHostConnected()
    setupCharacterSplit()
    setupAliveVoteInfo()
    setupNightActionMenu()
    setupDemonBluffs()
    setupNightReminders()
    setupChannelID()
    setupSquare()
    setupInfoHUD()
    setupActionHUD()
    setupCurrentEdition()
    setupChangePhase()
    setupInfoHoverBox()
    setupAlertBox()
    setupGameLog()
    setupEditionMenu()
    setupEditionIcon()
    setupRevealGrimoire()
    setupNominationStatus()
    setupChangeNominationStatus()
}

function addHover(e, colour_1 = getFontColour(), colour_2 = getSelectedFontColour()) {
    e.onmouseenter = () => {
        e.style.color = colour_2
    }
    e.onmouseleave = () => {
        e.style.color = colour_1
    }
}

function setupMenu() {          
    host_menu.style.visibility = 'hidden'
    player_menu.style.visibility = 'hidden'
    host_menu.style.zIndex = 2
    player_menu.style.zIndex = 2
    host_menu.style.position = 'absolute'
    player_menu.style.position = 'absolute'
    
    for (let menu of [host_menu, player_menu]) {
        for (let i=0; i < 2; i++) {
            for (let j=0; j < menu.children[i].childElementCount; j++) {
                let option = menu.children[i].children[j]
                option.style.position = 'absolute'
                option.style.zIndex = 'inherit'
            }
        }
    }
    
    // Onleaves
    
    host_menu.onmouseleave = () => {host_menu.style.visibility = 'hidden'}
    player_menu.onmouseleave = () => {player_menu.style.visibility = 'hidden'}

    // Onclicks

    // Host
    
    // Rename
    host_menu.children[1].children[0].onclick = () => {
        host_menu.style.visibility = 'hidden'
        alert_box_info.push({
            'text' : 'Enter the new name',
            'type' : 'prompt',
            'func' : (res) => {
                if (res) {
                    socket.emit('name update', channel_id, {'seat_id' : token_selected_seat_id, 'name' : res})
                }
            }
        })
        alert_box.check()
    }
    
    // Nominate
    host_menu.children[0].children[0].onclick = () => {
        host_menu.style.visibility = 'hidden'
        if (!game_state.day_phase) {
            alert_box_info.push({'text' : 'You can\'t nominate during the night phase'})
            alert_box.check()
        }
        else if (getPlayerBySeatID(token_selected_seat_id).alive && !game_state.clock_info.active) { 
            token_click_type = 2
            reDrawHUD()
        }
        
    }
    
    // Free Nominate
    host_menu.children[0].children[1].onclick = () => {
        host_menu.style.visibility = 'hidden'
        if (!game_state.day_phase) {
            alert_box_info.push({'text' : 'You can\'t nominate during the night phase'})
            alert_box.check()
        }
        else if (!game_state.clock_info.active) { 
            token_click_type = 6
            reDrawHUD()
        }
        
    }
    
    // Change Character
    host_menu.children[0].children[2].onclick = () => {
        let menu = client_type ? host_menu : player_menu;
        menu.style.visibility = 'hidden'
        
        if (!token_menu_info.active) {
            token_menu_info.choices = 1
            token_menu_info.type = 1
            token_menu_info.valid_teams = client_type ? [] : ['extra', 'townsfolk', 'outsider', 'minion', 'demon']
            token_menu_info.selected = []
            token_menu_info.out_of_play = false
            token_menu_info.active = true
            reDrawTokenMenu()
        }
    }
    
    // Add Reminder
    host_menu.children[0].children[3].onclick = () => {
        let menu = client_type ? host_menu : player_menu;
        menu.style.visibility = 'hidden'
        
        reDrawReminderMenu()
        reminder_menu.style.visibility = ''
    }
    
    // Kill / Revive
    host_menu.children[0].children[4].onclick = () => {
        host_menu.style.visibility = 'hidden'
        let player = getPlayerBySeatID(token_selected_seat_id)
        socket.emit('alive update', channel_id, {'seat_id' : token_selected_seat_id, 'alive' : !player.alive})
    }
    
    // Move player
    host_menu.children[1].children[1].onclick = () => {
        host_menu.style.visibility = 'hidden'
        if (!game_state.clock_info.active) {
            token_click_type = 3
            reDrawHUD()
        }
    }
    
    // Swap seats
    host_menu.children[1].children[2].onclick = () => {
        host_menu.style.visibility = 'hidden'
        if (!game_state.clock_info.active) {
            token_click_type = 4
            reDrawHUD()
        }
    }
    
    // Kick
    host_menu.children[1].children[3].onclick = () => {
        host_menu.style.visibility = 'hidden'
        socket.emit('kick update', channel_id, token_selected_seat_id)
    }
    
    // Remove
    host_menu.children[1].children[4].onclick = () => {
        host_menu.style.visibility = 'hidden'
        if (!game_state.clock_info.active) {
            socket.emit('remove update', channel_id, token_selected_seat_id)
        }
    }
    
    // Night Action
    for (let i=0; i<host_menu.children[0].childElementCount - 5; i++) { // MAGIC NUMBER
        host_menu.children[0].children[5 + i].onclick = () => {
            host_menu.style.visibility = 'hidden'
            let player = getPlayerBySeatID(token_selected_seat_id)
            if (player.synced) {
                let c = getCharacterFromID(player.character)
                let temp = []
                if (c != null) {
                    temp = JSON.parse(JSON.stringify(c.night_actions))
                }
                for (let a of default_night_action) {
                    temp.push(a)
                }
                for (let a of getScopedNightActions(c)) {
                    temp.push(a)
                }
                
                if (temp.length > i) {
                    night_action = temp[i]

                    night_action_info.seat_id = token_selected_seat_id
                    night_action_info.name = night_action.name
                    night_action_info.players = []
                    night_action_info.characters = []
                    
                    // For ever changing night actions
                    if (night_action.create) {
                        console.log(night_action)
                        // Pop up form to calculate data
                        night_action_menu.children[1].children[1].children[1].innerHTML = night_action.in_players || 0
                        night_action_menu.children[2].children[1].children[1].innerHTML = night_action.in_characters || 0
                        night_action_menu.children[3].children[1].children[1].innerHTML = night_action.players || 0
                        night_action_menu.children[4].children[1].children[1].innerHTML = night_action.characters || 0
                        
                        // Player restrictions
                        let list = night_action.player_restrictions || []
                        night_action_menu.children[5].children[1].style.opacity = deselected_opacity + (1 - deselected_opacity) * list.includes("cancel")
                        night_action_menu.children[5].children[2].style.opacity = deselected_opacity + (1 - deselected_opacity) * list.includes("others")
                        night_action_menu.children[5].children[3].style.opacity = deselected_opacity + (1 - deselected_opacity) * (list.includes("alive") || !list.includes("dead"))
                        night_action_menu.children[5].children[4].style.opacity = deselected_opacity + (1 - deselected_opacity) * (list.includes("dead") || !list.includes("alive"))
                        
                        
                        // Character restrictions
                        list = night_action.character_restrictions || []
                        night_action_menu.children[6].children[1].style.opacity = deselected_opacity + (1 - deselected_opacity) * list.includes("cancel")
                        let teams = ['traveler', 'townsfolk', 'outsider', 'minion', 'demon']
                        let present_teams = []
                        for (let t of teams) {
                            if (list.includes(t)) {
                                present_teams.push(t)
                            }
                        }
                        for (k=0; k<5; k++) {
                            night_action_menu.children[6].children[2 + k].style.opacity = deselected_opacity + (1 - deselected_opacity) * (present_teams.length == 0 || present_teams.includes(teams[k]))
                        }
                        night_action_menu.children[7].children[0].style.opacity = deselected_opacity + (1 - deselected_opacity) * Boolean(night_action.grimoire)
                        night_action_menu.children[8].children[1].value = night_action.info || ''
                        
                        night_action_menu.style.visibility = ''
                        
                    }
                    else {
                        startNightAction(night_action)
                    }
                }
            }
            else {
                alert_box_info.push({'text' : "You must sync the characters first"})
                alert_box.check()
            }
        }
    }
    
    
    
    // Player
    
    // Nominate
    player_menu.children[0].children[0].onclick = () => {
        player_menu.style.visibility = 'hidden'
        if (!game_state.day_phase) {
            alert_box_info.push({'text' : 'You can\'t nominate during the night phase'})
            alert_box.check()
        }
        else if (!game_state.nominations_open) {
            alert_box_info.push({
                'text' : 'Nominations are not open',
            })
            alert_box.check()
        }
        else if (!game_state.clock_info.active) {
            let nominator = getPlayerBySeatID(your_seat_id)
            if (nominator.alive) {
                socket.emit('nomination update', channel_id, {'nominator' : your_seat_id, 'nominatee' : token_selected_seat_id})
            }
        }
    }
    
    // Change Character
    player_menu.children[0].children[1].onclick = host_menu.children[0].children[2].onclick // MAGIC NUMBER
    
    // Add Reminder
    player_menu.children[0].children[2].onclick = host_menu.children[0].children[3].onclick // MAGIC NUMBER
    // Vacate
    player_menu.children[1].children[0].onclick = () => {
        player_menu.style.visibility = 'hidden'
        if (your_seat_id == token_selected_seat_id) {
            socket.emit('kick update', channel_id, your_seat_id)
        }
    }
}

function setupTokenMenu() {
    token_menu.style.zIndex = 200
    token_menu.style.position = 'absolute'
    token_menu.style.visibility = 'hidden'
    
    // Info
    let info_bar = document.createElement('div')
    info_bar.style.position = 'absolute'
    info_bar.style.zIndex = 'inherit'
    
    // Shuffle Characters
    let shuffle_characters = document.createElement('div')
    shuffle_characters.style.position = 'absolute'
    shuffle_characters.style.zIndex = 'inherit'
    shuffle_characters.innerHTML = 'Choose Randomly'
    shuffle_characters.onclick = () => {
        token_menu_info.selected = []
        teams = ['townsfolk', 'outsider', 'minion', 'demon']
        for (let i=0; i<4; i++) {
            let ids = getTeamIDs(game_state.edition, teams[i])
            let count = player_split[Math.min(15, token_menu_info.choices) - 5][teams[i]]
            for (let j=0; j < count; j++) {
                token_menu_info.selected.push(ids.splice(Math.floor(Math.random() * ids.length), 1)[0])
            }
        }
        reDrawTokenMenu()
    }
    
    // Cancel Button
    let cancel_button = document.createElement('div')
    cancel_button.style.position = 'absolute'
    cancel_button.style.zIndex = 'inherit'
    cancel_button.innerHTML = 'Cancel'
    cancel_button.onclick = () => {
        token_menu_info.active = false
        reDrawTokenMenu()
    }
    
    // Finish button
    let finish_button = document.createElement('div')
    finish_button.style.position = 'absolute'
    finish_button.style.zIndex = 'inherit'
    finish_button.innerHTML = 'Finish'
    finish_button.onclick = () => {
        if (token_menu_info.selected.length >= token_menu_info.choices || (token_menu_info.type == 0 && token_menu_info.selected.length == 15) || (token_menu_info.type == 2 && (night_action_info.character_restrictions.includes("cancel") || client_type))) {
            token_menu_info.active = false
            reDrawTokenMenu()
            switch (token_menu_info.type) {
                case 0:
                    for (let i=0; i < game_state.player_info.length; i++) {
                        let player = getPlayerBySeat(i)
                        if (token_menu_info.selected.length > 0 && (!player.character || getCharacterFromID(player.character).team != 'traveler')) {
                            let c = token_menu_info.selected.splice(Math.floor(Math.random() * token_menu_info.selected.length), 1)[0]
                            if (player.character != c) {
                                player.character = c
                                player.synced = false
                                let sspi = getSSPlayerInfo()
                                sspi[player.seat_id].character = player.character
                                setSSPlayerInfo(sspi)
                            }
                        }
                    }
                    reDrawTokens()
                    reDrawNightReminders()
                    reDrawHUD()
                    break
                case 1:
                    let player = getPlayerBySeatID(token_selected_seat_id)
                    let c = token_menu_info.selected[0]
                    if (player.character != c) {
                        player.character = c
                        player.synced = false
                        let sspi = getSSPlayerInfo()
                        sspi[player.seat_id].character = player.character
                        setSSPlayerInfo(sspi)
                    }
                    reDrawTokens()
                    reDrawNightReminders()
                    reDrawHUD()
                    break
                case 2:
                    night_action_info.characters = []
                    for (let c of token_menu_info.selected) {
                        night_action_info.characters.push(getCharacterFromID(c).id)
                    }
                    if (!client_type || night_action_info.characters.length >= token_menu_info.choices || night_action_info.character_restrictions.includes("cancel")) {
                        night_action_info.func()
                    }
                    else {
                        alert_box_info.push({'text' : 'Night Action Cancelled'})
                        alert_box.check()
                    }
                    break
            }
        }
    }
    
    // Team Selection
    let team_selection = document.createElement('div')
    team_selection.style.position = 'absolute'
    team_selection.style.zIndex = 'inherit'
    
    for (let i=0; i<4; i++) {
        let team = document.createElement('div')
        team.style.position = 'absolute'
        team.style.zIndex = 'inherit'
        
        team_selection.appendChild(team)
    }
    
    token_menu.appendChild(info_bar)
    token_menu.appendChild(shuffle_characters)
    token_menu.appendChild(cancel_button)
    token_menu.appendChild(finish_button)
    token_menu.appendChild(team_selection)
    
    let max_numbers = [1, 5, 7, 6, 4, 4, 4]
    for (let k=0; k < max_numbers.length; k++) {
    
        // Team
        let team = document.createElement('div')
        team.style.position = 'absolute'
        team.style.zIndex = 'inherit'
        for (let i=0; i<max_numbers[k]; i++) {
            let t = document.createElement('div')
            t.style.position = 'absolute'
            t.style.zIndex = 'inherit'
            
            let bg_image = document.createElement('img')
            bg_image.style.position = 'absolute'
            bg_image.src = 'assets/other/token.png'
            
            let icon_image = document.createElement('img')
            icon_image.style.position = 'absolute'
            
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            svg.style.position = 'absolute'
            svg.innerHTML = '<path fill="transparent" id="token_' + i + '_menu_curve"></path><text style="font-size:16px"><textPath xlink:href="#token_' + i + '_menu_curve" text-anchor="middle" startOffset="50%"></textPath></text>'
            
            t.appendChild(bg_image)
            t.appendChild(icon_image)
            t.appendChild(svg)
            
            t.onclick = () => {
                let id = getIconIDFromPath(t.children[1].src)
                if (token_menu_info.selected.includes(id)) {
                    token_menu_info.selected.splice(token_menu_info.selected.indexOf(id), 1)
                }
                else {
                    token_menu_info.selected.push(id)
                    while (token_menu_info.selected.length > token_menu_info.choices) {
                        let idx = 0
                        if (token_menu_info.type == 0) {
                            let c = getCharacterFromID(id)
                            for (let j=0; j < token_menu_info.selected.length-1; j++) {
                                let new_c = getCharacterFromID(token_menu_info.selected[j])
                                if (c && new_c && c.team == new_c.team) {
                                    idx = j
                                    break
                                }
                            }
                        }
                        token_menu_info.selected.splice(idx, 1)
                    }
                }
                reDrawTokenMenu()
            }
            let e = t
            t.onmouseenter = () => {
                let c = getCharacterFromID(getIconIDFromPath(t.children[1].src))
                if (c) {
                    info_hover_box.children[0].innerHTML = c.ability
                    
                    // Show on left
                    if (parseFloat(token_menu.style.left) + parseFloat(team.style.left) + parseFloat(e.style.left) + parseFloat(e.style.width)/2 > size/2) {
                        info_hover_box.style.left = parseFloat(square.style.left) + parseFloat(token_menu.style.left) + parseFloat(team.style.left) + parseFloat(e.style.left) - getInfoHoverBoxOffset() - parseFloat(info_hover_box.style.width) + 'px'
                        info_hover_box.style.justifyContent = 'right'
                    }
                    // Show on right
                    else {
                        info_hover_box.style.left = parseFloat(square.style.left) + parseFloat(token_menu.style.left) + parseFloat(team.style.left) + parseFloat(e.style.left) + parseFloat(e.style.width) + getInfoHoverBoxOffset() + 'px'
                        info_hover_box.style.justifyContent = 'left'
                    }
                    
                    info_hover_box.style.top = parseFloat(square.style.top) + parseFloat(e.style.top) + parseFloat(e.style.height)/2 + parseFloat(team.style.top) + parseFloat(token_menu.style.top) + 'px'
                    
                    info_hover_box.style.visibility = ''
                }
            }
            
            t.onmouseleave = () => {
                info_hover_box.style.visibility = 'hidden'
            }
            
            team.appendChild(t)
        }
        token_menu.appendChild(team)
    }
    
}

function setupReminderMenu() {
    reminder_menu.style.zIndex = 100
    reminder_menu.style.position = 'absolute'
    reminder_menu.style.visibility = 'hidden'
    
    let info_bar = document.createElement('div')
    info_bar.style.zIndex = 'inherit'
    info_bar.style.position = 'absolute'
    info_bar.innerHTML = 'Choose a Reminder Token'
    
    let cancel_bar = document.createElement('div')
    cancel_bar.style.zIndex = 'inherit'
    cancel_bar.style.position = 'absolute'
    cancel_bar.innerHTML = 'Cancel'
    cancel_bar.onclick = () => {
        reminder_menu.style.visibility = 'hidden'
    }
    
    reminder_menu.appendChild(info_bar)
    reminder_menu.appendChild(cancel_bar)
    
    let max_columns = Math.floor(size/getReminderMenuSize())
    let max_rows = max_columns - 2
    
    for (let i=0; i < max_rows; i++) {
        let row = document.createElement('div')
        row.style.position = 'absolute'
        for (let j=0; j < max_columns; j++) {
            let reminder = document.createElement('div')
            reminder.style.position = 'absolute'
            
            let bg_image = document.createElement('img')
            bg_image.src = 'assets/other/reminder.png'
            bg_image.style.position = 'absolute'
                
            let icon_image = document.createElement('img')
            icon_image.style.position = 'absolute'
            
            let reminder_text = document.createElement('div')
            reminder_text.style.position = 'absolute'
            
            reminder.appendChild(bg_image)
            reminder.appendChild(icon_image)
            reminder.appendChild(reminder_text)
            
            reminder.onclick = () => {
                let player = getPlayerBySeatID(token_selected_seat_id)
                if (player.reminders.length < max_reminders) {
                    let icon = getIconIDFromPath(icon_image.src)
                    let text = ''
                    if (icon == 'custom') {
                        alert_box_info.push({
                            'text' : 'Enter your custom text',
                            'type' : 'prompt',
                            'func' : (res) => {
                                let text = res
                                if (text) {
                                    player.reminders.push({'icon' : icon == 'custom' ? '' : icon, 'text' : text})
                                    let sspi = getSSPlayerInfo()
                                    sspi[player.seat_id].reminders = player.reminders
                                    setSSPlayerInfo(sspi)
                                    socket.emit('reminder update', channel_id, {'seat_id' : player.seat_id, 'reminders' : player.reminders})
                                    reminder_menu.style.visibility = 'hidden'
                                    reDrawReminders()
                                }
                            }
                        })
                        alert_box.check()
                    }
                    else {
                        text = reminder_text.innerHTML
                    }
                    if (text) {
                        player.reminders.push({'icon' : icon == 'custom' ? '' : icon, 'text' : text})
                        let sspi = getSSPlayerInfo()
                        sspi[player.seat_id].reminders = player.reminders
                        setSSPlayerInfo(sspi)
                        socket.emit('reminder update', channel_id, {'seat_id' : player.seat_id, 'reminders' : player.reminders})
                        reminder_menu.style.visibility = 'hidden'
                        reDrawReminders()
                    }
                }
                else {
                    alert_box_info.push({'text' : 'That player already has the maximum number of reminders'})
                    alert_box.check()
                }
            }
            
            row.appendChild(reminder)
        }
        reminder_menu.appendChild(row)
    }
}

function setupClock() {
    clock.style.zIndex = 3
    clock_buttons.style.zIndex = 4
    clock.style.visibility = 'hidden'
    player_clock_buttons.style.visibility = 'hidden'
    clock.style.position = 'absolute'
    for (let i=0; i<2; i++) {
        let hand = hands.children[i]
        hand.style.position = 'absolute'
        hand.style.zIndex = 'inherit'
    }
    
    for (let i=0; i < player_clock_buttons.childElementCount + host_clock_buttons.childElementCount; i++) {
        let t = i % host_clock_buttons.childElementCount
        let button = i < host_clock_buttons.childElementCount ? host_clock_buttons.children[t] : player_clock_buttons.children[t]
        // Independent visibility for host buttons
        if (i < 4) {
            button.style.visibility = 'hidden'
        }
        // Voting onclicks for player
        else {
            button.onclick = () => {
                socket.emit('vote update', channel_id, i==5 ? true : false)
            }
        }
        button.style.zIndex = 'inherit'
        button.style.position = 'absolute'
    }
    
    // Onclicks for host
    
    // Start Vote
    host_clock_buttons.children[0].onclick = () => {
        socket.emit('start vote update', channel_id)
    }
    
    // Cancel
    host_clock_buttons.children[1].onclick = () => {
        socket.emit('finish vote update', channel_id)
    }
    
    // Reset Vote
    host_clock_buttons.children[2].onclick = () => {
        socket.emit('reset vote update', channel_id)
    }
    
    // Finish
    host_clock_buttons.children[3].onclick = () => {
        socket.emit('finish vote update', channel_id)
    }
    
    
    // Clock Vote Info
    let dan_values = [500, 1000, 2000, 3000, 5000]
    clock_vote_info.style.position = 'absolute'
    clock_vote_info.children[1].onclick = () => {
        let clock_info = game_state.clock_info
        let new_value = dan_values[Math.max(0, dan_values.indexOf(clock_info.interval)-1)]
        socket.emit('interval update', channel_id, new_value)
        // socket.emit('interval update', channel_id, Math.min(Math.max(Number(clock_vote_info.children[2].innerHTML) - 1, 1), 10) * 1000)
    }
    clock_vote_info.children[3].onclick = () => {
        let clock_info = game_state.clock_info
        // socket.emit('interval update', channel_id, Math.min(Math.max(Number(clock_vote_info.children[2].innerHTML) + 1, 1), 10) * 1000)
        socket.emit('interval update', channel_id, dan_values[Math.min(dan_values.length - 1, dan_values.indexOf(clock_info.interval)+1)])
    }
}

function setupTokens() {
    for (let i=0; i < max_players; i++) {
        let token = document.createElement('div')
        let token_seat = i
        token.style.zIndex = 'inherit'
        token.style.position = 'absolute'
        token.style.visibility = 'hidden'
        
        let bg_image = document.createElement('img')
        bg_image.style.position = 'absolute'
        bg_image.src = 'assets/other/token.png'
        
        let icon_image = document.createElement('img')
        icon_image.style.position = 'absolute'
        
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.style.position = 'absolute'
        svg.innerHTML = '<path fill="transparent" id="token_' + i + '_curve"></path><text style="font-size:16px"><textPath xlink:href="#token_' + i + '_curve" text-anchor="middle" startOffset="50%"></textPath></text>'
        
        token.appendChild(bg_image)
        token.appendChild(icon_image)
        token.appendChild(svg)
        
        token.onmouseenter = () => {
            let player = getPlayerBySeat(token_seat)
            if (player.character) {
                let c = getCharacterFromID(player.character)
                info_hover_box.children[0].innerHTML = c.ability
                
                // Show on left
                if (parseFloat(token.style.left) + parseFloat(token.style.width)/2 > size/2) {
                    info_hover_box.style.left = parseFloat(square.style.left) + parseFloat(token.style.left) - getInfoHoverBoxOffset() - parseFloat(info_hover_box.style.width) + 'px'
                    info_hover_box.style.justifyContent = 'right'
                }
                // Show on right
                else {
                    info_hover_box.style.left = parseFloat(square.style.left) + parseFloat(token.style.left) + parseFloat(token.style.width) + getInfoHoverBoxOffset() + 'px'
                    info_hover_box.style.justifyContent = 'left'
                }
                
                
                info_hover_box.style.top = parseFloat(token.style.top) + parseFloat(token.style.height)/2 + 'px'
                
                info_hover_box.style.visibility = ''
            }
        }
        
        token.onmouseleave = () => {
            info_hover_box.style.visibility = 'hidden'
        }
        
        token.onclick = (event) => {
            info_hover_box.style.visibility = 'hidden'
            let to_send = {}
            switch (token_click_type) {
                // Open Menu
                case 0:
                    if (!getMenuOpen()) {
                        token_selected_seat_id = getPlayerBySeat(token_seat).seat_id
                        let menu = (client_type ? host_menu : player_menu)
                        menu.style.left = Math.max(Math.min(event.pageX - getMenuHeight() * 0.5 - getBorderSize(), window.innerWidth - parseFloat(menu.style.width) - getBorderSize()*3), 0) + 'px'
                        let no_buttons = 5 // MAGIC NUMBER
                        
                        menu.children[0].style.visibility = ''
                        menu.children[1].style.visibility = 'hidden'
                        
                        // Hide Extra Night Options
                        if (client_type) {
                            // MAGIC NUMBER
                            let c = getCharacterFromID(getPlayerBySeatID(token_selected_seat_id).character)
                            for (let i=0; i<host_menu.children[0].childElementCount - 5; i++) {
                                if (!game_state.day_phase) {
                                    let temp = []
                                    if (c != null) {
                                        temp = JSON.parse(JSON.stringify(c.night_actions))
                                    }
                                    for (let a of default_night_action) {
                                        temp.push(a)
                                    }
                                    for (let a of getScopedNightActions(c)) {
                                        temp.push(a)
                                    }
                                    if (temp.length > i) {
                                        menu.children[0].children[5 + i].innerHTML = temp[i].name
                                        menu.children[0].children[5 + i].style.visibility = ''
                                        no_buttons++
                                    }
                                    else {
                                        menu.children[0].children[5 + i].style.visibility = 'hidden'
                                    }
                                }
                                else {
                                    menu.children[0].children[5 + i].style.visibility = 'hidden'
                                }
                            }
                            
                            if (getPlayerBySeatID(token_selected_seat_id).alive) {
                                menu.children[0].children[4].innerHTML = 'Kill'
                            }
                            else {
                                menu.children[0].children[4].innerHTML = 'Revive'
                            }
                            menu.style.height = no_buttons * getMenuHeight() + 'px'
                        }
                        else {
                            menu.style.height = menu.children[0].childElementCount * getMenuHeight() + 'px'
                        }
                        menu.style.top = Math.max(Math.min(event.pageY - getMenuHeight() * 0.5 - getBorderSize(), window.innerHeight - parseFloat(menu.style.height) - getBorderSize()*3), 0) + 'px'
                        
                        menu.style.visibility = ''
                    }
                    break;
                // Sit down
                case 1:
                    token_click_type = 0
                    reDrawHUD()
                    socket.emit('sit update', channel_id, token_seat)
                    break;
                // Nominate for host
                case 2:
                    token_click_type = 0
                    reDrawHUD()
                    socket.emit('nomination update', channel_id, {'nominator' : token_selected_seat_id, 'nominatee' : getPlayerBySeat(token_seat).seat_id})
                    break;
                // Move player
                case 3:
                    token_click_type = 0
                    reDrawHUD()
                    let playerA = getPlayerBySeatID(token_selected_seat_id)
                    let playerB = getPlayerBySeat(token_seat)
                    let count = (game_state.player_info.length + playerA.seat - playerB.seat) % game_state.player_info.length
                    
                    for (let j=0; j < count; j++) {
                        let seat = (playerB.seat + j) % game_state.player_info.length
                        to_send[getPlayerBySeat(seat).seat_id] = (seat + 1) % game_state.player_info.length
                    }
                    to_send[playerA.seat_id] = playerB.seat
                    socket.emit('seat update', channel_id, to_send)
                    break;
                // Swap seats
                case 4:
                    token_click_type = 0;
                    reDrawHUD();

                    to_send[token_selected_seat_id] = token_seat
                    to_send[getPlayerBySeat(token_seat).seat_id] = getPlayerBySeatID(token_selected_seat_id).seat
                    socket.emit('seat update', channel_id, to_send);
                    break;
                // Night actions
                case 5:
                    let player = getPlayerBySeat(token_seat)
                    if (night_action_info.players.includes(player.seat_id)) {
                        night_action_info.players.splice(night_action_info.players.indexOf(player.seat_id), 1)
                        if (night_action_info.group) {
                            socket.emit('group night action update', channel_id, night_action_info.players)
                        }
                        reDrawTokens()
                    }
                    else if ((!night_action_info.player_restrictions.includes("others") || player.seat_id != your_seat_id) 
                                && (!night_action_info.player_restrictions.includes("alive") || player.alive)
                                && (!night_action_info.player_restrictions.includes("dead") || !player.alive)
                            ) {
                        night_action_info.players.push(player.seat_id)
                        if (night_action_info.players.length > night_action_info.in_players) {
                            night_action_info.players.splice(0, 1)
                        }
                        if (night_action_info.group) {
                            socket.emit('group night action update', channel_id, night_action_info.players)
                        }
                        if (night_action_info.players.length == night_action_info.in_players && !night_action_info.group) {
                            token_click_type = 0
                            if (night_action_info.in_characters > 0) {
                                if (!client_type) {
                                    night_action_info.start_time = (new Date()).getTime()
                                }
                                else {
                                    night_action_info.start_time = null
                                }
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
                                token_menu_info.out_of_play = night_action_info.character_restrictions.includes("out_of_play")
                                token_menu_info.active = true
                                reDrawTokenMenu()
                                
                                nightActionAnimation()
                                
                            }
                            else if (!client_type || night_action_info.players.length > 0){
                                night_action_info.func()
                            }
                        }
                        reDrawTokens()
                    }
                    reDrawHUD()
                    break
                // Free Nominate for host
                case 6:
                    token_click_type = 0
                    reDrawHUD()
                    socket.emit('nomination update', channel_id, {'nominator' : token_selected_seat_id, 'nominatee' : getPlayerBySeat(token_seat).seat_id, 'free' : true})
                    break;
            }
        }
        
        tokens.appendChild(token)
    }
}

function setupNames() {
    for (let i=0; i < max_players; i++) {
        let name = document.createElement('div')
        let token_seat = i
        name.style.zIndex = 'inherit'
        name.style.position = 'absolute'
        name.style.visibility = 'hidden'
        names.appendChild(name)
        
        name.onclick = () => {
            if (token_click_type) {
                tokens.children[token_seat].onclick()
            }
            else if (!getMenuOpen()) {
                token_selected_seat_id = getPlayerBySeat(token_seat).seat_id
                if (your_seat_id == token_selected_seat_id || client_type) { // Because there's only one option for player name
                    let menu = (client_type ? host_menu : player_menu)
                    menu.style.left = Math.max(Math.min(event.pageX - getMenuHeight() * 0.5 - getBorderSize(), window.innerWidth - parseFloat(menu.style.width) - getBorderSize()*3), 0) + 'px'
                    
                    menu.children[0].style.visibility = 'hidden'
                    menu.children[1].style.visibility = ''
                    
                    menu.style.height = menu.children[1].childElementCount * getMenuHeight() + 'px'
                    menu.style.top = Math.max(Math.min(event.pageY - getMenuHeight() * 0.5 - getBorderSize(), window.innerHeight - parseFloat(menu.style.height) - getBorderSize()*3), 0) + 'px'
                    
                    menu.style.visibility = ''
                }
            }
        }
    }
}

function setupDeathTokens() {
    for (let i=0; i < max_players; i++) {
        let death_token = document.createElement('img')
        death_token.style.zIndex = 'inherit'
        death_token.style.position = 'absolute'
        death_token.style.visibility = 'hidden'
        death_token.src = 'assets/other/shroud2.png'
        death_token.onclick = tokens.children[i].onclick
        death_tokens.appendChild(death_token)
    }
}

function setupVotes() {
    for (let i=0; i < max_players; i++) {
        for (let j=0; j < 2; j++) {
            let vote_icon = document.createElement('img')
            vote_icon.style.zIndex = 'inherit'
            vote_icon.style.position = 'absolute'
            vote_icon.style.visibility = 'hidden'
            vote_icon.src = j ? 'assets/other/yes_vote.png' : 'assets/other/no_vote.png';
            vote_icon.onclick = tokens.children[i].onclick;
            (j ? yes_votes : no_votes).appendChild(vote_icon)
        }
    }
}

function setupSocketIcons() {
    for (let i=0; i < max_players; i++) {
        let socket_icon = document.createElement('img')
        socket_icon.style.zIndex = 'inherit'
        socket_icon.style.position = 'absolute'
        socket_icon.style.visibility = 'hidden'
        socket_icons.appendChild(socket_icon)
    }
}

function setupDeadVote() {
    for (let i=0; i < max_players; i++) {
        let dead_vote = document.createElement('img')
        dead_vote.style.zIndex = 'inherit'
        dead_vote.style.position = 'absolute'
        dead_vote.style.visibility = 'hidden'
        dead_vote.src = 'assets/other/dead_vote.png'
        dead_votes.appendChild(dead_vote)
    }
}

function setupReminders() {
    for (let i=0; i < max_players; i++) {
        for (let j=0; j < max_reminders; j++) {
            let player_id = i
            let reminder_id = j
            
            let reminder = document.createElement('div')
            reminder.style.zIndex = 'inherit'
            reminder.style.position = 'absolute'
            reminder.style.visibility = 'hidden'
            
            let bg_image = document.createElement('img')
            bg_image.src = 'assets/other/reminder.png'
            bg_image.style.position = 'absolute'
            
            let icon_image = document.createElement('img')
            icon_image.style.position = 'absolute'
            
            let reminder_text = document.createElement('div')
            reminder_text.style.position = 'absolute'
            
            let x_image = document.createElement('img')
            x_image.style.position = 'absolute'
            x_image.src = getIconPath('x')
            x_image.style.visibility = 'hidden'
            
            reminder.onclick = () => {
                let player = getPlayerBySeat(player_id)
                player.reminders.splice(j, 1)
                let sspi = getSSPlayerInfo()
                sspi[player.seat_id].reminders = player.reminders
                setSSPlayerInfo(sspi)
                if (client_type) {
                    socket.emit('reminder update', channel_id, {'seat_id' : player.seat_id, 'reminders' : player.reminders})
                }
                reDrawReminders()
            }
            
            reminder.onmouseenter = () => {
                x_image.style.visibility = ''
            }
            
            reminder.onmouseleave = () => {
                x_image.style.visibility = 'hidden'
            }
            
            reminder.appendChild(bg_image)
            reminder.appendChild(icon_image)
            reminder.appendChild(reminder_text)
            reminder.appendChild(x_image)
            
            reminders.appendChild(reminder)
        }
    }
}

function setupGameMenu() {
    game_menu.style.position = 'absolute'
    for (let i=0; i < 2; i++) {
        let button = game_menu.children[i]
        button.style.position = 'absolute'
        
    }
    
    // Host onclick
    game_menu.children[0].onclick = () => {
        alert_box_info.push({
            'text' : 'Enter the channel id:',
            'type' : 'prompt',
            'func' : (res) => {
                channel_id = res
                if (channel_id) {
                    socket.emit('new host', channel_id)
                }
            }
        })
        alert_box.check()
    }
    
    // Player onclick
    game_menu.children[1].onclick = () => {
        alert_box_info.push({
            'text' : 'Enter the channel id:',
            'type' : 'prompt',
            'func' : (res) => {
                channel_id = res
                if (channel_id) {
                    socket.emit('new player', channel_id)
                }
            }
        })
        alert_box.check()
    }
}

function setupInfo() {
    info.style.position = 'absolute'
    info.style.zIndex = 100
}

function setupCancelSelect() {
    cancel_select.style.position = 'absolute'
    cancel_select.style.visibility = 'hidden'
    cancel_select.style.zIndex = 100
    cancel_select.onclick = () => {
        if (token_click_type == 5) {
            if (!client_type || night_action_info.players.length >= night_action_info.in_players || night_action_info.player_restrictions.includes("cancel")) {
                if (night_action_info.in_characters > 0) {
                    if (!client_type) {
                        night_action_info.start_time = (new Date()).getTime()
                    }
                    else {
                        night_action_info.start_time = null
                    }
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
                    token_menu_info.out_of_play = night_action_info.character_restrictions.includes("out_of_play")
                    token_menu_info.active = true
                    reDrawTokenMenu()
                    
                    nightActionAnimation()
                }
                else {
                    night_action_info.func()
                }
                token_click_type = 0
                reDrawHUD()
                reDrawTokens()
            }
            else {
                alert_box_info.push({'text' : 'Night Action Cancelled', 'func' : () => {
                    token_click_type = 0
                    reDrawHUD()
                }})
                alert_box.check()
            }
        }
        else {
            token_click_type = 0
            reDrawHUD()
        }
    }
}

function setupInfoHUD() {
    info_HUD.style.position = 'absolute'
    info_HUD.children[0].style.position = 'absolute'
    info_HUD.children[0].onclick = () => {
        for (let i=1; i < info_HUD.childElementCount; i++) {
            info_HUD.children[i].style.visibility = (info_HUD.children[i].style.visibility == 'hidden') ? '' : 'hidden'
        }
        reDrawHUD()
    }
}

function setupActionHUD() {
    action_HUD.style.position = 'absolute'
    action_HUD.children[0].style.position = 'absolute'
    action_HUD.children[0].onclick = () => {
        let visibility_state = (action_HUD.children[1].style.visibility == 'hidden') ? '' : 'hidden'
        for (let i=1; i < action_HUD.childElementCount; i++) {
            action_HUD.children[i].style.visibility = visibility_state
        }
        reDrawHUD()
    }
    
}

function setupDayPhase() {
    day_phase.style.position = 'absolute'
    day_phase.style.visibility = 'inherit'
}

function setupChangePhase() {
    change_phase.style.position = 'absolute'
    change_phase.onclick = () => {
        if (client_type && !getMenuOpen() && !game_state.clock_info.active) {
            socket.emit('phase update', channel_id, !game_state.day_phase)
        }
    }
}

function setupCurrentEdition() {
    current_edition.style.position = 'absolute'
    current_edition.style.visibility = 'inherit'
}

function setupOpenReferenceSheet() {
    open_reference_sheet.style.position = 'absolute'
    open_reference_sheet.style.visibility = 'inherit'
    open_reference_sheet.onclick = () => {
        // Load
        if (client_type && !getEditionFromID(game_state.edition).reference_sheet) {
            let input = document.createElement('input')
            input.type = 'file'
            input.accept=".pdf"
            
            input.onchange = (event) => {
                if(!window.FileReader) return; // Browser is not compatible

                var reader = new FileReader();

                reader.onload = (evt) => {
                    if(evt.target.readyState != 2) return;
                    if(evt.target.error) {
                        alert('Error while reading file');
                        return;
                    }

                    let filecontent = evt.target.result;
                    
                    socket.emit('reference sheet update', channel_id, game_state.edition, filecontent)
                };

                reader.readAsArrayBuffer(event.target.files[0]);
            };
            console.log(input)
            input.click()
        }
        else {
            window.open(`reference_sheet?channel_id=${channel_id}&edition_id=${game_state.edition}`)
        }
    }
}

function setupAddPlayer() {
    add_player.style.position = 'absolute'
    add_player.onclick = () => {
        if (game_state.player_info.length == max_players) {
            alert_box_info.push({'text' : 'You have the maximum amount of players'})
            alert_box.check()
        }
        else if (!game_state.clock_info.active && !getMenuOpen()) {
            if (client_type) {
                alert_box_info.push({
                    'text' : 'Enter the new name(s)',
                    'type' : 'prompt',
                    'multi_line' : true,
                    'func' : (res) => {
                        if (res) {
                            for (let name of res.split('\n')) {
                                socket.emit('add update', channel_id, name)
                            }
                        }
                        reDrawHUD()
                    }
                })
                alert_box.check()
            }
        }
    }
}

function setupFinishGame() {
    finish_game.style.position = 'absolute'
    finish_game.onclick = () => {
        alert_box_info.push({
            'text' : "Are you sure you want to end the game?<br>This will delete the game state!",
            'type' : "confirm",
            'func' : (res) => {
                if (res) {
                    socket.emit('finish', channel_id)
                }
            }
        })
        alert_box.check()
    }
}

function setupRevealGrimoire() {
    reveal_grimoire.style.position = 'absolute'
    reveal_grimoire.onclick = () => {
        if (client_type && !getMenuOpen()) {
            alert_box_info.push({
                'text' : 'Are you sure you want to reveal the grimoire?<br>This will show the players everything!',
                'type' : 'confirm',
                'func' : (res) => {
                    socket.emit('reveal grimoire', channel_id, game_state)
                }
            })
            alert_box.check()
        }
    }
}

function setupRefresh() {
    refresh.style.position = 'absolute'
    refresh.onclick = () => {
        socket.emit('reset', channel_id)
    }
}

function setupNominationStatus() {
    nomination_status.style.position = 'absolute'
}

function setupChangeNominationStatus() {
    change_nomination_status.style.position = 'absolute'
    change_nomination_status.onclick = () => {
        if (client_type) {
            if (game_state.day_phase) {
                socket.emit('open nominations update', channel_id, !game_state.nominations_open)
            }
            else {
                alert_box_info.push({
                    'text' : 'You can\'t open nominations during the night'
                })
                alert_box.check()
            }
        }
    }
}

function setupSyncCharacters() {
    sync_characters.style.position = 'absolute'
    sync_characters.onclick = () => {
        if (client_type) {
            let to_send = []
            for (let player of game_state.player_info) {
                if (!player.synced) {
                    socket.emit('character update', channel_id, {'seat_id' : player.seat_id, 'character' : player.character})
                }
            }
        }
    }
}

function setupChooseCharacters() {
    choose_characters.style.position = 'absolute'
    choose_characters.onclick = () => {
        if (!game_state.clock_info.active && !getMenuOpen() && client_type) {
            let traveler_count = 0
            for (let p of game_state.player_info) {
                if (p.character && getCharacterFromID(p.character).team == 'traveler') {
                    traveler_count++
                }
            }
            if (game_state.player_info.length - traveler_count >= 5) {
                token_menu_info.type = 0
                token_menu_info.choices = game_state.player_info.length - traveler_count
                token_menu_info.valid_teams = ['townsfolk', 'outsider', 'minion', 'demon']
                token_menu_info.selected = []
                token_menu_info.out_of_play = false
                token_menu_info.active = true
                reDrawTokenMenu()
            }
            else {
                alert_box_info.push({'text' : "You need at least 5 non traveler players"})
                alert_box.check()
            }
        }
    }
}

function setupChangeEdition() {
    change_edition.style.position = 'absolute'
    change_edition.onclick = () => {
        if (client_type && !getMenuOpen()) {
            edition_menu.style.visibility = ''
        }
    }
}

function setupShufflePlayers() {
    shuffle_players.style.position = 'absolute'
    shuffle_players.onclick = () => {
        if (!getMenuOpen() && !game_state.clock_info.active) {
            let new_seats = {}
            let to_choose = [...Array(game_state.player_info.length).keys()]
            for (let i=0; i < game_state.player_info.length; i++) {
                let idx = Math.floor(Math.random() * to_choose.length)
                new_seats[i] = to_choose[idx]
                to_choose.splice(idx, 1)
            }
            socket.emit('seat update', channel_id, new_seats)
        }
    }
}

function setupLeaveGame() {
    leave_game.style.position = 'absolute'
    leave_game.onclick = () => {
        socket.emit('kick update', channel_id, your_seat_id)
        game_menu.style.visibility = ''
        game.style.visibility = 'hidden'
        non_square.style.visibility = 'hidden'
        clearLog()
        wipeSessionStorage()
        socket.emit('host leave', channel_id)
        client_type = null
        channel_id = null
        // socket.disconnect()
        // let t = window.location.href.replace(/\?.*/, '')
        // window.location = window.location.pathname
    }
}

function setupHostConnected() {
    host_connected.style.position = 'absolute'
}

function setupChannelID() {
    channel_ID.style.position = 'absolute'
}

function setupCharacterSplit() {
    character_split.style.position = 'absolute'
}

function setupAliveVoteInfo() {
    alive_vote_info.style.position = 'absolute'
}

function setupNightActionMenu() {
    night_action_menu.style.visibility = 'hidden'
    night_action_menu.style.position = 'absolute'
    
    // All
    for (let i=0; i < night_action_menu.childElementCount; i++) {
        let div = night_action_menu.children[i]
        div.style.position = 'absolute'
        
        for (let j=0; j < div.childElementCount; j++) {
            div.children[j].style.position = 'absolute'
            
            // Title
            if (i < 1) {
                // pass
            }
            // Plus Minus
            else if (i < 5) {
                    div.children[1].children[j*2].style.userSelect = 'none'
                    div.children[1].children[j*2].style.position = 'relative'
                    div.children[1].children[j*2].onclick = () => {
                        div.children[1].children[1].innerHTML = Math.min(Math.max(Number(div.children[1].children[1].innerHTML) + j*2 - 1, 0), max_players + ((i+1) % 2)*(25 - max_players))
                }
            }
            // Restrictions
            else if (i < 7) {
                if (j > 0) {
                    div.children[j].onclick = () => {
                        // Grey out
                        div.children[j].style.opacity = deselected_opacity + (1 - div.children[j].style.opacity)
                    }
                }
            }
            // Grimoire
            else if (i < 8) { 
                div.children[j].onclick = () => {
                    div.children[j].style.opacity = deselected_opacity + (1 - div.children[j].style.opacity)
                }
            }
            // Info Prompt
            else if (i < 9) {
                // pass
            }
            // Finish Cancel
            else if (i < 10) {
                // Finish
                if (j==0) {
                    div.children[j].onclick = () => {
                        // Find night action in roles
                        let night_action = null
                        role_loop:
                        for (let r of game_state.roles) {
                            if (r.night_actions) {
                                for (let n_a of r.night_actions) {
                                    if (n_a.name == night_action_info.name) {
                                        night_action = n_a
                                        break role_loop
                                    }
                                }
                            }
                            if (r.night_actions_scoped) {
                                for (let n_a of r.night_actions_scoped) {
                                    if (n_a.name == night_action_info.name) {
                                        night_action = n_a
                                        break role_loop
                                    }
                                }
                            }
                        }
                        
                        // Assign values to night action
                        night_action.in_players = night_action_menu.children[1].children[1].children[1].innerHTML
                        night_action.in_characters = night_action_menu.children[2].children[1].children[1].innerHTML
                        night_action.players = night_action_menu.children[3].children[1].children[1].innerHTML
                        night_action.characters = night_action_menu.children[4].children[1].children[1].innerHTML
                        
                        let list = ['cancel', 'others', 'alive', 'dead']
                        night_action.player_restrictions = []
                        for (let k=0; k<list.length; k++) {
                            if (night_action_menu.children[5].children[1 + k].style.opacity == 1 && (k < 2 || night_action_menu.children[5].children[1 + k + 1 - 2 * (k%2)].style.opacity != 1)) {
                                night_action.player_restrictions.push(list[k])
                            }
                        }
                        
                        list = ['cancel', 'traveler', 'townsfolk', 'outsider', 'minion', 'demon']
                        night_action.character_restrictions = []
                        for (let k=0; k<list.length; k++) {
                            if (night_action_menu.children[6].children[1 + k].style.opacity == 1) {
                                night_action.character_restrictions.push(list[k])
                            }
                        }
                        
                        night_action.grimoire = night_action_menu.children[7].children[0].style.opacity == 1
                        let v = night_action_menu.children[8].children[1].value
                        if (v) {
                            night_action.info = v
                        }
                        
                        night_action_menu.style.visibility = 'hidden'
                        
                        socket.emit('role update', channel_id, game_state.roles)
                        
                        startNightAction(night_action)
                        
                    }
                }
                // Cancel
                else if (j==1) {
                    div.children[j].onclick = () => {
                        night_action_menu.style.visibility = 'hidden'
                    }
                }
            }
        }     
    }
}

function setupDemonBluffs() {
    demon_bluffs.style.position = 'absolute'
    demon_bluffs.style.visibility = 'hidden'
    for (let i=0; i<demon_bluffs.childElementCount; i++) {
        demon_bluffs.children[i].style.position = 'absolute'
        if (i > 0) {
            let bg_image = document.createElement('img')
            bg_image.style.position = 'absolute'
            bg_image.src = 'assets/other/token.png'
            
            let icon_image = document.createElement('img')
            icon_image.style.position = 'absolute'
            
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            svg.style.position = 'absolute'
            svg.innerHTML = '<path fill="transparent" id="token_' + i + '_demon_bluffs_curve"></path><text style="font-size:16px"><textPath xlink:href="#token_' + i + '_demon_bluffs_curve" text-anchor="middle" startOffset="50%"></textPath></text>'
            
            demon_bluffs.children[i].appendChild(bg_image)
            demon_bluffs.children[i].appendChild(icon_image)
            demon_bluffs.children[i].appendChild(svg)
            
            let e = demon_bluffs.children[i]
            
            demon_bluffs.children[i].onmouseenter = () => {
                let c = getCharacterFromID(getIconIDFromPath(e.children[1].src))
                if (c) {
                    info_hover_box.children[0].innerHTML = c.ability

                    info_hover_box.style.left = parseFloat(e.style.left) + parseFloat(demon_bluffs.style.left) - getInfoHoverBoxOffset() - parseFloat(info_hover_box.style.width) + 'px'
                    info_hover_box.style.justifyContent = 'right'
                    
                    info_hover_box.style.top = parseFloat(e.style.height)/2 + parseFloat(e.style.top) + parseFloat(demon_bluffs.style.top) + 'px'
                    
                    info_hover_box.style.visibility = ''
                }
            }
            
            demon_bluffs.children[i].onmouseleave = () => {
                info_hover_box.style.visibility = 'hidden'
            }
        }
    }
}

function setupNightReminders() {
    for (let i=0; i < 2 * max_players; i++) {
        let r = document.createElement('div')
        r.style.position = 'absolute'
        r.style.visibility = 'hidden'
        night_reminders.appendChild(r)
        
        let token_seat = Math.floor(i / 2)
        let side = i % 2
        
        r.onmouseenter = () => {
            let player = getPlayerBySeat(token_seat)
            if (player.character) {
                let c = getCharacterFromID(player.character)
                info_hover_box.children[0].innerHTML = (side ? (
                        `<span style="color:${getRedColour()};">Other Night Reminder</span><br>` + c.otherNightReminder
                    ) : (
                        `<span style="color:${getBlueColour()};">First Night Reminder</span><br>` + c.firstNightReminder
                    )
                )
                
                let token = tokens.children[token_seat]
                
                // Show on left
                if (parseFloat(token.style.left) + parseFloat(token.style.width)/2 > size/2) {
                    info_hover_box.style.left = parseFloat(square.style.left) + parseFloat(token.style.left) - getInfoHoverBoxOffset() - parseFloat(info_hover_box.style.width) + 'px'
                    info_hover_box.style.justifyContent = 'right'
                }
                // Show on right
                else {
                    info_hover_box.style.left = parseFloat(square.style.left) + parseFloat(token.style.left) + parseFloat(token.style.width) + getInfoHoverBoxOffset() + 'px'
                    info_hover_box.style.justifyContent = 'left'
                }
                
                info_hover_box.style.top = parseFloat(token.style.top) + parseFloat(token.style.height)/2 + 'px'
                
                info_hover_box.style.visibility = ''
            }
        }
        
        r.onmouseleave = () => {
            info_hover_box.style.visibility = 'hidden'
        }
    }
}

function setupSquare() {
    square.style.position = 'absolute'
}

function setupInfoHoverBox() {
    info_hover_box.style.visibility = 'hidden'
    info_hover_box.style.position = 'absolute'
    info_hover_box.style.zIndex = 450
}

function setupAlertBox() {
    alert_box.style.position = 'absolute'
    alert_box.style.zIndex = 500
    
    alert_box.check = () => {
        if (alert_box_info.length > 0 && alert_box.style.visibility == 'hidden') {
            alert_box.children[0].children[0].innerHTML = alert_box_info[0].text
            switch (alert_box_info[0].type) {
                // Confirm
                case "confirm":
                    alert_box.children[1].style.display = 'none'
                    alert_box.children[2].style.display = 'none'
                    alert_box.children[3].style.display = 'flex'
                    alert_box.children[4].style.display = 'none'
                    break
                // Prompt
                case "prompt":
                    alert_box.children[1].children[0].value = ''
                    if (alert_box_info[0].multi_line) {
                        alert_box.children[1].children[0].style.lineHeight = ''
                        alert_box.children[1].children[0].style.height = ''
                        alert_box.children[1].children[0].style.resize = ''
                    }
                    else {
                        alert_box.children[1].children[0].style.height = getAlertBoxRowHeight() + 'px'
                        alert_box.children[1].children[0].style.lineHeight = getAlertBoxRowHeight() + 'px'
                        alert_box.children[1].children[0].style.resize = 'none'
                    }
                    alert_box.children[1].style.display = 'flex'
                    alert_box.children[2].style.display = 'none'
                    alert_box.children[3].style.display = 'none'
                    alert_box.children[4].style.display = 'flex'
                    break
                // Alert
                default:
                    alert_box.children[1].style.display = 'none'
                    alert_box.children[2].style.display = 'flex'
                    alert_box.children[3].style.display = 'none'
                    alert_box.children[4].style.display = 'none'
                    break
            }
            alert_box.style.visibility = ''
            if (alert_box_info[0].type == "prompt") {
                alert_box.children[1].children[0].focus()
                alert_box.children[1].children[0].select()
            }
        }
    }
    
    // Text Area
    alert_box.children[1].children[0].oninput = () => {
        if (alert_box_info.length > 0 && !alert_box_info[0].multi_line) {
            alert_box.children[1].children[0].value = alert_box.children[1].children[0].value.replace('\n', '')
        }
    }
    
    // Alert
    alert_box.children[2].children[0].onclick = () => {
        let f = alert_box_info[0].func
        alert_box_info.splice(0, 1)
        alert_box.style.visibility = 'hidden'
        if (f) {
            f()
        }
        alert_box.check()
    }
    
    // Confirm
    for (let i=0; i<2; i++) {
        alert_box.children[3].children[i].onclick = () => {
            let f = alert_box_info[0].func
            alert_box_info.splice(0, 1)
            alert_box.style.visibility = 'hidden'
            if (f) {
                f(!Boolean(i))
            }
            alert_box.check()
        }
    }
    
    // Prompt
    for (let i=0; i<2; i++) {
        alert_box.children[4].children[i].onclick = () => {
            let f = alert_box_info[0].func
            alert_box_info.splice(0, 1)
            alert_box.style.visibility = 'hidden'
            if (f) {
                f(!i ? alert_box.children[1].children[0].value : null)
            }
            alert_box.check()
        }
    }
}

function setupGameLog() {
    game_log.style.position = 'absolute'
    for (let i=0; i<2; i++) {
        game_log.children[i].style.position = 'absolute'
    }
    game_log.children[1].onclick = () => {
        if (game_log.children[0].style.visibility) {
            game_log.children[0].style.visibility = ''
            game_log.style.backgroundColor = getBackgroundColour()
            game_log.style.borderColor = getBorderColour()
        }
        else {
            game_log.children[0].style.visibility = 'hidden'
            game_log.style.backgroundColor = 'transparent'
            game_log.style.borderColor = 'transparent'
        }
    }
}

function makeNewEditionDiv() {
    let div = document.createElement('div')
    
    let icon = document.createElement('img')
    let text = document.createElement('div')
    
    div.style.position = 'absolute'
    icon.style.position = 'absolute'
    text.style.position = 'absolute'
    
    div.appendChild(icon)
    div.appendChild(text)
    
    div.onclick = () => {
        socket.emit('edition update', channel_id, text.edition_id)
        edition_menu.style.visibility = 'hidden'
    }
    
    return div
}

function setupEditionMenu() {
    edition_menu.style.position = 'absolute'
    edition_menu.style.zIndex = 150
    edition_menu.style.visibility = 'hidden'
    let input = edition_menu.children[1].children[2]
    // input.style.visibility = 'hidden'
    for (let i=0; i<2; i++) {
        edition_menu.children[i].style.position = 'absolute'
        edition_menu.children[1].children[i].style.position = 'absolute'
    }
    
    input.onchange = (event) => {
        if(!window.FileReader) return; // Browser is not compatible

        var reader = new FileReader();

        reader.onload = (evt) => {
            if(evt.target.readyState != 2) return;
            if(evt.target.error) {
                alert('Error while reading file');
                return;
            }

            let filecontent = JSON.parse(evt.target.result);
            let name = event.target.files[0].name.replace(/\.[^\.]*/, "")
            let id = name.replaceAll(/[^\w]/g, "").toLowerCase()
            
            if (getEditionFromID(id)) {
                alert_box_info.push({'text' : 'An edition with that id already exists'})
                alert_box.check()
            }
            else if (getEditionFromName(name)) {
                alert_box_info.push({'text' : 'An edition with that name already exists'})
                alert_box.check()
            }
            else if (!Array.isArray(filecontent)) {
                alert_box_info.push({'text' : 'Your file is malformed'})
                alert_box.check()
            }
            else {
                let max_counts = {
                    'townsfolk' : 13,
                    'outsider' : 4,
                    'minion' : 4,
                    'demon' : 4,
                    'traveler' : 5
                }
                characters = {}
                for (let i of filecontent) {
                    let c = getCharacterFromID(i.id)
                    if (c) {
                        if (!(c.team in characters)) {
                            characters[c.team] = []
                        }
                        characters[c.team].push(c.id)
                        max_counts[c.team]--
                    }
                }
                
                if (Object.keys(characters).length == 0) {
                    alert_box_info.push({'text' : 'Your file has no valid characters'})
                    alert_box.check()
                }
                else if (Math.min(... Object.values(max_counts)) < 0) {
                    alert_box_info.push({'text' : 'Your file has too many characters of one type'})
                    alert_box.check()
                }
                else {
                    let edition = {'id' : id, 'name' : name, 'characters' : characters, 'icon' : "assets/editions/custom.png"}
                    socket.emit('new edition', channel_id, edition)
                    edition_menu.style.visibility = 'hidden'
                }
            }
        };

        reader.readAsText(event.target.files[0]);
    };
    
    // Cancel
    edition_menu.children[1].children[1].onclick = () => {
        edition_menu.style.visibility = 'hidden'
    }
}

function setupEditionIcon() {
    edition_icon.style.position = 'absolute'
}