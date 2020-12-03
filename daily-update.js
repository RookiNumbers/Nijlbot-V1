const { Collector } = require("discord.js")
const env = require('dotenv').config()

module.exports  = (DOW,Days,day,members) =>
{
    let updated = new Promise((resolve,reject) =>
    {
        if(day == DOW)
        {
            var Crew = process.env.CrewRole                                                         //Crewmates Role ID
            var Impo = process.env.ImpoRole                                                         //Impostors Role ID  
            //console.log(members)
            for(member of members)
            {
                //console.log(member)
                var keys = Array.from(Days[DOW].keys())
                //console.log(`ID's for day ${DOW} :${keys}`)                                       //ID of every member that has to be Crewmate
                if(keys.includes(member.id))                                                        //ID of every member that is in the Server that has to be Crewmate
                {
                    console.log(`Making ${member.user.username} a Crewmate...`)
                    member.roles.add(Crew)
                    member.roles.remove(Impo)
                }
                else                                                                                    
                {
                    console.log(`Making ${member.user.username} an Impostor...`)
                    member.roles.add(Impo)
                    member.roles.remove(Crew)
                }
            }
            //console.log('Done collecting.')
            resolve('Collected.')
        }
        else
        {
            reject('Reaction on different day.')
        }
    })
    return updated
}
