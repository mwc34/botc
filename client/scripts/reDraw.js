function reDraw() {
    reDrawPlayers()
    reDrawClock()
    reDrawChangePhase()
    reDrawHUD()
    reDrawTokenMenu()
    reDrawReminderMenu()
    reDrawFabledDemonBluffsHUD()
    reDrawEditionMenu()
    reDrawEditionIcon()
}

function reDrawPlayers() {
    reDrawTokens()
    reDrawNames()
    reDrawDeathTokens()
    reDrawSocketIcons()
    reDrawNightActionPendings()
    reDrawVotes()
    reDrawDeadVotes()
    reDrawReminders()
    reDrawNightReminders()
}

function reDrawTokens() {
    for (let i=0; i < max_players; i++) {
        let token = tokens.children[i]
        if (i < game_state.player_info.length) {
            let player = getPlayerBySeat(i)
            let t = getIconPath(player.character)
            token.children[1].src = t
            
            if (t == '') {
                token.children[1].style.visibility = 'hidden'
            }
            else {
                token.children[1].style.visibility = ''
            }
            
            if (player.character) {
                token.children[2].children[1].children[0].textContent = getCharacterFromID(player.character).name
            }
            else {
                token.children[2].children[1].children[0].textContent = ''
            }
            
            let m = game_state.player_info.length
            let c = Number(your_seat_id)
            let keys = Object.keys(game_state.group_night_action.data).sort((a, b) => {
                return ((a-c+m) % m) - ((b-c+m) % m)
            })
            if (keys.length) {
                for (let j=0; j<4; j++) {
                    let side = 'border' + ['Top', 'Bottom', 'Left', 'Right'][j]
                    if (keys.length > j && game_state.group_night_action.data[keys[j]].players.includes(player.seat_id)) {
                        token.style[side] = getTokenBorderSize(game_state.player_info.length) + 'px solid ' + ['red', 'blue', 'yellow', 'green'][j]
                    }
                    else {
                        token.style[side] = getTokenBorderSize(game_state.player_info.length) + 'px solid transparent'
                    }
                }
                token.style.margin = -getTokenBorderSize(game_state.player_info.length) + 'px'
            }
            else if (token_click_type == 5 && night_action_info.players.includes(player.seat_id) && (!night_action_info.group || client_type)) {
                token.style.border = getTokenBorderSize(game_state.player_info.length) + 'px solid red'
                token.style.margin = -getTokenBorderSize(game_state.player_info.length) + 'px'
            }
            else if (client_type && !player.synced) {
                token.style.border = getTokenBorderSize(game_state.player_info.length) + 'px solid orange'
                token.style.margin = -getTokenBorderSize(game_state.player_info.length) + 'px'
            }
            else {
                token.style.margin = ''
                token.style.border = ''
            }
            token.style.visibility = ''
        }
        else {
            token.style.visibility = 'hidden'
        }
    }
}

function reDrawNames() {
    for (let i=0; i < max_players; i++) {
        let name = names.children[i]
        if (i < game_state.player_info.length) {
            let player = getPlayerBySeat(i)
            
            let m = game_state.player_info.length
            let c = Number(your_seat_id)
            let keys = Object.keys(game_state.group_night_action.data).sort((a, b) => {
                return ((a-c+m) % m) - ((b-c+m) % m)
            })
            if (keys.includes(player.seat_id.toString())) {
                name.style.borderColor = ['red', 'blue', 'yellow', 'green'][keys.indexOf(player.seat_id.toString())]
            }
            else {
                name.style.borderColor = getBorderColour()
            }
            
            name.innerHTML = player.name
            name.style.visibility = ''
        }
        else {
            name.style.visibility = 'hidden'
        }
    }
}

function reDrawDeathTokens() {
    for (let i=0; i < max_players; i++) {
        let death_token = death_tokens.children[i]
        if (i < game_state.player_info.length) {
            death_token.style.visibility = (getPlayerBySeat(i).alive) ? 'hidden' : ''
        }
        else {
            death_token.style.visibility = 'hidden'
        }
    }
}

function reDrawVotes() {
    let clock_info = game_state.clock_info
    let progress = 0
    if (clock_info.nominator != null && clock_info.nominatee != null) {
        if (clock_info.start_time != null) {
            progress = Math.min(1, ((new Date()).getTime() - clock_info.start_time) / (game_state.player_info.length * clock_info.interval))
        }
    }

            
            
    
            
    for (let i=0; i < max_players; i++) {
        let temp = 0
        if (clock_info.nominatee != null) {
            temp = (i - getPlayerBySeatID(clock_info.nominatee).seat + game_state.player_info.length) % game_state.player_info.length
            if (temp == 0) {
                temp = game_state.player_info.length
            }
        }

        for (let j=0; j < 2; j++) {
            let vote_icon = (j ? yes_votes : no_votes).children[i]
            if (i < game_state.player_info.length && game_state.clock_info.active && j == getPlayerBySeat(i).voting && ((progress >= temp/game_state.player_info.length && clock_info.start_time) || j)) {
                vote_icon.style.visibility = ''
            }
            else {
                vote_icon.style.visibility = 'hidden'
            }
        }
    }
}

function reDrawSocketIcons() {
    for (let i=0; i < max_players; i++) {
        let socket_icon = socket_icons.children[i]
        if (i < game_state.player_info.length && getPlayerBySeat(i).socket_id) {
            socket_icon.src = (your_seat_id == getPlayerBySeat(i).seat_id) ? 'assets/other/your_seat.png' : 'assets/other/occupied.png'
            socket_icon.style.visibility = ''
        }
        else {
            socket_icon.style.visibility = 'hidden'
        }
    }
}

function reDrawDeadVotes() {
    for (let i=0; i < max_players; i++) {
        let dead_vote = dead_votes.children[i]
        let player = getPlayerBySeat(i)
        if (i < game_state.player_info.length && !player.alive && player.dead_vote) {
            dead_vote.style.visibility = ''
        }
        else {
            dead_vote.style.visibility = 'hidden'
        }
    }
}

function reDrawNightActionPendings() {
    for (let i=0; i < max_players; i++) {
        let nap = night_action_pendings.children[i]
        let player = getPlayerBySeat(i)
        if (i < game_state.player_info.length && player.night_action) {
            nap.style.visibility = ''
        }
        else {
            nap.style.visibility = 'hidden'
        }
    }
}

function reDrawNightReminders() {
    let characters = []
    for (let p of game_state.player_info) {
        let c = getCharacterFromID(p.character)
        if (c && !characters.includes(c)) {
            characters.push(c)
        }
    }
    let attributes = ['firstNight', 'otherNight']
    
    for (let i=0; i < 2; i++) {
        let list = JSON.parse(JSON.stringify(characters))
        list.sort((a, b) => {
            return a[attributes[i]] - b[attributes[i]]
        })
        for (let j=0; j < list.length; j++) {
            if (list[j][attributes[i]] > 0) {
                list.splice(0, j)
                break
            }
        }
        if (list.length > 0 && list[list.length - 1][attributes[i]] == 0) {
            list = []
        }
        
        for (let j=0; j < list.length; j++) {
            list[j] = list[j].id
        }
        for (let j=0; j < max_players; j++) {
            let r = night_reminders.children[i + j*2]
            if (j < game_state.player_info.length) {
                let p = getPlayerBySeat(j)
                let idx = list.indexOf(p.character)
                if (idx >= 0) {
                    r.innerHTML = idx + 1
                    r.style.visibility = ''
                }
                else {
                    r.style.visibility = 'hidden'
                }
            }
            else {
                r.style.visibility = 'hidden'
            }
        }
    }
}

function reDrawReminders() {
    for (let i=0; i < max_players; i++) {
        for (let j=0; j < max_reminders; j++) {
            let reminder = reminders.children[i*max_reminders + j]
            let player = getPlayerBySeat(i)
            
            if (i < game_state.player_info.length && j < player.reminders.length) {
                if (player.reminders[j].host) {
                    reminder.style.border = getReminderBorderSize(game_state.player_info.length) + 'px solid purple'
                    reminder.style.margin = -getReminderBorderSize(game_state.player_info.length) + 'px'
                }
                else {
                    reminder.style.border = ''
                    reminder.style.margin = ''
                }
                
                
                let icon_image = reminder.children[1]
                let t = getIconPath(player.reminders[j].icon)
                icon_image.src = t
                if (t == '') {
                    icon_image.style.visibility = 'hidden'
                }
                else {
                    icon_image.style.visibility = ''
                }
                let reminder_text = reminder.children[2]
                
                let movement = parseFloat(reminder_text.style.width) * getReminderTextMovementFraction()

                // Center
                if (t == '' && reminder_text.style.width != reminder_text.style.height) {
                    reminder_text.style.top = parseFloat(reminder_text.style.top) - movement + 'px'
                    reminder_text.style.height = reminder_text.style.width
                }
                // Edge
                else if (t != '' && reminder_text.style.width == reminder_text.style.height) {
                    reminder_text.style.top = parseFloat(reminder_text.style.top) + movement + 'px'
                    reminder_text.style.height = parseFloat(reminder_text.style.height) -  movement + 'px'
                }
                
                reminder_text.innerHTML = player.reminders[j].text
                
                reminder.style.visibility = ''
            }
            else {
                reminder.style.visibility = 'hidden'
            }
        }
    }
}

function reDrawReminderMenu() {
    
    to_show = [
        {'icon' : 'good', 'text' : 'Good'},
        {'icon' : 'evil', 'text' : 'Evil'},
        {'icon' : 'custom', 'text' : 'Custom Note'},
    ]
    
    in_play = []
    for (let player of game_state.player_info) {
        in_play.push(player.character)
    }

    // Global and In Play
    let edition = getEditionFromID(game_state.edition)
    if (edition) {
        for (let team in edition.characters) {
            for (let id of edition.characters[team]) {
                let role = getCharacterFromID(id)
                // Global
                if (role.remindersGlobal) {
                    for (let t of role.remindersGlobal) {
                        to_show.push({'icon' : role.id, 'text' : t})
                    }
                }
                // In Play
                if (role.reminders) {
                    if (in_play.includes(role.id)) {
                        for (let t of role.reminders) {
                            to_show.push({'icon' : role.id, 'text' : t})
                        }
                    }
                }
            }
        }
    }
    
    // Fabled
    for (let f of game_state.fabled_in_play) {
        let fabled = getFabledFromID(f)
        if (fabled) {
            for (let t of fabled.reminders) {
                to_show.push({'icon' : fabled.id, 'text' : t})
            }
        }
    }
    
    let square_size = Math.ceil(Math.sqrt(to_show.length))
    
    let info_bar = reminder_menu.children[0]
    
    let cancel_bar = reminder_menu.children[1]

    reminder_size = getReminderMenuSize()
    let max_columns = Math.floor(size/reminder_size)
    let max_rows = max_columns - 2
    rows = Math.min(max_rows, Math.ceil(to_show.length / square_size))
    columns = Math.min(max_columns, square_size)
    
    let padding = reminder_size * getReminderGapFraction()
    
    let width = columns * (reminder_size + 2 * padding)
    let height = (reminder_size + 2 * padding)
    
    for (let i=0; i < max_rows; i++) {
        let row = reminder_menu.children[2 + i]
        if (i*columns < to_show.length) {
            row.style.visibility = ''
            row.style.top = height * (i + 1) + 'px'
            row.style.left = reminder_size/2 + 'px'
            // row.style.left = (size - columns * (reminder_size + 2 * padding))/2 + 'px'
            
            for (let j=0; j < max_columns; j++) {
                let reminder = row.children[j]
                if (i*columns + j < to_show.length && j < columns) {
                    reminder.style.visibility = ''
                    let icon_image = reminder.children[1]
                    icon_image.src = getIconPath(to_show[i*columns + j].icon)
                    
                    let reminder_text = reminder.children[2]
                    reminder_text.innerHTML = to_show[i*columns + j].text
                    
                }
                else {
                    reminder.style.visibility = 'hidden'
                }
            }
            
        }
        else {
            row.style.visibility = 'hidden'
        }
    }
    
    reminder_menu.style.width = width + reminder_size + 'px'
    reminder_menu.style.height = (rows + 2) * height + 'px'
    
    reminder_menu.style.top = (size - parseFloat(reminder_menu.style.height))/2 - getBorderSize() + 'px'
    reminder_menu.style.left = (size - parseFloat(reminder_menu.style.width))/2 - getBorderSize() + 'px'
    
    // info_bar.style.top = (size - (rows + 1) * (reminder_size + 2 * padding))/2 + 'px'
    info_bar.style.width = width + 'px'
    info_bar.style.left = reminder_size/2 + 'px'
    info_bar.style.top = reminder_size/2 + 'px'
    
    cancel_bar.style.top = parseFloat(reminder_menu.style.height) - parseFloat(cancel_bar.style.height) - reminder_size/2 - getBorderSize()*2 + 'px'
    // cancel_bar.style.left = (size - columns * (reminder_size + 2 * padding))/2 + 'px'
    cancel_bar.style.left = reminder_size/2 + 'px'
    cancel_bar.style.width = width - getBorderSize() * 2 + 'px' // columns * (reminder_size + 2 * padding) + 'px'
}

function reDrawTokenMenu() {
    
    if (token_menu_info.active) {

        // Counting for positioning
        if (token_menu_info.valid_teams.length == 0) {
            token_menu_info.valid_teams = ['extra', 'traveler', 'townsfolk', 'outsider', 'minion', 'demon']
        }
        
        let total_columns = 0
        for (let team of token_menu_info.valid_teams) {
            if (team == 'fabled') {
                let ids = []
                for (let f of game_state.fabled) {
                    ids.push(f.id)
                }
                total_columns = Math.max(total_columns, Math.min(7, ids.length))
            }
            else {
                total_columns = Math.max(total_columns, Math.min(7, getTeamIDs(game_state.edition, team).length))
            }
        }
        
        let rows = 0
        
        let width = total_columns * (getTokenMenuSize() + 2 * getTokenMenuPaddingSize())
        let height = (getTokenMenuSize() + 2 * getTokenMenuPaddingSize())
        
        // Fabled
        let ids = []
        for (let f of game_state.fabled) {
            ids.push(f.id)
        }
        if (token_menu_info.valid_teams.includes('fabled') && ids.length > 0) {
            while (ids.length > 7+7) {
                ids.pop()
            }
            for (let i=0; i<2; i++) {
                let fabled = token_menu.children[5 + i]
                for (let j=0; j<7; j++) {
                    let f = fabled.children[j]
                    if (i * 7 + j < ids.length) {
                        
                        let path = getIconPath(ids[i*7 + j])
                        f.children[1].src = path
                        if (path == '') {
                            f.children[1].style.visibility = 'hidden'
                        }
                        else {
                            f.children[1].style.visibility = ''
                        }
                        if (ids[i*7 + j]) {
                            f.children[2].children[1].children[0].textContent = getFabledFromID(ids[i*7 + j]).name
                        }
                        else {
                            f.children[2].children[1].children[0].textContent = ''
                        }
                        
                        if (token_menu_info.selected.includes(ids[i*7 + j])) {
                            f.style.border = getTokenMenuBorderSize() + 'px solid ' + (!token_menu_info.type && getFabledFromID(ids[i*7 + j]).setup ? 'purple' : 'red')
                            f.style.margin = -getTokenMenuBorderSize() + 'px'
                        }
                        else {
                            f.style.margin = ''
                            f.style.border = ''
                        }
                        f.style.visibility = ''
                    }
                    else {
                        f.style.visibility = 'hidden'
                    }
                }
                let row_length = i ? Math.max(0, ids.length - 7) : Math.min(ids.length, 7)
                if (row_length > 0) {
                    fabled.style.visibility = ''
                    fabled.style.top = getTokenMenuSize()/2 + getTokenMenuButtonHeight() + rows * height + 'px'
                    fabled.style.left = getTokenMenuSize()/2 + (total_columns - row_length) * width/(2 * total_columns) + 'px'
                    rows++
                }
                else {
                    fabled.style.visibility = 'hidden'
                }
            }
        }
        else {
            token_menu.children[5].style.visibility = 'hidden'
            token_menu.children[6].style.visibility = 'hidden'
        }
        
        // Extras & Travelers
        teams = ['extra', 'traveler']
        lengths = [1, 7]
        for (let k=0; k < teams.length; k++) {
            let team = token_menu.children[7 + k]
            let ids = getTeamIDs(game_state.edition, teams[k], token_menu_info.out_of_play)
            if (token_menu_info.valid_teams.includes(teams[k]) && ids.length > 0) {
                while (ids.length > lengths[k]) {
                    ids.pop()
                }
                
                for (let i=0; i<lengths[k]; i++) {
                    let t = team.children[i]
                    if (i < ids.length) {
                        
                        let path = getIconPath(ids[i])
                        t.children[1].src = path
                        if (path == '') {
                            t.children[1].style.visibility = 'hidden'
                        }
                        else {
                            t.children[1].style.visibility = ''
                        }
                        if (ids[i]) {
                            t.children[2].children[1].children[0].textContent = getCharacterFromID(ids[i]).name
                        }
                        else {
                            t.children[2].children[1].children[0].textContent = ''
                        }
                        
                        if (token_menu_info.selected.includes(ids[i])) {
                            t.style.border = getTokenMenuBorderSize() + 'px solid ' + (!token_menu_info.type && getCharacterFromID(ids[i]).setup ? 'purple' : 'red')
                            t.style.margin = -getTokenMenuBorderSize() + 'px'
                        }
                        else {
                            t.style.margin = ''
                            t.style.border = ''
                        }
                        t.style.visibility = ''
                    }
                    else {
                        t.style.visibility = 'hidden'
                    }
                }

                team.style.top = getTokenMenuSize()/2 + getTokenMenuButtonHeight() + rows * height + 'px'
                team.style.left = getTokenMenuSize()/2 + (total_columns - ids.length) * width/(2 * total_columns) + 'px'
                
                rows++
                
                team.style.visibility = ''
            }
            else {
                team.style.visibility = 'hidden'
            }
        }
        
        // Townsfolk
        ids = getTeamIDs(game_state.edition, 'townsfolk', token_menu_info.out_of_play)
        if (token_menu_info.valid_teams.includes('townsfolk') && ids.length > 0) {
            while (ids.length > 7+7) {
                ids.pop()
            }
            for (let i=0; i<2; i++) {
                let townsfolk = token_menu.children[9 + i]
                for (let j=0; j<7; j++) {
                    let town = townsfolk.children[j]
                    if (i * 7 + j < ids.length) {
                        
                        let path = getIconPath(ids[i*7 + j])
                        town.children[1].src = path
                        if (path == '') {
                            town.children[1].style.visibility = 'hidden'
                        }
                        else {
                            town.children[1].style.visibility = ''
                        }
                        if (ids[i*7 + j]) {
                            town.children[2].children[1].children[0].textContent = getCharacterFromID(ids[i*7 + j]).name
                        }
                        else {
                            town.children[2].children[1].children[0].textContent = ''
                        }
                        
                        if (token_menu_info.selected.includes(ids[i*7 + j])) {
                            town.style.border = getTokenMenuBorderSize() + 'px solid ' + (!token_menu_info.type && getCharacterFromID(ids[i*7 + j]).setup ? 'purple' : 'red')
                            town.style.margin = -getTokenMenuBorderSize() + 'px'
                        }
                        else {
                            town.style.margin = ''
                            town.style.border = ''
                        }
                        town.style.visibility = ''
                    }
                    else {
                        town.style.visibility = 'hidden'
                    }
                }
                let row_length = i ? Math.max(0, ids.length - 7) : Math.min(ids.length, 7)
                if (row_length > 0) {
                    townsfolk.style.visibility = ''
                    townsfolk.style.top = getTokenMenuSize()/2 + getTokenMenuButtonHeight() + rows * height + 'px'
                    townsfolk.style.left = getTokenMenuSize()/2 + (total_columns - row_length) * width/(2 * total_columns) + 'px'
                    rows++
                }
                else {
                    townsfolk.style.visibility = 'hidden'
                }
            }
        }
        else {
            token_menu.children[9].style.visibility = 'hidden'
            token_menu.children[10].style.visibility = 'hidden'
        }

        // Outsiders / Minions / Demons
        teams = ['outsider', 'minion', 'demon']
        for (let k=0; k<3; k++) {
            let team = token_menu.children[11 + k]
            let ids = getTeamIDs(game_state.edition, teams[k], token_menu_info.out_of_play)
            if (token_menu_info.valid_teams.includes(teams[k]) && ids.length > 0) {
                while (ids.length > 7) {
                    ids.pop()
                }
                
                for (let i=0; i<7; i++) {
                    let t = team.children[i]
                    if (i < ids.length) {
                        
                        let path = getIconPath(ids[i])
                        t.children[1].src = path
                        if (path == '') {
                            t.children[1].style.visibility = 'hidden'
                        }
                        else {
                            t.children[1].style.visibility = ''
                        }
                        if (ids[i]) {
                            t.children[2].children[1].children[0].textContent = getCharacterFromID(ids[i]).name
                        }
                        else {
                            t.children[2].children[1].children[0].textContent = ''
                        }
                        
                        if (token_menu_info.selected.includes(ids[i])) {
                            t.style.border = getTokenMenuBorderSize() + 'px solid ' + (!token_menu_info.type && getCharacterFromID(ids[i]).setup ? 'purple' : 'red')
                            t.style.margin = -getTokenMenuBorderSize() + 'px'
                        }
                        else {
                            t.style.margin = ''
                            t.style.border = ''
                        }
                        t.style.visibility = ''
                    }
                    else {
                        t.style.visibility = 'hidden'
                    }
                }
                
                team.style.top = getTokenMenuSize()/2 + getTokenMenuButtonHeight() + rows * height + 'px'
                team.style.left = getTokenMenuSize()/2 + (total_columns - ids.length) * width/(2 * total_columns) + 'px'
                
                rows++
                
                team.style.visibility = ''
            }
            else {
                team.style.visibility = 'hidden'
            }
        }
        
        token_menu.style.width = getTokenMenuSize() + width + 'px'
        token_menu.style.height = (rows + 1) * height + 2 * getTokenMenuButtonHeight() + 'px'
        
        token_menu.style.top = (size - parseFloat(token_menu.style.height))/2 - getBorderSize() + 'px'
        token_menu.style.left = (size - parseFloat(token_menu.style.width))/2 - getBorderSize() + 'px'
        
        // Info
        let info_bar = token_menu.children[0]
        // info_bar.style.top = (size - rows * (getTokenMenuSize() + 2 * getTokenMenuPaddingSize()) - 2 * getTokenMenuButtonHeight())/2 + 'px'
        // info_bar.style.left = (size - columns * getTokenMenuSize())/2 + 'px'
        info_bar.style.top = getTokenMenuSize()/2 + 'px'
        info_bar.style.left = getTokenMenuSize()/2 + 'px'
        info_bar.style.width = width + 'px' // columns * getTokenMenuSize() + 'px'
        
        switch (token_menu_info.type) {
            case 0:
                info_bar.innerHTML = 'Choose ' + token_menu_info.choices + ' character(s) (' + (token_menu_info.choices - token_menu_info.selected.length) + ' remaining)'
                break
            case 1:
                if (!token_menu_info.valid_teams.includes('fabled')) {
                    info_bar.innerHTML = 'Choose ' + token_menu_info.choices + ' character(s) (' + (token_menu_info.choices - token_menu_info.selected.length) + ' remaining)'
                }
                else {
                    info_bar.innerHTML = 'Choose the fabled to be in play'
                }
                break
            case 2:
                let up_to = ''
                if (night_action_info.character_restrictions.includes("cancel")) {
                    up_to = 'up to '
                }
                token_menu.children[0].innerHTML = 'Choose ' + up_to + token_menu_info.choices + ' character(s) (' + (token_menu_info.choices - token_menu_info.selected.length) + ' remaining)'
                if (!client_type) {
                    let time = (new Date()).getTime()
                    remaining_time = Math.ceil(Math.max(0, night_action_info.time - (time - (night_action_info.start_time ? night_action_info.start_time : time))) / 1000)
                    token_menu.children[0].innerHTML += ' in ' + remaining_time + ' seconds'
                }
                
                break
        }
        
        // Shuffle Characters
        let shuffle_characters = token_menu.children[1]
        // shuffle_characters.style.left = (size - columns * (getTokenMenuSize() + 2 * getTokenMenuPaddingSize()))/2 + 'px'
        shuffle_characters.style.top = parseFloat(token_menu.style.height) - getTokenMenuButtonHeight() - getTokenMenuSize()/2 - getBorderSize() + 'px'
        shuffle_characters.style.width = (width - 4 * getBorderSize()) / 3 + 'px'
        shuffle_characters.style.left = getTokenMenuSize()/2 + 'px'
        shuffle_characters.style.visibility = token_menu_info.type == 0 ? '' : 'hidden'
        
        
        // Cancel Button
        let cancel_button = token_menu.children[2]
        cancel_button.style.left = getTokenMenuSize()/2 + ((1 - token_menu_info.type) * (1/6) + 0.5) * (width - getBorderSize()) + 'px'
        cancel_button.style.top = parseFloat(token_menu.style.height) - getTokenMenuButtonHeight() - getTokenMenuSize()/2 - getBorderSize() + 'px'
        cancel_button.style.width = (width * (2 + token_menu_info.type) - getBorderSize() * (8 - 2*token_menu_info.type)) / 6  + 'px'
        cancel_button.style.visibility = token_menu_info.type == 2 ? 'hidden' : ''
        
        // Finish Button
        let finish_button = token_menu.children[3]
        finish_button.style.top = parseFloat(token_menu.style.height) - getTokenMenuButtonHeight() - getTokenMenuSize()/2 - getBorderSize() + 'px'
        finish_button.style.left = getTokenMenuSize()/2 + 1/3 * (1 - Boolean(token_menu_info.type)) * (width - getBorderSize()) + 'px'
        finish_button.style.width = (width - getBorderSize() * (4 - token_menu_info.type)) / (3 - token_menu_info.type) + 'px'
        let t = getCornerRadius()
        finish_button.style.borderRadius = `${token_menu_info.type ? t : 0}px ${token_menu_info.type == 2 ? t : 0}px ${token_menu_info.type == 2 ? t : 0}px ${token_menu_info.type ? t : 0}px`
        if (token_menu_info.type == 2 && (night_action_info.character_restrictions.includes("cancel") || client_type)) {
            finish_button.innerHTML = 'Finish Choosing'
        }
        else {
            finish_button.innerHTML = 'Finish'
        }
        
        // Team Selection
        let team_selection = token_menu.children[4]
        if (token_menu_info.type == 0) {
            team_selection.style.top = getTokenMenuButtonHeight() + getTokenMenuSize()/2 + 'px'
            // team_selection.style.left = (size - (columns + 1) * (getTokenMenuSize() + 2 * getTokenMenuPaddingSize()))/2 + 'px'
            team_selection.children[0].style.height = (getTeamIDs(game_state.edition, 'townsfolk').length > 7 ? 2*height : height) + 'px'
            for (let i=1; i<4; i++) {
                team_selection.children[i].style.top = parseFloat(team_selection.children[i-1].style.top) + parseFloat(team_selection.children[i-1].style.height) + 'px'
            }
            
            teams = ['townsfolk', 'outsider', 'minion', 'demon']
            for (let i=0; i < 4; i++) {
                let team = team_selection.children[i]
                let count = 0
                for (let id of getTeamIDs(game_state.edition, teams[i])) {
                    if (token_menu_info.selected.includes(id)) {
                        count++
                    }
                }
                let total = player_split[Math.min(15, token_menu_info.choices) - 5][teams[i]]   
                team.innerHTML = count + '/' + total
                if (count == total) {
                    team.style.color = 'green'
                }
                else if (count > total) {
                    team.style.color = 'red'
                }
                else {
                    team.style.color = 'orange'
                }
                
            }
            team_selection.style.visibility = ''
        }
        else {
            team_selection.style.visibility = 'hidden'
        }
        
        token_menu.style.visibility = ''
    }
    else {
        token_menu.style.visibility = 'hidden'
    }
}

function reDrawClock() {
    reDrawVotes()
    let clock_info = game_state.clock_info
    // Total clock
    clock.style.visibility = (clock_info.active) ? '' : 'hidden'
    
    // Hands
    let progress = 0
    if (clock_info.nominator != null && clock_info.nominatee != null) {
        if (clock_info.start_time != null) {
            progress = Math.min(1, ((new Date()).getTime() - clock_info.start_time) / (game_state.player_info.length * clock_info.interval))
        }
        hands.children[0].style.transform = 'rotate(' + 360 * getPlayerBySeatID(clock_info.nominator).seat/game_state.player_info.length + 'deg)'
        hands.children[1].style.transform = 'rotate(' + 360 * (progress + getPlayerBySeatID(clock_info.nominatee).seat/game_state.player_info.length) + 'deg)'
    }
    
    // Player buttons
    player_clock_buttons.style.visibility = (clock_info.active && !client_type) ? '' : 'hidden'
    
    // Host buttons
    
    // Start
    host_clock_buttons.children[0].style.visibility = (client_type && clock_info.active && progress == 0) ? '' : 'hidden'
    // Cancel
    host_clock_buttons.children[1].style.visibility = (client_type && clock_info.active && progress < 1) ? '' : 'hidden'
    // Reset
    host_clock_buttons.children[2].style.visibility = (client_type && clock_info.active && progress > 0) ? '' : 'hidden'
    // Finish
    host_clock_buttons.children[3].style.visibility = (client_type && clock_info.active && progress == 1) ? '' : 'hidden';
    
    if (clock_info.active) {
        let votes = []
        let alive = 0
        for (let p of game_state.player_info) {
            
            let temp = (p.seat - getPlayerBySeatID(clock_info.nominatee).seat + game_state.player_info.length) % game_state.player_info.length
            if (temp == 0) {
                temp = game_state.player_info.length
            }
            if (p.voting && (progress >= temp/game_state.player_info.length || !clock_info.start_time)) {
                votes.push(p.name)
            }
            if (p.alive && (!p.character || getCharacterFromID(p.character).team != 'traveler')) {
                alive++
            }
        }
        let vote_names = ''
        for (let v of votes) {
            vote_names += getLogPlayerStyle(v) + ', '
        }
        if (votes.length > 0) {
            vote_names = vote_names.slice(0, -2)
        }
        else {
            vote_names = 'Nobody'
        }
        
        // Clock Vote Info
        let t = `${getLogPlayerStyle(getPlayerBySeatID(clock_info.nominator).name)}${
            (clock_info.free ? ' free' : '')} nominated ${
            getLogPlayerStyle(getPlayerBySeatID(clock_info.nominatee).name)}<br>${
            votes.length} vote${(votes.length != 1 ? 's' : '')} in favour (majority is ${Math.ceil((clock_info.free ? game_state.player_info.length : alive)/2)})<br>${
            clock_info.start_time ? '' : 'Vote time is '}`
        clock_vote_info.children[0].innerHTML = getLogNominationStyle(t)

        t = clock_info.interval/1000
        clock_vote_info.children[2].innerHTML = getLogNominationStyle(t == 0.5 ? '½' : t)
        clock_vote_info.children[4].innerHTML = getLogNominationStyle(clock_info.start_time ? vote_names + ' voted YES' : ' seconds per player')
        
        if (!client_type || clock_info.start_time) {
            clock_vote_info.children[1].style.display = 'none'
            clock_vote_info.children[3].style.display = 'none'
        }
        else {
            clock_vote_info.children[1].style.display = ''
            clock_vote_info.children[3].style.display = ''
        }
        clock_vote_info.children[2].style.display = (clock_info.start_time) ? 'none' : ''
    }
}

function reDrawChangePhase() {
    document.body.style.backgroundImage = (game_state.day_phase) ? 'url("assets/other/day.png")' : 'url("assets/other/night.jpg")'
    day_phase.innerHTML = ((game_state.day_phase) ? 'Phase: Day' : 'Phase: Night') + ` ${game_state.phase_counter}`
}

function reDrawHUD() {
    reDrawChangePhase()
    add_player.style.visibility = client_type || client_type == null ? add_player.style.visibility : 'hidden'
    finish_game.style.visibility = client_type || client_type == null ? finish_game.style.visibility : 'hidden'
    choose_characters.style.visibility = client_type || client_type == null ? choose_characters.style.visibility : 'hidden'
    shuffle_players.style.visibility = client_type || client_type == null ? shuffle_players.style.visibility : 'hidden'
    change_edition.style.visibility = client_type || client_type == null ? change_edition.style.visibility : 'hidden'
    choose_fabled.style.visibility = client_type || client_type == null ? choose_fabled.style.visibility : 'hidden'
    change_phase.style.visibility = client_type || client_type == null ? change_phase.style.visibility : 'hidden'
    reveal_grimoire.style.visibility = client_type || client_type == null ? reveal_grimoire.style.visibility : 'hidden'
    reset_game.style.visibility = client_type || client_type == null ? reset_game.style.visibility : 'hidden'
    change_nomination_status.style.visibility = client_type || client_type == null ? change_nomination_status.style.visibility : 'hidden'
    
    host_connected.innerHTML = 'Host Status: ' + (game_state.host_socket_id ? (client_type ? 'You are the Host' : 'Hosted') : 'Hostless')
    channel_ID.innerHTML = 'Channel: ' + channel_id
    let t = getEditionFromID(game_state.edition)
    current_edition.innerHTML = 'Edition: ' + (t ? t.name : '')
    
    if (client_type && !getEditionFromID(game_state.edition).reference_sheet) {
        open_reference_sheet.innerHTML = 'Load Reference Sheet'
    }
    else {
        open_reference_sheet.innerHTML = 'Open Reference Sheet'
    }
    
    nomination_status.innerHTML = game_state.nominations_open ? 'Nominations: Open' : 'Nominations: Closed'
    change_nomination_status.innerHTML = game_state.nominations_open ? 'Close Nominations' : 'Open Nominations'
    
    character_split.innerHTML = 'Split: '
    let traveler_count = 0
    for (let p of game_state.player_info) {
        if (p.character && getCharacterFromID(p.character).team == 'traveler') {
            traveler_count++
        }
    }
    let temp = player_split[game_state.player_info.length - traveler_count - 5]
    for (let key in temp) {
        character_split.innerHTML += temp[key] + ', '
    }
    if (game_state.player_info.length - traveler_count >= 5) {
        character_split.innerHTML = character_split.innerHTML.slice(0, -2)
        if (traveler_count) {
            character_split.innerHTML += `, ${traveler_count}`
        }
    }
    
    let alive_count = 0
    let vote_count = 0
    for (let p of game_state.player_info) {
        if (p.alive) { alive_count++ }
        if (p.dead_vote) {vote_count++}
    }
    
    alive_vote_info.innerHTML = 'Players: ' + game_state.player_info.length + ', Alive: ' + alive_count + ', Votes: ' + vote_count
    
    sync_characters.style.visibility = client_type || client_type == null ? sync_characters.style.visibility : 'hidden'
    sync_characters.innerHTML = 'Characters\' Synced'
    for (let player of game_state.player_info) {
        if (!player.synced) {
            sync_characters.innerHTML = 'Sync Characters'
        }
    }
    
    for (let i=0; i < 2; i++) {
        let menu = [info_HUD, action_HUD][i]
        let row_count = 0
        for (let j=0; j < menu.childElementCount; j++) {
            if (menu.children[j].style.visibility != 'hidden') {
                row_count++
            }
        }
        menu.style.height = row_count * getHUDRowHeight() + 'px'
    }
    
    switch (token_click_type) {
        case 0:
            info.innerHTML = ''
            info.style.visibility = 'hidden'
            cancel_select.innerHTML = 'Cancel'
            cancel_select.style.visibility = 'hidden'
            break
        case 1:
            info.innerHTML = 'Click an empty seat to sit down'
            info.style.visibility = ''
            break
        case 2:
            cancel_select.innerHTML = 'Cancel'
            info.innerHTML = 'Click on the player to nominate'
            info.style.visibility = ''
            cancel_select.style.visibility = ''
            break
        case 3:
            cancel_select.innerHTML = 'Cancel'
            info.innerHTML = 'Click on the seat to move to'
            info.style.visibility = ''
            cancel_select.style.visibility = ''
            break;
        case 4:
            cancel_select.innerHTML = 'Cancel'
            info.innerHTML = 'Click on the seat to swap with'
            info.style.visibility = ''
            cancel_select.style.visibility = ''
            break;
        case 5:
            cancel_select.innerHTML = 'Finish Choosing'
            cancel_select.style.visibility = (night_action_info.player_restrictions.includes("cancel") || client_type) ? '' : 'hidden'
            let up_to = ''
            if (night_action_info.player_restrictions.includes("cancel")) {
                up_to = 'up to '
            }
            info.innerHTML = 'Choose ' + up_to + night_action_info.in_players + ' player(s) (' + (night_action_info.in_players - night_action_info.players.length) + ' remaining)'
            if (!client_type) {
                let time = (new Date()).getTime()
                remaining_time = Math.ceil(Math.max(0, night_action_info.time - (time - (night_action_info.start_time ? night_action_info.start_time : time))) / 1000)
                info.innerHTML += ' in ' + remaining_time + ' seconds'
            }
            info.style.visibility = ''
            break
        case 6:
            cancel_select.innerHTML = 'Cancel'
            info.innerHTML = 'Click on the player to free nominate'
            info.style.visibility = ''
            cancel_select.style.visibility = ''
            break
    }
    
    t = getCornerRadius()
    if (cancel_select.style.visibility == 'hidden') {
        info.style.borderRadius = `${t}px ${t}px ${t}px ${t}px`
        info.style.top = (size/2) - getInfoRowHeight()/2 - getBorderSize() + 'px'
    }
    else {
        info.style.borderRadius = `${t}px ${t}px 0px 0px`
        info.style.top = (size/2) - getInfoRowHeight() - 1.5 * getBorderSize() + 'px'
    }
}

function reDrawFabledDemonBluffsHUD() {
    
    // Check if only one active
    let both_active = false
    if (game_state.demon_bluffs.length > 0 && game_state.fabled_in_play.length == 0) {
        fabled_demon_bluffs_HUD_focus = 'demon_bluffs'
    }
    else if (game_state.demon_bluffs.length == 0 && game_state.fabled_in_play.length > 0) {
        fabled_demon_bluffs_HUD_focus = 'fabled'
    }
    else if (game_state.demon_bluffs.length == 0 && game_state.fabled_in_play.length == 0) {
        fabled_demon_bluffs_HUD_focus = null
    }
    else {
        both_active = true
        if (!fabled_demon_bluffs_HUD_focus) {
            fabled_demon_bluffs_HUD_focus = 'demon_bluffs'
        }
    }
    
    let y = parseFloat(fabled_demon_bluffs_HUD.style.height)
    let x = parseFloat(fabled_demon_bluffs_HUD.style.width)
    let p = x/3
    
    let title_height = y-p
    
    // Fabled
    let square_size = Math.ceil(Math.sqrt(game_state.fabled_in_play.length/3))
    let token_size = p/square_size
    
    for (let i=0; i < fabled_tokens.childElementCount; i++) {
        let e = fabled_tokens.children[i]
        if (i > 0) {
            if (i <= game_state.fabled_in_play.length && fabled_demon_bluffs_HUD_focus == 'fabled') {
                let t = getIconPath(game_state.fabled_in_play[i-1])
                e.children[1].src = t

                e.children[2].children[1].children[0].textContent = getFabledFromID(game_state.fabled_in_play[i-1]).name
                
                e.style.top = title_height + token_size * (Math.floor((i-1) / (3 * square_size))) + 'px'
                let offset = (((i-1) >= 3 * square_size*(square_size-1)) * (3*square_size**2 - game_state.fabled_in_play.length)) * token_size/2
                e.style.left = offset + ((i-1) % (3 * square_size)) * token_size + 'px'
                
                e.style.width = e.style.height = token_size + 'px'
                
                for (j=0; j < 2; j++) {
                    e.children[j].width = token_size
                    e.children[j].height = token_size
                }
                
                e.children[2].setAttribute('width', token_size)
                e.children[2].setAttribute('height', token_size)
            
                e.children[2].children[0].setAttribute('d', 'M ' + 0.075 * token_size + ' ' + token_size/2 + ' a ' + token_size*0.425 + ' ' + token_size*0.425 + ' 0 0 0 ' + 0.85*token_size + ' 0')
                e.children[2].children[1].style.fontSize = (token_size/getTokenSize(0)) * getTokenFontSize(0) + 'px'
                
                e.style.visibility = ''
            }
            else {
                e.style.visibility = 'hidden'            
            }
        }
        else {
            if (both_active) {
                if (fabled_demon_bluffs_HUD_focus == 'fabled') {
                    e.style.borderRightColor = 'transparent'
                    e.style.borderBottomColor = 'transparent'
                }
                else {
                    e.style.borderRightColor = getBorderColour()
                    e.style.borderBottomColor = getBorderColour()
                }
                e.style.width = x/2 - getBorderSize() + 'px'
                e.style.height = title_height - getBorderSize() + 'px'
                e.style.borderStyle = 'none solid solid none'
                addHover(e)
                e.style.visibility = ''
            }
            else if (fabled_demon_bluffs_HUD_focus == 'fabled') {
                e.style.width = x + 'px'
                e.style.height = title_height + 'px'
                e.style.borderStyle = 'none'
                e.onmouseenter = undefined
                e.onmouseleave = undefined
                e.style.visibility = ''
            }
            else {
                e.style.visibility = 'hidden'
            }
        }
    }
    
    // Demon Bluffs
    for (let i=0; i < demon_bluffs.childElementCount; i++) {
        let e = demon_bluffs.children[i]
        
        if (i > 0) {
            if (i <= game_state.demon_bluffs.length && fabled_demon_bluffs_HUD_focus == 'demon_bluffs') {
                let t = getIconPath(game_state.demon_bluffs[i-1])
                e.children[1].src = t
                e.children[2].children[1].children[0].textContent = getCharacterFromID(game_state.demon_bluffs[i-1]).name
            
                e.style.visibility = ''
            }
            else {
                e.style.visibility = 'hidden'
            }
        }
        else {
            if (both_active) {
                if (fabled_demon_bluffs_HUD_focus == 'demon_bluffs') {
                    e.style.borderBottomColor = 'transparent'
                    e.style.borderLeftColor = 'transparent'
                }
                else {
                    e.style.borderBottomColor = getBorderColour()
                    e.style.borderLeftColor = getBorderColour()
                }
                e.style.width = Math.ceil(x/2 - getBorderSize()) + 'px'
                e.style.height = title_height - getBorderSize() + 'px'
                e.style.borderStyle = 'none none solid solid'
                e.style.left = x/2 + 'px'
                addHover(e)
                e.style.visibility = ''
            }
            else if (fabled_demon_bluffs_HUD_focus == 'demon_bluffs') {
                e.style.width = x + 'px'
                e.style.left = '0px'
                e.style.height = title_height + 'px'
                e.style.borderStyle = 'none'
                e.onmouseenter = undefined
                e.onmouseleave = undefined
                e.style.visibility = ''
            }
            else {
                e.style.visibility = 'hidden'
            }
        }
    }
    
    if (fabled_demon_bluffs_HUD_focus) {
        fabled_demon_bluffs_HUD.style.visibility = ''
    }
    else {
        fabled_demon_bluffs_HUD.style.visibility = 'hidden'
    }
}

function reDrawEditionMenu() {
    let e = edition_menu.children[0].children[0]
    let width = parseFloat(edition_menu.style.width)/2 - getEditionMenuPadding() * 3
    let clip_height = 0.5 * width // MAGIC NUMBER
    let height = clip_height + getEditionMenuTextHeight()
    
    for (let i=0; i < Math.max(game_state.editions.length, e.childElementCount); i++) {
        if (i < game_state.editions.length) {
            let edition = game_state.editions[i]
            while (e.childElementCount <= i) {
                e.appendChild(makeNewEditionDiv())
            }
            let div = e.children[i]
            let icon = div.children[0]
            let text = div.children[1]
            
            let top = Math.floor(i/2) * (height + getEditionMenuTextHeight()) + getEditionMenuTextHeight()
            
            let left = (i%2) * (width + getEditionMenuPadding())
            
            icon.src = edition.icon ? edition.icon : 'assets/editions/custom.png'
            
            icon.onload = () => {
                let ratio = icon.naturalWidth/icon.naturalHeight
                icon.width = width
                icon.height = width/ratio
                let t = Math.max(0, (icon.height - clip_height - getEditionMenuTextHeight()*2)/2)
                icon.style.clip = `rect(${t}px ${width}px ${clip_height + getEditionMenuTextHeight()*2 + t}px ${0}px)`
                icon.style.top = top + (clip_height - icon.height)/2 + 'px'
                icon.style.left = left + 'px'
            }
            
            text.innerHTML = edition.name
            text.edition_id = edition.id
            
            text.style.top = top + clip_height + 'px'
            text.style.left = left + 'px'
            text.style.width = width + 'px'
            text.style.height = getEditionMenuTextHeight() + 'px'
            text.style.lineHeight = getEditionMenuTextHeight() + 'px'
            text.style.fontSize = getEditionMenuFontSize() + 'px'
            text.style.color = getFontColour()
            text.style.textAlign = 'center'
            
            
            div.style.display = ''
        }
        else {
            e.children[i].style.display = 'none'
        }
    }
}

function reDrawEditionIcon() {
    let e = getEditionFromID(game_state.edition)
    edition_icon.style.visibility = 'hidden'
    if (e) {
        edition_icon.src = e.icon
        edition_icon.onload = () => {
            let ratio = edition_icon.naturalWidth/edition_icon.naturalHeight
            let width = getEditionIconWidth()
            let height = Math.min(width, width/ratio)
            let t = (width/ratio - height)/2
            edition_icon.width = width
            edition_icon.height = width/ratio
            edition_icon.style.clip = `rect(${t}px ${width}px ${t + height}px ${0}px)`
            edition_icon.style.top = (size - height)/2 + 'px'
            edition_icon.style.left = (size - width)/2 + 'px'
            edition_icon.style.visibility = ''
        }
    }
}