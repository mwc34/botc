function reSize() {
    size = Math.min(window.innerWidth, window.innerHeight)
    
    square.style.top = (window.innerHeight - size)/2 + 'px'
    square.style.left = (window.innerWidth - size)/2 + 'px'
    
    reSizeMenu()
    reSizeClock()
    reSizePlayers()
    reSizeGameMenu()
    reSizeNightActionMenu()
    reSizeFabledDemonBluffsHUD()
    reSizeInfo()
    reSizeCancelSelect()
    reSizeTokenMenu()
    reSizeReminderMenu()
    reSizeInfoHoverBox()
    reSizeAlertBox()
    reSizeHUD()
    reSizeGameLog()
    reSizeEditionMenu()
    reSizeEditionIcon()
}

function reSizeMenu() {    
    for (let menu of [host_menu, player_menu]) {
        menu.style.width = getMenuWidth() + 'px'
        menu.style.height = getMenuHeight() * Math.max(menu.children[0].childElementCount, menu.children[1].childElementCount) + 'px'
        menu.style.borderRadius = getCornerRadius() + 'px'
        menu.style.borderWidth = getBorderSize() + 'px'
        for (let i=0; i < 2; i++) {
            for (let j=0; j < menu.children[i].childElementCount; j++) {
                let option = menu.children[i].children[j]
                option.style.fontSize = getMenuFontSize() + 'px'
                option.style.width = getMenuWidth() + 'px'
                option.style.height = getMenuHeight() + 'px'
                option.style.top = getMenuHeight() * j + 'px'
                option.style.lineHeight = getMenuHeight() + 'px'
            }
        }
    }
}

function reSizeClock() {
    clock.style.left = size/2 + 'px'
    clock.style.top = size/2 + 'px'
    let hand_widths = [120, 67]
    for (let i=0; i<2; i++) {
        let hand = hands.children[i]
        hand.height = getClockHandLength()
        hand.width = hand_widths[i] * getClockHandLength() / 832
        hand.style.top = -hand.height/2 + 'px'
        hand.style.left = -hand.width/2 + 'px'
    }
    
    let r = getCornerRadius()
    
    for (let i=0; i < player_clock_buttons.childElementCount + host_clock_buttons.childElementCount; i++) {
        let t = i % host_clock_buttons.childElementCount
        let button = i < host_clock_buttons.childElementCount ? host_clock_buttons.children[t] : player_clock_buttons.children[t]
        
        button.style.width = getClockButtonWidth() + 'px'
        button.style.height = getClockButtonHeight() + 'px'
        button.style.top = getClockButtonTopOffset() + 'px'
        button.style.left = ((i % 2)-1) * getClockButtonWidth() - (1.5 - (i%2)) * getBorderSize() + 'px'
        button.style.fontSize = getClockButtonFontSize() + 'px'
        button.style.lineHeight = getClockButtonHeight() + 'px'
        button.style.borderRadius = `${i%2 ? 0 : r}px ${i%2 ? r : 0}px 0px 0px`// ${i%2 ? r : 0}px ${i%2 ? 0 : r}px`
        button.style.borderWidth = getBorderSize() + 'px'
    }
    
    clock_vote_info.style.top = getClockButtonTopOffset() + getClockButtonHeight() + getBorderSize() + 'px'
    clock_vote_info.style.left = -getClockButtonWidth() - 1.5 * getBorderSize() + 'px'
    clock_vote_info.style.width = 2 * getClockButtonWidth() - getBorderSize() + 'px'
    clock_vote_info.style.height = 4 * getClockButtonHeight() + 'px'
    clock_vote_info.style.fontSize = getClockButtonFontSize() + 'px'
    clock_vote_info.style.borderWidth = getBorderSize() + 'px'
    clock_vote_info.style.padding = getBorderSize() + 'px'
    clock_vote_info.style.borderRadius = `0px 0px ${r}px ${r}px`
    clock_vote_info.children[1].width = clock_vote_info.children[1].height = getClockButtonFontSize()
    clock_vote_info.children[3].width = clock_vote_info.children[3].height = getClockButtonFontSize()
}

function reSizePlayers() {
    for (let i=0; i < max_players; i++) {
        let token = tokens.children[i]
        let name = names.children[i]
        let death_token = death_tokens.children[i]
        let socket_icon = socket_icons.children[i]
        let dead_vote = dead_votes.children[i]
        let nap = night_action_pendings.children[i]
        
        let width = getTokenSize(game_state.player_info.length)
        let height = width
        let left = (size/2) * (1 + getCircleFraction() * Math.sin(Math.PI * 2 * i / game_state.player_info.length)) - (width/2)
        let top = (size/2) * (1 - getCircleFraction() * Math.cos(Math.PI * 2 * i / game_state.player_info.length)) - (height/2)
        
        
        token.style.width = width + 'px'
        token.style.height = height + 'px'
        token.style.left = left + 'px'
        token.style.top = top + 'px'
        
        for (j=0; j < 2; j++) {
            token.children[j].width = width
            token.children[j].height = height
        }
        
        token.children[2].setAttribute('width', width)
        token.children[2].setAttribute('height', height)
        
        token.children[2].children[0].setAttribute('d', 'M ' + 0.075 * width + ' ' + height/2 + ' a ' + width*0.425 + ' ' + height*0.425 + ' 0 0 0 ' + 0.85*width + ' 0')
        token.children[2].children[1].style.fontSize = getTokenFontSize(game_state.player_info.length) + 'px'
        
        name.style.top = top + height + getTokenBorderSize(game_state.player_info.length) + 'px'
        name.style.left = left - getBorderSize() + 'px'
        name.style.width = width + 'px'
        name.style.height = getNameHeight(game_state.player_info.length) + 'px'
        name.style.fontSize = getNameFontSize(game_state.player_info.length) + 'px'
        name.style.lineHeight = getNameHeight(game_state.player_info.length) + 'px'
        name.style.borderRadius = getCornerRadius() + 'px'
        name.style.borderWidth = getBorderSize() + 'px'
        
        death_token.width = getDeathFraction(game_state.player_info.length)
        death_token.height = 419 * death_token.width / 233
        death_token.style.top = top + 'px'
        death_token.style.left = left + (width/2) - (death_token.width/2) + 'px'
        
        for (let j=0; j < 2; j++) {
            let vote_icon = (j ? yes_votes : no_votes).children[i]
            vote_icon.width = (j ? getYesVoteSize(game_state.player_info.length) : getNoVoteSize(game_state.player_info.length))
            vote_icon.height = vote_icon.width
            vote_icon.style.top = top + (height/2) - (vote_icon.height/2) + 'px'
            vote_icon.style.left = left + (width/2) - (vote_icon.width/2) + 'px'
        }
        
        socket_icon.width = getSocketIconSize(game_state.player_info.length)
        socket_icon.height = socket_icon.width * 218 / 127
        socket_icon.style.left = left + 'px'
        socket_icon.style.top = top + height - socket_icon.height + 'px'
        
        dead_vote.width = getSocketIconSize(game_state.player_info.length)
        dead_vote.height = dead_vote.width * 381 / 467
        dead_vote.style.left = left + width - dead_vote.width + 'px'
        dead_vote.style.top = top + height - dead_vote.height + 'px'
        
        nap.width = getSocketIconSize(game_state.player_info.length)
        nap.height = nap.width
        nap.style.left = left + 'px'
        nap.style.top = top + 'px'
        
        for (let j=0; j < 2; j++) {
            let r = night_reminders.children[i*2 + j]
            let s = getNightReminderSize(game_state.player_info.length)
            r.style.width = r.style.height = s + 'px'
            r.style.left = left + j * width - s/2 - getBorderSize() + 'px'
            r.style.top = top + (height/2) - s/2 - getBorderSize() + 'px'
            r.style.lineHeight = s + 'px'
            r.style.borderWidth = getBorderSize() + 'px'
            r.style.fontSize = getNightReminderFontSize(game_state.player_info.length) + 'px'
        }
    }
    reSizeReminders()
}

function reSizeReminders() {
    for (let i=0; i < max_players; i++) {
        for (let j=0; j < max_reminders; j++) {
            let reminder = reminders.children[i*max_reminders + j]

            let reminder_size = getReminderSize(game_state.player_info.length)
            
            let c_x = (size/2) + 
                        ((size/2) * getCircleFraction() - getReminderGapFraction() * (j+1) * reminder_size - getTokenSize(game_state.player_info.length)/2 - getNameHeight(game_state.player_info.length) - getTokenBorderSize(game_state.player_info.length) - getBorderSize() * 2 - (j + 0.5) * reminder_size) 
                            * Math.sin(Math.PI * 2 * i / game_state.player_info.length)
            
            let c_y = (size/2) - 
                        ((size/2) * getCircleFraction() - getReminderGapFraction() * (j+1) * reminder_size - getTokenSize(game_state.player_info.length)/2 - getNameHeight(game_state.player_info.length) - getTokenBorderSize(game_state.player_info.length) - getBorderSize() * 2 - (j + 0.5) * reminder_size) 
                             * Math.cos(Math.PI * 2 * i / game_state.player_info.length)
            
            reminder.style.width = reminder.style.height = reminder_size + 'px'
            reminder.style.top = c_y - reminder_size/2 + 'px'
            reminder.style.left = c_x - reminder_size/2 + 'px'
            
            let bg_image = reminder.children[0]
            
            bg_image.width = bg_image.height = reminder_size
            
            let icon_image = reminder.children[1]
            
            icon_image.width = icon_image.height = reminder_size * getReminderIconFraction()
            icon_image.style.left = reminder_size/2 - icon_image.width/2 + 'px'
            
            let reminder_text = reminder.children[2]
            
            reminder_text.style.width = reminder_text.style.height = reminder_size / Math.sqrt(2) + 'px'
            reminder_text.style.top = reminder_size/2 - parseFloat(reminder_text.style.width)/2 + 'px'
            reminder_text.style.left = reminder_size/2 - parseFloat(reminder_text.style.width)/2 + 'px'
            reminder_text.style.fontSize = getReminderTextFontSize(game_state.player_info.length) + 'px'
            
            let x_image = reminder.children[3]
            
            x_image.width = x_image.height = getReminderXFraction() * reminder_size
            x_image.style.top = reminder_size/2 - x_image.height/2 + 'px'
            x_image.style.left = reminder_size/2 - x_image.width/2 + 'px'
        }
    }
}

function reSizeTokenMenu() {
    
    let t = getCornerRadius()
    token_menu.style.borderRadius = `${t}px`
    token_menu.style.borderWidth = getBorderSize() + 'px'
    
    // Info
    let info_bar = token_menu.children[0]
    info_bar.style.height = getTokenMenuButtonHeight() + 'px'
    info_bar.style.fontSize = getTokenMenuInfoFontSize() + 'px'
    
    // Shuffle Characters
    let shuffle_characters = token_menu.children[1]
    shuffle_characters.style.height = getTokenMenuButtonHeight() + 'px'
    shuffle_characters.style.fontSize = getTokenMenuFontSize() + 'px'
    shuffle_characters.style.lineHeight = getTokenMenuButtonHeight() + 'px'
    shuffle_characters.style.borderRadius = `${t}px 0px 0px ${t}px`
    shuffle_characters.style.borderWidth = getBorderSize() + 'px'
    
    // Cancel Button
    let cancel_button = token_menu.children[2]
    cancel_button.style.height = getTokenMenuButtonHeight() + 'px'
    cancel_button.style.fontSize = getTokenMenuFontSize() + 'px'
    cancel_button.style.lineHeight = getTokenMenuButtonHeight() + 'px'
    cancel_button.style.borderRadius = `0px ${t}px ${t}px 0px`
    cancel_button.style.borderWidth = getBorderSize() + 'px'
    
    // Finish Button
    let finish_button = token_menu.children[3]
    finish_button.style.height = getTokenMenuButtonHeight() + 'px'
    finish_button.style.fontSize = getTokenMenuFontSize() + 'px'
    finish_button.style.lineHeight = getTokenMenuButtonHeight() + 'px'
    finish_button.style.borderWidth = getBorderSize() + 'px'
    
    // Team Selection
    let team_selection = token_menu.children[4]
    for (let i=0; i<4; i++) {
        let team = team_selection.children[i]
        team.style.height = getTokenMenuSize() + 'px'
        team.style.width = getTokenMenuSize()/2 + 'px'
        team.style.top = getTokenMenuSize() * i + 'px'
        team.style.fontSize = getTokenMenuFontSize() + 'px'
    }
    
    // Teams
    let max_numbers = [7, 7, 7, 1, 7, 7, 7, 7, 7, 7]
    for (let k=0; k < max_numbers.length; k++) {
        let team = token_menu.children[5 + k]
        for (let i=0; i < max_numbers[k]; i++) {
            let t = team.children[i]
            let width = height = getTokenMenuSize()
            t.style.width = t.style.height = width + 'px'
            t.style.left = (getTokenMenuSize() + 2 * getTokenMenuPaddingSize()) * i + getTokenMenuPaddingSize() + 'px'
            t.style.top = getTokenMenuPaddingSize() + 'px'
            for (j=0; j < 2; j++) {
                t.children[j].width = width
                t.children[j].height = height
            }
            
            t.children[2].setAttribute('width', width)
            t.children[2].setAttribute('height', height)
            
            t.children[2].children[0].setAttribute('d', 'M ' + 0.075 * width + ' ' + height/2 + ' a ' + width*0.425 + ' ' + height*0.425 + ' 0 0 0 ' + 0.85*width + ' 0')
            t.children[2].children[1].style.fontSize = getTokenMenuTokenFontSize() + 'px'
        }
    }
    
}

function reSizeReminderMenu() {
    
    let t = getCornerRadius()
    reminder_menu.style.borderRadius = `${t}px`
    reminder_menu.style.borderWidth = getBorderSize() + 'px'
    
    let info_bar = reminder_menu.children[0]
    info_bar.style.height = getReminderMenuSize()/2 + 'px'
    info_bar.style.fontSize = getReminderMenuFontSize() + 'px'
    
    let cancel_bar = reminder_menu.children[1]
    cancel_bar.style.height = getReminderMenuSize()/2 + 'px'
    cancel_bar.style.fontSize = getReminderMenuFontSize() + 'px'
    cancel_bar.style.lineHeight = getReminderMenuSize()/2 + 'px'
    cancel_bar.style.borderRadius = `${t}px`
    cancel_bar.style.borderWidth = getBorderSize() + 'px'
    
    reminder_size = getReminderMenuSize()
    let max_columns = Math.floor(size/reminder_size)
    let max_rows = max_columns - 2
    
    let padding = reminder_size * getReminderGapFraction()
    
    for (let i=0; i < max_rows; i++) {
        let row = reminder_menu.children[2 + i]
        for (let j=0; j < max_columns; j++) {
            let reminder = row.children[j]
            
            reminder.style.width = reminder.style.height = reminder_size + 'px'
            reminder.style.left = (reminder_size + 2 * padding) * j + padding + 'px'
            reminder.style.top = padding + 'px'
            
            let bg_image = reminder.children[0]
            
            bg_image.width = bg_image.height = reminder_size
            
            let icon_image = reminder.children[1]
            
            icon_image.width = icon_image.height = reminder_size * getReminderIconFraction()
            icon_image.style.left = reminder_size/2 - icon_image.width/2 + 'px'
            
            let reminder_text = reminder.children[2]
            
            reminder_text.style.width = reminder_text.style.height = reminder_size / Math.sqrt(2) + 'px'
            let movement = parseFloat(reminder_text.style.width) * getReminderTextMovementFraction()
            
            reminder_text.style.height = parseFloat(reminder_text.style.height) - movement + 'px'
            reminder_text.style.top = reminder_size/2 - parseFloat(reminder_text.style.width)/2 + movement + 'px'
            reminder_text.style.left = reminder_size/2 - parseFloat(reminder_text.style.width)/2 + 'px'
            reminder_text.style.fontSize = getReminderMenuTextFontSize() + 'px'
        }
    }
}

function reSizeGameMenu() {
    game_menu.style.top = size/2 + 'px'
    game_menu.style.left = size/2 + 'px'
    for (let i=0; i < 2; i++) {
        let button = game_menu.children[i]
        button.style.width = getGameMenuButtonWidth() + 'px'
        button.style.height = getGameMenuButtonHeight() + 'px'
        button.style.left = (i-1) * getGameMenuButtonWidth() - (1.5 - i) * getBorderSize() + 'px'
        button.style.top = -getGameMenuButtonHeight()/2 - getBorderSize() + 'px'
        button.style.lineHeight = getGameMenuButtonHeight() + 'px'
        let t = getCornerRadius()
        button.style.borderRadius = `${t*(1-i)}px ${t*i}px ${t*i}px ${t*(1-i)}px`
        button.style.borderWidth = getBorderSize() + 'px'
    }
}

function reSizeInfo() {
    let width = (size * getCircleFraction() - getTokenSize(0)) / Math.sqrt(2)
    info.style.width = width + 'px'
    info.style.height = getInfoRowHeight() + 'px'
    info.style.left = (size - width)/2 - getBorderSize() + 'px'
    info.style.fontSize = getInfoFontSize() + 'px'
    //info.style.lineHeight = info.style.height
    info.style.borderWidth = getBorderSize() + 'px'
}

function reSizeCancelSelect() {
    let width = (size * getCircleFraction() - getTokenSize(0)) / Math.sqrt(2)
    cancel_select.style.width = width + 'px'
    cancel_select.style.height = getInfoRowHeight() + 'px'
    cancel_select.style.left = (size - width)/2 - getBorderSize() + 'px'
    cancel_select.style.top = size/2 - getBorderSize()/2 + 'px'
    cancel_select.style.fontSize = getInfoFontSize() + 'px'
    cancel_select.style.lineHeight = cancel_select.style.height
    let t = getCornerRadius()
    cancel_select.style.borderRadius = `0px 0px ${t}px ${t}px`
    cancel_select.style.borderWidth = getBorderSize() + 'px'
}

function reSizeHUD() {
    let rows = Math.max(info_HUD.childElementCount, action_HUD.childElementCount)
    for (let i=0; i < 2; i++) {
        let menu = [info_HUD, action_HUD][i]
        menu.style.margin = getHUDMargin() + 'px'
        menu.style.left = i * (window.innerWidth - getHUDRowWidth() - getHUDMargin() * 4 - getBorderSize() * 2) + 'px'
        menu.style.width = getHUDRowWidth() + getHUDMargin() * 2 + 'px'
        menu.style.height = rows * getHUDRowHeight() + 'px'
        menu.children[0].children[0].width = menu.children[0].children[0].height = getHUDRowHeight()/2
        menu.style.borderRadius = getCornerRadius() + 'px'
        menu.style.borderWidth = getBorderSize() + 'px'
        
        for (let j=0; j < menu.childElementCount; j++) {
            let row = menu.children[j]
            row.style.visibility = menu.children[1].style.visibility
            row.style.top = j * getHUDRowHeight() + 'px'
            row.style.height = getHUDRowHeight() + 'px'
            row.style.left = getHUDMargin() + 'px'
            row.style.width = getHUDRowWidth() + 'px'
            row.style.fontSize = (!Boolean(j) * 0.8 + 1) * getHUDFontSize() + 'px'
            row.style.lineHeight = getHUDRowHeight() + 'px'
        }
    }
    
    // Change Phase
    change_phase.children[0].width = change_phase.children[0].height = getHUDFontSize()
    change_phase.children[2].width = change_phase.children[2].height = getHUDFontSize()
}

function reSizeNightActionMenu() {
    
    let row_sizes = [2, 2, 2, 2, 2, 1.5, 0.5, 1] // Title, finish, restrictions & info double
    let rows = row_sizes.reduce((a, b) => {return a + b}, 0)
    
    night_action_menu.style.width = getNightActionMenuWidth() + getNightActionMenuPadding() * 2 + 'px'
    night_action_menu.style.height = getNightActionMenuPadding() * 2 + rows * getNightActionMenuRowHeight() + 'px'
    night_action_menu.style.top = (size - parseFloat(night_action_menu.style.height))/2 - getBorderSize() + 'px'
    night_action_menu.style.left = (size - parseFloat(night_action_menu.style.width))/2 - getBorderSize() + 'px'
    
    night_action_menu.style.borderWidth = getBorderSize() + 'px'
    night_action_menu.style.borderRadius = getCornerRadius() + 'px'
    
    let r = getCornerRadius()
    for (let i=0; i < night_action_menu.childElementCount; i++) {
        let div = night_action_menu.children[i]
        div.style.left = getNightActionMenuPadding() + 'px'
        // Title
        if (i < 1) {
            div.style.top = getNightActionMenuPadding() + 'px'
            
            div.children[0].style.width = getNightActionMenuWidth() + 'px'
            div.children[0].style.height = 2 * getNightActionMenuRowHeight() + 'px'
            div.children[0].style.fontSize = 2 * getNightActionMenuFontSize() + 'px'
            div.children[0].style.lineHeight = 2 * getNightActionMenuRowHeight() + 'px'
        }
        // Plus Minus
        else if (i < 5) {
            div.style.top = 2 * getNightActionMenuRowHeight() + getNightActionMenuPadding() + 'px'
            for (let j=0; j<2; j++) {
                div.children[j].style.width = getNightActionMenuWidth()/4 + 'px'
                div.children[j].style.top = j * getNightActionMenuRowHeight() + 'px'
                div.children[j].style.height = getNightActionMenuRowHeight() + 'px'
                div.children[j].style.fontSize = (1 + j*3) * getNightActionMenuFontSize() + 'px'
                div.children[j].style.left = (i - 1) * getNightActionMenuWidth()/4 + 'px'
                div.children[j].style.lineHeight = getNightActionMenuRowHeight() + 'px'
                
                // Plus Minus Icons
                div.children[1].children[j*2].width = div.children[1].children[j*2].height = 4 * getNightActionMenuFontSize() / 2
                //div.children[1].children[j*2].style.top = (getNightActionMenuRowHeight() - getNightActionMenuFontSize()/2)/2 + 'px'
                div.children[1].children[j*2].style.left = ((j*2)-1) * (getNightActionMenuFontSize()/2) + 'px'
            }
        }
        // Restrictions
        else if (i < 7) {
            div.style.top = (4 + 2 * (i-5))* getNightActionMenuRowHeight() + getNightActionMenuPadding() + 'px'
            
            for (let j=0; j < div.childElementCount; j++) {
                div.children[j].style.width = ((div.childElementCount - 2) * !Boolean(j) + 1) * getNightActionMenuWidth()/(div.childElementCount-1) - Boolean(j) * getBorderSize() + 'px'
                div.children[j].style.top = Boolean(j) * getNightActionMenuRowHeight() + 'px'
                div.children[j].style.left = Boolean(j) * ((j-1) * getNightActionMenuWidth()/(div.childElementCount-1) - getBorderSize()/2) + 'px'
                div.children[j].style.fontSize = getNightActionMenuFontSize() + 'px'
                div.children[j].style.height = getNightActionMenuRowHeight() - Boolean(j) * 2 * getBorderSize() + 'px'
                div.children[j].style.lineHeight = parseFloat(div.children[j].style.height) + 'px'
                if (j > 0) {
                    div.children[j].style.borderRadius = `${j == 1 ? r : 0}px ${j == div.childElementCount-1 ? r : 0}px ${j == div.childElementCount-1 ? r : 0}px ${j == 1 ? r : 0}px`
                    div.children[j].style.borderWidth = getBorderSize() + 'px'
                }
            }
            
        }
        // Grimoire
        else if (i < 8) { 
            div.style.top = 8 * getNightActionMenuRowHeight() + getNightActionMenuPadding() + 'px'
            div.children[0].style.width = getNightActionMenuWidth()/4 - 2 * getBorderSize() + 'px'
            div.children[0].style.left = 2*getNightActionMenuWidth()/4 - parseFloat(div.children[0].style.width)/2 + 'px'
            div.children[0].style.top = getNightActionMenuRowHeight()/2 + 'px'
            div.children[0].style.height = getNightActionMenuRowHeight() - 1 * getBorderSize() + 'px'
            div.children[0].style.lineHeight = parseFloat(div.children[0].style.height) + 'px'
            div.children[0].style.borderRadius = `${r}px ${r}px ${r}px ${r}px`
            div.children[0].style.borderWidth = getBorderSize() + 'px'
            div.children[0].style.fontSize = getNightActionMenuFontSize() + 'px'
        }
        // Info/Confirm Prompt
        else if (i < 10) {
            div.style.top = 9.5 * getNightActionMenuRowHeight() + getNightActionMenuPadding() + 'px'
            
            div.children[0].style.lineHeight = getNightActionMenuRowHeight() + 'px'
            for (let j=0; j < div.childElementCount; j++) {
                div.children[j].style.width = getNightActionMenuWidth()/2 - Boolean(j) * 8 * getBorderSize() + 'px'
                div.children[j].style.height = getNightActionMenuRowHeight() - Boolean(j) * 2 * getBorderSize() + 'px'
                div.children[j].style.left = (i-8) * getNightActionMenuWidth()/2 + j * 3 * getBorderSize() + 'px'
                div.children[j].style.top = j * (getNightActionMenuRowHeight()) + 'px'
                div.children[j].style.fontSize = getNightActionMenuFontSize() + 'px'
                div.children[1].style.borderRadius = `${r}px ${r}px ${r}px ${r}px`
                div.children[1].style.borderWidth = getBorderSize() + 'px'
            }
        }
        // Finish Cancel
        else if (i < 11) {
            div.style.top = 12 * getNightActionMenuRowHeight() + getNightActionMenuPadding() + 'px'
            for (let j=0; j < div.childElementCount; j++) {
                div.children[j].style.width = getNightActionMenuWidth()/2 - getBorderSize() + 'px'
                div.children[j].style.height = getNightActionMenuRowHeight() - 2 * getBorderSize() + 'px'
                div.children[j].style.left = j * getNightActionMenuWidth()/2 - getBorderSize()/2 + 'px'
                div.children[j].style.fontSize = getNightActionMenuFontSize() + 'px'
                div.children[j].style.lineHeight = parseFloat(div.children[j].style.height) + 'px'
                div.children[j].style.borderRadius = `${j ? 0 : r}px ${j ? r : 0}px ${j ? r : 0}px ${j ? 0 : r}px`
                div.children[j].style.borderWidth = getBorderSize() + 'px'
            }
        }     
    }
}

function reSizeFabledDemonBluffsHUD() {
    let e_y = (window.innerHeight - size)/2
    let e_x = (window.innerWidth - size)/2
    let r = getTokenSize(0)/2 + size * getCircleFraction() / 2
    let s = size/2
    let y = 5 * (-Math.sqrt(169*r**2 -49*s**2 + 70*s*e_x*e_y -168*s*e_y-25*e_x**2+120*e_x*e_y-144*e_y**2) + 17*s + 12*e_x + 5*e_y)/169
    if (!y) {
        y = window.innerWidth/(2 * 2.4)
    }
    y = Math.min(y - 2 * getBorderSize(), getTokenSize(0) * 1.25)
    let x = 2.4 * y
    let p = x/3
    
    fabled_demon_bluffs_HUD.style.top = window.innerHeight - y - 2 * getBorderSize() - getHUDMargin() + 'px'
    fabled_demon_bluffs_HUD.style.left = window.innerWidth - getBorderSize() * 2 - getHUDMargin() - x + 'px'
    fabled_demon_bluffs_HUD.style.height = y + 'px'
    fabled_demon_bluffs_HUD.style.width = x + 'px'
    fabled_demon_bluffs_HUD.style.borderRadius = getCornerRadius() + 'px'
    fabled_demon_bluffs_HUD.style.borderWidth = getBorderSize() + 'px'
    
    // Fabled
    fabled_tokens.children[0].style.width = x + 'px'
    fabled_tokens.children[0].style.height = (y-p) + 'px'
    fabled_tokens.children[0].style.lineHeight = (y-p) + 'px'
    fabled_tokens.children[0].style.borderWidth = getBorderSize() + 'px'
    fabled_tokens.children[0].style.borderBottomRightRadius = getCornerRadius() + 'px'
    
    // Demon Bluffs
    for (let i=0; i < demon_bluffs.childElementCount; i++) {
        let e = demon_bluffs.children[i]
        if (i > 0) {
            e.style.top = (y-p) + 'px'
            e.style.left = p*(i-1) + 'px'
            e.style.width = e.style.height = p + 'px'
            
            for (j=0; j < 2; j++) {
                e.children[j].width = p
                e.children[j].height = p
            }
            
            e.children[2].setAttribute('width', p)
            e.children[2].setAttribute('height', p)
        
            e.children[2].children[0].setAttribute('d', 'M ' + 0.075 * p + ' ' + p/2 + ' a ' + p*0.425 + ' ' + p*0.425 + ' 0 0 0 ' + 0.85*p + ' 0')
            e.children[2].children[1].style.fontSize = (y/(getTokenSize(0) * 1.25)) * getTokenFontSize(0) + 'px'
        }
        else {
            e.style.width = x + 'px'
            e.style.height = (y-p) + 'px'
            e.style.lineHeight = (y-p) + 'px'
            e.style.borderWidth = getBorderSize() + 'px'
            e.style.borderBottomLeftRadius = getCornerRadius() + 'px'
        }
    }
}

function reSizeInfoHoverBox() {
    info_hover_box.style.width = getInfoHoverBoxWidth() + 'px'
    info_hover_box.children[0].style.borderRadius = getCornerRadius() + 'px'
    info_hover_box.children[0].style.borderWidth = getBorderSize() + 'px'
}

function reSizeEditionMenu() {
    edition_menu.style.width = getEditionMenuWidth() + 'px'
    edition_menu.style.height = getEditionMenuHeight() + 'px'
    edition_menu.style.top = (size - getEditionMenuHeight())/2 - getBorderSize() + 'px'
    edition_menu.style.left = (size - getEditionMenuWidth())/2 - getBorderSize() + 'px'
    edition_menu.style.borderWidth = getBorderSize() + 'px'
    edition_menu.style.borderRadius = getCornerRadius() + 'px'
    
    edition_menu.children[0].style.width = getEditionMenuWidth() - getEditionMenuPadding() * 2 + 'px'
    edition_menu.children[0].style.height = getEditionMenuHeight() - getEditionMenuPadding() * 2 - getEditionMenuTextHeight() - getBorderSize() + 'px'
    
    for (let i=0; i<2; i++) {
        edition_menu.children[i].style.left = (1-i) * getEditionMenuPadding() - Math.floor(i * getBorderSize()) + 'px'
        edition_menu.children[i].style.top = getEditionMenuPadding() + i * (getEditionMenuHeight() - getEditionMenuTextHeight() - Math.floor(getBorderSize()) - getEditionMenuPadding()) + 'px'
        edition_menu.children[1].children[i].style.left = i * (getEditionMenuWidth() + getBorderSize())/2 + 'px'
        edition_menu.children[1].children[i].style.width = getEditionMenuWidth()/2 + getBorderSize() + 'px'
        edition_menu.children[1].children[i].style.height = getEditionMenuTextHeight() + 'px'
        edition_menu.children[1].children[i].style.borderWidth = getBorderSize() + 'px'
        edition_menu.children[1].children[i].style.lineHeight = getEditionMenuTextHeight() + 'px'
        edition_menu.children[1].children[i].style.fontSize = getEditionMenuFontSize() + 'px'
    }
}

function reSizeAlertBox() {
    alert_box.style.width = window.innerWidth + 'px'
    alert_box.style.height = window.innerHeight + 'px'
    
    let t = getCornerRadius()
    let w = getBorderSize()
    for (let i=0; i<alert_box.childElementCount; i++) {
        let div = alert_box.children[i]
        div.style.width = getAlertBoxWidth() + 'px'
        div.style.borderWidth = `${i > 0 ? w/2 : w}px ${w}px ${i < 2 ? w/2 : w}px ${w}px`
        div.style.borderRadius = `${!i ? t : 0}px ${!i ? t : 0}px ${i < 2 ? 0 : t}px ${i < 2 ? 0 : t}px`
        for (let j=0; j < div.childElementCount; j++) {
            let width = getAlertBoxWidth()/(div.childElementCount) - w * (div.childElementCount-1) - getAlertBoxPadding() * 2 * (div.childElementCount-1)/(div.childElementCount)
            div.children[j].style.width = width + 'px'
            //div.children[j].style.left = j*(width + w) + Boolean(j) * w/2 + 'px'
            div.children[j].style.fontSize = getAlertBoxFontSize() + 'px'
            div.children[j].style.borderWidth = w/2 + 'px'
            div.children[j].style.padding = getAlertBoxPadding() + 'px'
            if (i > 1) {
                div.children[j].style.height = getAlertBoxRowHeight() + 'px'
                div.children[j].style.lineHeight = getAlertBoxRowHeight() + 'px'
            }
        
        }
        
    }
}

function reSizeGameLog() {
    let t = getCornerRadius()
    game_log.children[1].children[0].width = game_log.children[1].children[0].height = getHUDRowHeight()/2
    game_log.style.width = getHUDRowWidth() + getHUDMargin() * 2 + 'px'
    game_log.style.height = 12 * getHUDRowHeight() + 2 * getHUDMargin() + 'px'
    game_log.style.left = getHUDMargin() + 'px'
    game_log.style.top = window.innerHeight - 12 * getHUDRowHeight() - getBorderSize() * 3 - getHUDMargin()*3 + 'px'
    game_log.style.borderRadius = `${t}px ${t}px ${0}px ${0}px`
    game_log.style.borderWidth = getBorderSize() + 'px'
    
    for (let i=0; i<2; i++) {
        game_log.children[i].style.width = getHUDRowWidth() + 'px'
        game_log.children[i].style.paddingLeft = getHUDMargin() + 'px'
        game_log.children[i].style.paddingRight = getHUDMargin() + 'px'
        game_log.children[i].style.height = (11 - i*10) * getHUDRowHeight() + 'px'
        game_log.children[i].style.left = - i * getBorderSize() + 'px'
        game_log.children[i].style.top = i * 11 * getHUDRowHeight() + getHUDMargin() * (1+i) + 'px'
        game_log.children[i].style.fontSize = getHUDFontSize() * (1+0.8 * i) + 'px'
        if (i==1) {
            game_log.children[i].style.lineHeight = getHUDRowHeight() + 'px'
            game_log.children[i].style.borderRadius = `${t}px ${t}px ${i*t}px ${i*t}px`
            game_log.children[i].style.borderWidth = getBorderSize() + 'px'
        }
    }
}

function reSizeEditionIcon() {
    // pass
}