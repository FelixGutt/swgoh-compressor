const fs = require('fs');
const guild_data = require('./guild-data.json');
console.log("start");
initPlayerData();
for(member of guild_data.data.members) {
    const player_filename = "./" + member.ally_code + ".json";
    try {
        const member_json_string = fs.readFileSync(player_filename),
              member_json = JSON.parse(member_json_string);
        if (member_json && member_json.data && member_json.data.ally_code === member.ally_code) {
            appendPlayer(member, member_json);
        } else {
            console.log(player_filename + " :: " + member.ally_code + " :: " + member_json.data.ally_code);
            console.log("The data in " + player_filename + " does not match ally_code " + member.ally_code + "\n");
            //fs.writeFileSync(player_filename, "https://swgoh.gg/api/player/" + member.ally_code+ "/");
        }
    } catch (exception) {
        console.log(exception);
        console.log("Did not find a data file for " + member.player_name + " ally_code " + member.ally_code + " link " + "https://swgoh.gg/api/player/" + member.ally_code+ "/");
        fs.writeFileSync(player_filename, "https://swgoh.gg/api/player/" + member.ally_code+ "/");
    }
    console.log("processed: " + player_filename);
}
terminatePlayerData();
console.log("end");

function initPlayerData() {
    fs.writeFileSync('./import_member_data.js', "var import_guild_data = " + JSON.stringify(guild_data) + ";\n\nvar import_player_data = [\n")
}

function terminatePlayerData() {
    fs.appendFileSync('./import_member_data.js', "];");
}

function appendPlayer(member, member_json){
    const trimmed_player = minPlayerData(member, member_json),
          trimmed_player_string = JSON.stringify(trimmed_player);
    fs.appendFileSync('./import_member_data.js', trimmed_player_string + ",\n" );
}


function minPlayerData(member, player_data) {
    const { 
            ally_code,
            level,
            name,
            last_updated,
            character_galactic_power,
            ship_galactic_power,
        } = player_data.data,
        trimmedPlayer = {
            ac : ally_code,
            lvl : level,
            nm : name,
            lu : last_updated, 
            cgp : character_galactic_power,
            sgp : ship_galactic_power,
            ml : member.member_level,
            gjt : member.guild_join_time,
        };

    trimmedPlayer.units = player_data.units.map(({data : {base_id, gear_level, level, rarity, relic_tier, has_ultimate}}) => {
        return {
            id: base_id,
            gl: gear_level,
            l: level,
            rt: relic_tier,
            r: rarity,
            ult: has_ultimate ? 1 : 0
        }
    });
    return trimmedPlayer;
}
