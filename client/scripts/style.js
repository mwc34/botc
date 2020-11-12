function style() {
    styleMenu()
    styleClock()
    styleTokens()
    styleNames()
    styleDeathTokens()
    styleReminders()
    styleGameMenu()
    styleVotes()
    styleSocketIcons()
    styleDeadVotes()
    styleInfo()
    styleNightActionMenu()
    styleDemonBluffs()
    styleTokenMenu()
    styleReminderMenu()
    styleNightReminders()
    styleCancelSelect()
    styleHUD()
    styleInfoHoverBox()
    styleAlertBox()
    styleGameLog()
    styleEditionMenu()
    styleEditionIcon()
}

function styleMenu() {          
    for (let menu of [host_menu, player_menu]) {
        menu.style.borderColor = getBorderColour()
        menu.style.backgroundColor = getBackgroundColour()
        menu.style.borderStyle = 'solid'
        for (let i=0; i < 2; i++) {
            for (let j=0; j < menu.children[i].childElementCount; j++) {
                let option = menu.children[i].children[j]
                option.style.textAlign = 'center'
                addHover(option)
                option.style.color = getFontColour()
                option.style.userSelect = 'none'
                option.style.fontFamily = getFontFamily()
            }
        }
    }
}

function styleClock() {
    for (let i=0; i<2; i++) {
        let hand = hands.children[i]
        hand.style.pointerEvents = 'none'
    }

    for (let i=0; i < player_clock_buttons.childElementCount + host_clock_buttons.childElementCount; i++) {
        let t = i % host_clock_buttons.childElementCount
        let button = i < host_clock_buttons.childElementCount ? host_clock_buttons.children[t] : player_clock_buttons.children[t]
        
        button.style.textAlign = 'center'
        button.style.borderColor = getBorderColour()
        button.style.backgroundColor = (i < host_clock_buttons.childElementCount) ? getBackgroundColour() : (i % 2 ? getRedColour() : getBlueColour())
        button.style.userSelect = 'none'
        button.style.fontFamily = getFontFamily()
        button.style.color = getFontColour()
        addHover(button)
        
        button.style.borderStyle = 'solid'
    }
    
    // clock_vote_info.style.display = 'flex'
    // clock_vote_info.style.justifyContent = 'center'
    // clock_vote_info.style.alignItems = 'center'
    clock_vote_info.style.backgroundColor = getBackgroundColour()
    clock_vote_info.style.color = getFontColour()
    clock_vote_info.style.borderColor = getBorderColour()
    
    clock_vote_info.style.borderStyle = 'solid'
    clock_vote_info.style.fontFamily = getFontFamily()
    
    // clock_vote_info.style.flexDirection = 'column'
    // clock_vote_info.children[1].style.userSelect = 'none'
    // clock_vote_info.children[3].style.userSelect = 'none'
    clock_vote_info.children[1].style.verticalAlign = 'middle'
    clock_vote_info.children[3].style.verticalAlign = 'middle'
    clock_vote_info.children[2].style.whiteSpace = 'pre'
}

function styleTokens() {
    for (let i=0; i < max_players; i++) {
        let token = tokens.children[i]
        token.style.borderRadius = '50%'
        token.children[2].children[1].style.fontFamily = getFontFamily()
    }
}

function styleNames() {
    for (let i=0; i < max_players; i++) {
        let name = names.children[i]
        addHover(name)
        name.style.textAlign = 'center'
        name.style.userSelect = 'none'
        name.style.backgroundColor = getBackgroundColour()
        name.style.color = getFontColour()
        name.style.borderColor = getBorderColour()
        name.style.borderStyle = 'solid'
        name.style.fontFamily = getFontFamily()
        name.style.overflow = 'hidden'
    }
}

function styleDeathTokens() {
    for (let i=0; i < max_players; i++) {
        let death_token = death_tokens.children[i]
    }
}

function styleVotes() {
    for (let i=0; i < max_players; i++) {
        for (let j=0; j < 2; j++) {
            let vote_icon = (j ? yes_votes : no_votes).children[i]
            vote_icon.style.pointerEvents = 'none'
        }
    }
}

function styleSocketIcons() {
    for (let i=0; i < max_players; i++) {
        let socket_icon = socket_icons.children[i]
    }
}

function styleDeadVotes() {
    for (let i=0; i < max_players; i++) {
        let dead_vote = dead_votes.children[i]
    }
}

function styleReminders() {
    for (let i=0; i < max_players; i++) {
        for (let j=0; j < max_reminders; j++) {
            let reminder = reminders.children[i*max_reminders + j]
            
            reminder.style.borderRadius = '50%'
            
            let reminder_text = reminder.children[2]
            
            reminder_text.style.fontFamily = getFontFamily()
            reminder_text.style.display = 'flex'
            reminder_text.style.justifyContent = 'center'
            reminder_text.style.alignItems = 'center'
            reminder_text.style.textAlign = 'center'
            // reminder_text.style.wordWrap = 'break-word'
            // reminder_text.style.wordBreak = 'break-all'
        }
    }
}

function styleTokenMenu() {
    token_menu.style.backgroundColor = getSolidBackgroundColour()
    token_menu.style.borderColor = getBorderColour()
    
    token_menu.style.borderStyle = 'solid'
    
    // Info
    let info_bar = token_menu.children[0]
    info_bar.style.display = 'flex'
    info_bar.style.justifyContent = 'center'
    info_bar.style.alignItems = 'center'
    info_bar.style.color = getFontColour()
    info_bar.style.fontFamily = getFontFamily()
    
    // Shuffle Characters
    let shuffle_characters = token_menu.children[1]
    shuffle_characters.style.textAlign = 'center'
    shuffle_characters.style.backgroundColor = getBackgroundColour()
    shuffle_characters.style.color = getFontColour()
    shuffle_characters.style.borderColor = getBorderColour()
    
    shuffle_characters.style.borderStyle = 'solid'
    
    shuffle_characters.style.userSelect = 'none'
    addHover(shuffle_characters)
    shuffle_characters.style.fontFamily = getFontFamily()
    
    // Cancel Button
    let cancel_button = token_menu.children[2]
    cancel_button.style.textAlign = 'center'
    cancel_button.style.backgroundColor = getBackgroundColour()
    cancel_button.style.borderColor = getBorderColour()
    cancel_button.style.color = getFontColour()
    
    cancel_button.style.borderStyle = 'solid'
    
    cancel_button.style.userSelect = 'none'
    addHover(cancel_button)
    cancel_button.style.fontFamily = getFontFamily()
    
    // Finish Button
    let finish_button = token_menu.children[3]
    finish_button.style.textAlign = 'center'
    finish_button.style.backgroundColor = getBackgroundColour()
    finish_button.style.borderColor = getBorderColour()
    finish_button.style.borderStyle = 'solid'
    finish_button.style.color = getFontColour()
    finish_button.style.userSelect = 'none'
    addHover(finish_button)
    finish_button.style.fontFamily = getFontFamily()
    
    // Team Selection
    let team_selection = token_menu.children[4]
    for (let i=0; i<4; i++) {
        let team = team_selection.children[i]
        team.style.display = 'flex'
        team.style.justifyContent = 'center'
        team.style.alignItems = 'center'
        team.style.fontFamily = getFontFamily()
    }
    
    let max_numbers = [1, 5, 7, 6, 4, 4, 4]
    for (let k=0; k < max_numbers.length; k++) {
        let team = token_menu.children[5 + k]
        for (let i=0; i < max_numbers[k]; i++) {
            let t = team.children[i]
            t.children[2].children[1].style.fontFamily = getFontFamily()
            t.style.borderRadius = '50%'
        }
    }
}

function styleReminderMenu() {
    reminder_menu.style.backgroundColor = getSolidBackgroundColour()
    reminder_menu.style.borderColor = getBorderColour()
    
    reminder_menu.style.borderStyle = 'solid'
    
    let info_bar = reminder_menu.children[0]
    info_bar.style.display = 'flex'
    info_bar.style.justifyContent = 'center'
    info_bar.style.alignItems = 'center'
    info_bar.style.color = getFontColour()
    info_bar.style.fontFamily = getFontFamily()
    
    let cancel_bar = reminder_menu.children[1]
    cancel_bar.style.userSelect = 'none'
    cancel_bar.style.textAlign = 'center'
    addHover(cancel_bar)
    cancel_bar.style.backgroundColor = getBackgroundColour()
    cancel_bar.style.borderColor = getBorderColour()
    
    cancel_bar.style.borderStyle = 'solid'
    cancel_bar.style.fontFamily = getFontFamily()
    
    reminder_size = getReminderMenuSize()
    let max_columns = Math.floor(size/reminder_size)
    let max_rows = max_columns - 2
    
    for (let i=0; i < max_rows; i++) {
        let row = reminder_menu.children[2 + i]
        for (let j=0; j < max_columns; j++) {
            let reminder = row.children[j]
            
            
            let reminder_text = reminder.children[2]
            
            reminder_text.style.fontFamily = getFontFamily()
            reminder_text.style.display = 'flex'
            reminder_text.style.justifyContent = 'center'
            reminder_text.style.textAlign = 'center'
            reminder_text.style.alignItems = 'center'
            // reminder_text.style.wordWrap = 'break-word'
            // reminder_text.style.wordBreak = 'break-all'
        }
    }
}

function styleGameMenu() {
    for (let i=0; i < 2; i++) {
        let button = game_menu.children[i]
        addHover(button)
        button.style.backgroundColor = getBackgroundColour()
        button.style.color = getFontColour()
        button.style.borderColor = getBorderColour()
        
        button.style.borderStyle = 'solid'
        button.style.userSelect = 'none'
        button.style.textAlign = 'center'
        button.style.fontFamily = getFontFamily()
    }
}



function styleInfo() {
    info.style.textAlign = 'center'
    info.style.backgroundColor = getSolidBackgroundColour()
    info.style.color = getFontColour()
    info.style.borderColor = getBorderColour()
    
    info.style.borderStyle = 'solid'
    info.style.fontFamily = getFontFamily()
}

function styleCancelSelect() {
    addHover(cancel_select)
    cancel_select.style.textAlign = 'center'
    cancel_select.style.backgroundColor = getSolidBackgroundColour()
    cancel_select.style.color = getFontColour()
    cancel_select.style.borderColor = getBorderColour()
    
    cancel_select.style.borderStyle = 'solid'
    cancel_select.style.userSelect = 'none'
    cancel_select.style.fontFamily = getFontFamily()
}

function styleHUD() {
    let rows = Math.max(info_HUD.childElementCount, action_HUD.childElementCount)
    addHover(info_HUD.children[0])
    for (let i=0; i < 2; i++) {
        let menu = [info_HUD, action_HUD][i]
        menu.style.backgroundColor = getBackgroundColour()
        menu.style.borderColor = getBorderColour()
        
        menu.style.borderStyle = 'solid'
        menu.style.color = getFontColour()
        for (let j=0; j < menu.childElementCount; j++) {
            let row = menu.children[j]
            row.style.fontFamily = getFontFamily()
            row.style.userSelect = 'none'
            row.style.textAlign = ['left', 'right'][i]
            row.style.overflow = 'hidden'
            row.style.wordBreak = 'break-all'
            if (i) {
                addHover(menu.children[j])
            }
        }
    }
    
    // Change Phase
    change_phase.children[0].style.verticalAlign = 'middle'
    change_phase.children[1].style.whiteSpace = 'pre'
    change_phase.children[2].style.verticalAlign = 'middle'
}

function styleNightActionMenu() {
    night_action_menu.style.backgroundColor = getSolidBackgroundColour()
    night_action_menu.style.borderColor = getBorderColour()
    night_action_menu.style.borderStyle = 'solid'
    // All
    
    for (let i=0; i < night_action_menu.childElementCount; i++) {
        let div = night_action_menu.children[i]
        // Title
        if (i < 1) {
            div.children[0].style.textAlign = 'center'
            div.children[0].style.color = getFontColour()
            div.children[0].style.fontFamily = getFontFamily()
        }
        // Plus Minus
        else if (i < 5) {
            for (j=0; j<2; j++) {
                div.children[j].style.textAlign = 'center'
                div.children[j].style.color = getFontColour()
                div.children[j].style.fontFamily = getFontFamily()
            }
        }
        // Restrictions
        else if (i < 7) {
            for (j=0; j < div.childElementCount; j++) {
                div.children[j].style.textAlign = 'center'
                div.children[j].style.color = getFontColour()
                div.children[j].style.fontFamily = getFontFamily()
                
                if (j > 0) {
                    div.children[j].style.borderColor = getBorderColour()
                    div.children[j].style.backgroundColor = getBackgroundColour()
                    
                    div.children[j].style.borderStyle = 'solid'
                    div.children[j].style.userSelect = 'none'
                    addHover(div.children[j])
                }
            }
            
        }
        // Grimoire
        else if (i < 8) { 
            div.children[0].style.textAlign = 'center'
            div.children[0].style.color = getFontColour()
            div.children[0].style.fontFamily = getFontFamily()
            div.children[0].style.borderColor = getBorderColour()
            div.children[0].style.backgroundColor = getBackgroundColour()
            
            div.children[0].style.borderStyle = 'solid'
            div.children[0].style.userSelect = 'none'
            addHover(div.children[0])
        }
        // Info Prompt
        else if (i < 9) {
            div.children[0].style.textAlign = 'center'
            div.children[0].style.color = getFontColour()
            div.children[0].style.fontFamily = getFontFamily()

            div.children[1].style.color = getFontColour()
            div.children[1].style.fontFamily = getFontFamily()
            div.children[1].style.borderColor = getBorderColour()
            div.children[1].style.backgroundColor = getBackgroundColour()
            
            div.children[1].style.borderStyle = 'solid'
            div.children[1].style.userSelect = 'none'
        }
        // Finish Cancel
        else if (i < 10) {
            for (j=0; j < 2; j++) {
                div.children[j].style.textAlign = 'center'
                div.children[j].style.color = getFontColour()
                div.children[j].style.fontFamily = getFontFamily()
                div.children[j].style.borderColor = getBorderColour()
                div.children[j].style.backgroundColor = getBackgroundColour()
                
                div.children[j].style.borderStyle = 'solid'
                div.children[j].style.userSelect = 'none'
                addHover(div.children[j])
            }
        }     
    }
}

function styleDemonBluffs() {
    demon_bluffs.children[0].style.textAlign = 'center'
    demon_bluffs.children[0].style.color = getFontColour()
    demon_bluffs.children[0].style.fontFamily = getFontFamily()
    
    demon_bluffs.style.backgroundColor = getBackgroundColour()
    
    demon_bluffs.style.borderStyle = 'solid'
    demon_bluffs.style.borderColor = getBorderColour()
}

function styleNightReminders() {
    for (let i=0; i < 2 * max_players; i++) {
        let r = night_reminders.children[i]
        r.style.borderRadius = '50%'
        r.style.backgroundColor = (i%2 == 0) ? getBlueColour() : getRedColour()
        r.style.textAlign = 'center'
        r.style.color = getFontColour()
        r.style.fontFamily = getFontFamily()
        r.style.userSelect = 'none'
        r.style.borderColor = getBorderColour()
        
        r.style.borderStyle = 'solid'
    }
}

function styleInfoHoverBox() {
    info_hover_box.style.display = 'flex'
    info_hover_box.style.alignItems = 'center'
    info_hover_box.style.justifyContent = 'left'
    info_hover_box.style.height = '0px'
    
    info_hover_box.children[0].style.backgroundColor = getBackgroundColour()
    info_hover_box.children[0].style.color = getFontColour()
    info_hover_box.children[0].style.fontFamily = getFontFamily()
    info_hover_box.children[0].style.borderColor = getBorderColour()
    
    info_hover_box.children[0].style.borderStyle = 'solid'
}

function styleEditionMenu() {
    edition_menu.style.backgroundColor = getBackgroundColour()
    edition_menu.style.color = getFontColour()
    edition_menu.style.fontFamily = getFontFamily()
    edition_menu.style.borderColor = getBorderColour()
    edition_menu.style.borderStyle = 'solid'
    edition_menu.children[0].style.overflowY = 'auto'
    edition_menu.children[0].style.overflowX = 'hidden'
    
    for (let i=0; i<2; i++) {
        edition_menu.children[1].children[i].style.color = getFontColour()
        edition_menu.children[1].children[i].style.fontFamily = getFontFamily()
        edition_menu.children[1].children[i].style.borderColor = getBorderColour()
        edition_menu.children[1].children[i].style.borderStyle = `solid ${i ? 'none' : 'solid'} none none`
        edition_menu.children[1].children[i].style.textAlign = 'center'
        edition_menu.children[1].children[i].style.userSelect = 'none'
        addHover(edition_menu.children[1].children[i])
    }
}

function styleAlertBox() {
    alert_box.style.display = 'flex'
    alert_box.style.justifyContent = 'center'
    alert_box.style.flexDirection = 'column'
    alert_box.style.alignItems = 'center'
    alert_box.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
    
    
    for (let i=0; i<alert_box.childElementCount; i++) {
        let div = alert_box.children[i]
        div.style.display = 'flex'
        div.style.justifyContent = 'center'
        div.style.alignItems = 'center'
        div.style.flexDirection = 'row'
        div.style.borderColor = getBorderColour()
        div.style.backgroundColor = getBackgroundColour()
        div.style.borderStyle = 'solid'
        for (let j=0; j < alert_box.children[i].childElementCount; j++) {
            div.children[j].style.color = getFontColour()
            div.children[j].style.fontFamily = getFontFamily()
            div.children[j].style.borderColor = getBorderColour()
            let s = 'solid'
            let n = 'none'
            div.children[j].style.borderStyle = `${n} ${j == div.childElementCount-1 ? n : s} ${n} ${!j ? n : s}`
            if (i > 1) {
                addHover(div.children[j])
                div.children[j].style.textAlign = 'center'
                div.children[j].style.userSelect = 'none'
            }
            else if (i==1) {
                div.children[j].style.backgroundColor = 'transparent'
            }
        
        }
        
    }
}

function styleGameLog() {
    
    game_log.style.backgroundColor = getBackgroundColour()
    game_log.style.borderColor = getBorderColour()
    
    game_log.style.borderStyle = 'solid'
    game_log.style.borderBottomStyle = 'none'
    game_log.style.pointerEvents = 'none'
    for (let i=0; i<2; i++) {
        game_log.children[i].style.pointerEvents = 'auto'
        game_log.children[i].style.color = getFontColour()
        game_log.children[i].style.fontFamily = getFontFamily()
        if (i == 1) {
            game_log.children[i].style.backgroundColor = getBackgroundColour()
            game_log.children[i].style.userSelect = 'none'
            addHover(game_log.children[i])
            game_log.children[i].style.borderColor = getBorderColour()
            game_log.children[i].style.borderStyle = 'solid'
            
        }
        else {
            // game_log.children[i].style.overflow = 'hidden'
            game_log.children[i].style.overflowY = 'auto'
        }
    }
}

function styleEditionIcon() {
    // pass
}