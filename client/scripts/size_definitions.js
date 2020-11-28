function getPlayerNumberFraction(number_of_players) {
    if (number_of_players <= 9) {
        return 1
    }
    else if (number_of_players <= 13) {
        return 0.7
    }
    else if (number_of_players <= 19) {
        return 0.5
    }
    else {
        return 0.4
    }
}

function getMenuFontSize() {
    return size/50
}

function getMenuWidth() {
    return size/4
}

function getMenuHeight() {
    return size/30
}

function getGameMenuButtonWidth() {
    return size/2
}

function getGameMenuButtonHeight() {
    return size/4
}
function getGameMenuButtonFontSize() {
    return size/20
}

function getClockButtonWidth() {
    return size/5
}

function getClockButtonHeight() {
    return size/30
}

function getClockButtonFontSize() {
    return size/50
}

function getClockButtonTopOffset() {
    return -getClockButtonHeight() - getBorderSize()
}

function getDeathFraction(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/(12.9 * 1.3);
}

function getTokenSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/6;
}

function getTokenFontSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/45;
}

function getTokenBorderSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/(210 * 6 / 10);
}

function getYesVoteSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size * 0.7 / (5 * 1.6)
}

function getNoVoteSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size / 14
}

function getNameFontSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/40
}

function getNameHeight(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/30
}

function getCircleFraction() {
    return 0.7
}

function getClockHandLength() {
    return size/2
}

function getHUDRowWidth() {
    return size/4.1
}

function getHUDRowHeight() {
    return size/26
}

function getHUDFontSize() {
    return size/60
}

function getHUDMargin() {
    return size/80
}

function getInfoRowHeight() {
    return size/13
}

function getInfoFontSize() {
    return size/60
}

function getSocketIconSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/50
}

function getNightReminderSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/25
}

function getNightReminderFontSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/40;
}

function getReminderSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/15
}

function getReminderBorderSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/(400 * 36 * 15 / 800);
}

function getReminderMenuSize() {
    return size/8
}

function getReminderGapFraction() {
    return 0.05
}

function getReminderIconFraction() {
    return 0.8
}

function getReminderTextMovementFraction() {
    return 0.6
}

function getReminderTextFontSize(number_of_players) {
    let t = getPlayerNumberFraction(number_of_players)
    return t * size/(80)
}

function getReminderMenuTextFontSize() {
    return size/(80 * 8 / 10)
}

function getReminderXFraction() {
    return 0.9
}

function getTokenMenuSize() {
    return size/10;
}

function getTokenMenuButtonHeight() {
    return getTokenMenuSize()/2
}

function getTokenMenuFontSize() {
    return size/(10 * 35/6)
}

function getTokenMenuTokenFontSize() {
    return size/(10 * 45/6)
}

function getTokenMenuInfoFontSize() {
    return size/(10 * 20/6)
}

function getTokenMenuBorderSize() {
    return size/210
}

function getTokenMenuPaddingSize() {
    return getTokenMenuBorderSize()
}

function getReminderMenuFontSize() {
    return size/60
}

function getNightActionMenuRowHeight() {
    return size/20
}

function getNightActionMenuPadding() {
    return size/20
}

function getNightActionMenuWidth() {
    return size/1.2
}

function getNightActionMenuFontSize() {
    return size/60
}

function getEditionMenuWidth() {
    return size/1.2
}

function getEditionMenuHeight() {
    return size/1.2
}

function getEditionMenuPadding() {
    return size/100
}

function getEditionMenuTextHeight() {
    return size/12
}

function getEditionMenuFontSize() {
    return size/30
}

function getEditionIconWidth() {
    return size/3.5
}

function getInfoHoverBoxWidth() {
    return (2/3) * (window.innerWidth - size)/2 + size/2 - getTokenSize(0) - getInfoHoverBoxOffset()
}

function getInfoHoverBoxOffset() {
    return getNightReminderSize(game_state.player_info.length)
}

function getInfoHoverBoxFontSize() {
    return size/40
}

function getAlertBoxWidth() {
    return size/2
}

function getAlertBoxFontSize() {
    return size/50
}

function getAlertBoxRowHeight() {
    return size /20
}

function getAlertBoxPadding() {
    return size/100
}

// ------------- STYLE -------------
function getBackgroundColour() {
    return 'rgba(100, 100, 100, 0.8)'
}

function getFontColour() {
    return 'rgba(240, 240, 240, 0.8)'
}

function getSelectedFontColour() {
    return 'rgba(240, 0, 0, 0.8)'
}

function getBlueColour() {
    return 'rgba(0, 0, 200, 0.8)'
}

function getRedColour() {
    return 'rgba(200, 0, 0, 0.8)'
}

function getBorderColour() {
    return 'rgba(0, 0, 0, 1)'
}

function getBorderSize() {
    return size/250
}

function getCornerRadius() {
    return size/100
}

function getSolidBackgroundColour() {
    return 'rgba(100, 100, 100, 1)'
}

function getFontFamily() {
    return 'Trebuchet MS'
}

function getLogPhaseStyle(msg) {
    return `<span style="${
        'color: rgba(116, 180, 255, 0.8);'
    }">${msg}</span>`
}

function getLogNightActionStyle(msg) {
    return `<span style="${
        'color: rgba(191, 255, 216, 0.8);'
    }">${msg}</span>`
}

function getLogNominationStyle(msg) {
    return `<span style="${
        'color: rgba(255, 204, 190, 0.8);'
    }">${msg}</span>`
}

function getLogDefaultStyle(msg) {
    return `<span style="${
        'color: rgba(240, 240, 240, 0.8);'
    }">${msg}</span>`
}

function getLogPlayerStyle(msg) {
    return `<span style="${
        'color: rgba(151, 241, 255, 0.8);'
    }">${msg}</span>`
}

function getLogCharacterStyle(msg) {
    return `<span style="${
        'color: rgba(220, 210, 255, 0.8);'
    }">${msg}</span>`
}