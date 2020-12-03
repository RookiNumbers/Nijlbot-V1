const { timeout } = require('cron')
const update = require('./daily-update.js')

module.exports = async (client,DOW,Days) =>
{
    //console.log('Starting collection...')
    let collected = new Promise((resolve,reject) =>
    {
        client.channels.fetch(process.env.PollChannel).then(channel =>
        {
            //console.log('Channels fetched.')
            channel.messages.fetch().then(messages =>
            {
                //console.log('Messages fetched.')
                let message = Array.from(messages.values()).find(msg => msg.author.bot == true)
                let reactions = message.reactions.cache.values()
                let count = reactions.length
                let members = Array()
                for(reaction of reactions)
                {
                    let day = Array('','monday','tuesday','wednesday','thursday','friday','saturday','sunday').indexOf(reaction.emoji.name)
                    if(day == DOW)
                    {
                        //console.log('Correct day.')
                        reaction.users.fetch().then(users =>
                        {
                            //console.log('Users fetched.')
                            for([ID , user] of users)
                            {
                                if(user.bot == false)
                                {
                                    //console.log('looping...')
                                    members.push(reaction.message.guild.members.cache.get(ID))
                                    Days[day].set(ID,member)
                                }
                            }
                            //console.log('Updating...')
                            update(DOW,Days,day,members).then(() =>
                            {
                                //console.log('Done updating.')
                                resolve('Collected')
                            }).catch(err =>
                                {
                                    reject(err)
                                })
                        })
                    }
                }
            })
        })
    })
    return collected
}