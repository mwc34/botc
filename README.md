# Blood on the Clocktower

Online application to help play BotC

Available to use [here](https://evabs.soc.srcf.net)

## Features

- Server side game hosting
- Broadcasting of characters with "Sync Characters"
- Day/Night phases
- Nomination tracking
- Interactive night actions
- Toggleable log tracking
- Grimoire reveal
- Custom editions / characters / fabled

## Custom Edition/Characters/Fabled

- Accepts JSON produced by the [script tool](https://bloodontheclocktower.com/script/)
- For custom characters/fabled, they should be in the following format:

```json
{
      "id":"lunatic",
      "name":"Lunatic",
      "team":"outsider",
      "ability":"You think you are a Demon, but your abilities malfunction. The Demon knows who you are and who you attack.",
      "firstNight":2,
      "firstNightReminder":"If 7 or more players: Show the Lunatic a number of arbitrary \u201cMinion\u201c, players equal to the number of Minions in play. Show 3 character tokens of arbitrary Good characters. If the token received by the Lunatic is a Demon that would wake tonight: \u2022 Allow the Lunatic to do the Demon actions. Place their \u201cattack\u201d markers. Wake the Demon. Show the Demon\u2019s real character token. Show them the Lunatic player. \u2022 If the Lunatic attacked players: Show the real demon each marked player. Remove any Lunatic \u201cattack\u201d markers.",
      "otherNight":16,
      "otherNightReminder":"Allow the Lunatic to do the actions of the Demon. Place their \u201cattack\u201d markers. If the Lunatic selected players: Wake the Demon. Show the \u201cattack\u201d marker, then point to each marked player. Remove any Lunatic \u201cattack\u201d markers.",
      "remindersGlobal":["Lunatic", "Attack 1", "Attack 2", "Attack 3", "Decoy"],
      "setup":true,
      "removesSelf":true,
      "nightActions":[],
      "nightActionsScoped":[
         {
            "name":"Learn Lunatic Player",
            "inPlayers":1,
            "scope":"global",
            "scopeRestrictions":["demon"]
         },
         {
            "name":"Learn Lunatic Attack",
            "inPlayers":3,
            "scope":"global",
            "playerRestrictions":["cancel"],
            "scopeRestrictions":["demon"]
         }
      ]
   }
```

- Required properties are: **id** **name** **team** **ability** **icon**
- **id**: the unique backend ID for this character
- **name**: the name shown on the token
- **team**: team of the character: **townsfolk** **outsider** **minion** **demon** **fabled**
- **icon**: url to the picture (should be square with some border around it, see the default icons)
- **setup**: whether the character affects which characters are chosen during setup, shown with a purple ring in game
- **removesSelf**: whether they should be shown to a player (e.g. **Drunk** **Lunatic** **Lil' Monsta**) will give a warning message if chosen
- **firstNight/otherNight**: position of when the character acts during the night
- **firstNightReminder/otherNightReminder**: reminder text for the storyteller
- **reminders/remindersGlobal**: arrays of reminder token text. Global is for when they aren't on the grimoire but are in the script (e.g. Drunk)
- **nightActions/nightActionsScoped**: arrays of the character's night actions. Options are:
    - **name**: Required. the name of the action which is shown to players
    - **info**: Text with <> in place of the input text (e.g. You learn <>)
    - **players/characters**: integers describing how many players/characters they have to pick
    - **inPlayers/inCharacters**: integers describing how many players/characters the storyteller has to pick
    - **playerRestrictions/characterRestrictions**: restrictions on what the storyteller/player can pick. Options are:
        - **townsfolk/outsider/minion/demon/traveler**: will limit to the selected classes. If none are given, any are allowed
        - **alive/dead**: only allows picking alive/dead players. If none are given, both are allowed
        - **outOfPlay**: only shows out of play character (only for demon bluffs so far)
        - **others**: can't target yourself (**Monk**)
        - **cancel**: allows early finishing of the action. Used for when the numbers aren't known (**Minion Info** **Godfather info**) or for once per game abilities (**Seamstress**)
    - **scope**: for **nightActionsScoped**, either "local" (for only when the character is in play) or "global" (always)
    - **scopeRestrictions**: for **nightActionsScoped**, an array of which teams to propagate the night action to. If none are given, it is propagated to all
    - **create**: If true, the game will bring up a customisable menu each night. For ever changing abilities (e.g. **Cannibal** **Amnesiac**)
    - **confirm**: Text that is given as a prompt for a confirm box for the player (e.g. **Harlot**)
    - **group**: All players simultaneously using the night action will be able to see each other's' choices (e.g. **Lil' Monsta**)

For further guidance, the [roles](https://github.com/mwc34/botc/blob/main/client/json/roles.json) file shows how the base characters have been implemented

## Acknowledgements and Copyrights

- Based heavily off of [bra1n's](https://github.com/bra1n/) [townsquare](https://github.com/bra1n/townsquare)
- [Blood on the Clocktower](https://bloodontheclocktower.com/) is a trademark of Steven Medway and [The Pandemonium Institute](https://www.thepandemoniuminstitute.com/)
- Night reminders and other auxiliary text written by [Ben Finney](http://bignose.whitetree.org/projects/botc/diy/)
- Icons made by [Freepik](https://www.flaticon.com/authors/Freepik) from [Flatline](https://www.flaticon.com/)
- Background image by [Ryan Maloney](https://www.artstation.com/maloney94)
- All other images and icons are copyright to their respective owners