//---------------------------------------------------------------------------INITIALISATION---------------------------------------------------------------------------------------------------


const env = require('dotenv').config()

const cronjob = require('cron').CronJob

const Discord = require('discord.js')

const config = require('./config.json')

const random = require('random')

const { Client } = require('discord.js')

const client = new Discord.Client(
    {
        partials:['MESSAGE', 'REACTION'],
        intents: Discord.Intents.ALL,
    });

const command = require('./commands.js')

const roleClaim = require('./role-claim.js')

const update = require('./daily-update.js')

const collect = require('./collect.js')

var Monday = new Map()
var Tuesday = new Map()
var Wednesday = new Map()
var Thursday = new Map()
var Friday = new Map()
var Saturday = new Map()
var Sunday = new Map()
var Days = [null, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
var DOW = new Date().getDay()
if(DOW == 0){DOW = 7}
var job = new cronjob('0 7 * * *', () =>        //Every 7th hour of every day
{
    console.log(`\n\n\n\n\n\n\n\n\nNew Day! (Day ${DOW} of the week)\n\n\n\n\n\n\n\n\n`)
    if(DOW == 7)
    {
        console.log('Resetting Poll...')
        client.channels.fetch(process.env.PollChannel).then(channel =>
        {
            channel.messages.fetch().then((messages) =>
            {
                let message = messages.first()
                message.reactions.removeAll().then(r =>
                {
                    roleClaim(client)    
                })
                message.channel.send("@everyone").then(msg => 
                {
                    msg.delete().catch(error =>
                    {
                        console.log('Message Already Deleted.')
                    })
                })
            })
        })
    }
    else
    {
        console.log("Updating roles...")
        collect(client,DOW,Days).then(() => {console.log("Done!")}).catch(err => caught = err)
    }
})    

//------------------------------------------------------------------------CLIENT READY--------------------------------------------------------------------------------------------------
client.on('ready', () => 
{
    //Display bot as ready
    console.log('Ready for polling!')
    var DOW = new Date().getDay()
    if(DOW == 0){DOW = 7}

    //Start daily updates
    job.start() 
    client.setMaxListeners(15)

    //---------------------------------------------------------------------------COMMANDS------------------------------------------------------------------------------------------------------


    //Test command for bot response
    command(client, 'ping', (message) =>
    {
        message.channel.send('pong!').then(() =>
        {
            console.log('Done!')
        })
    })

    command(client, 'pong', (message) =>
    {
        message.channel.send('ping!').then(() =>
        {
            console.log('Done!')
        })
    })



    //DM's a list of players for each day
    command(client, 'list', (message) =>
    {
        let poll = client.channels.resolve(process.env.PollChannel).messages.resolve(process.env.PollMsg)
        let rs = poll.reactions.cache.array()
        console.log(rs.length)
        let count = rs.length
        for(r of rs)
        {
            let day = Array('','monday','tuesday','wednesday','thursday','friday','saturday','sunday').indexOf(r.emoji.name)
            console.log("Day of the week:" + day)
            r.users.fetch().then(users =>
            {
                for([ID , user] of users)
                {
                    const member = r.message.guild.members.cache.get(ID)
                    if(user.bot) {return}
                    Days[day].set(ID,member)
                }
            })
        }
        setTimeout(() => 
        {
            let mondarray = Array.from(Days[1].keys())
            let tuesdarray = Array.from(Days[2].keys())
            let wednsdarray = Array.from(Days[3].keys())
            let thursdarray = Array.from(Days[4].keys())
            let fridarray = Array.from(Days[5].keys())
            let saturdarray = Array.from(Days[6].keys())
            let sundarray = Array.from(Days[7].keys())
            message.channel.send(
            `List of players per day \n`+
            `Monday :    (${mondarray.length}) ${mondarray.map(key => client.users.resolve(key).username.replace('_','\\_')).join(', ')}\n`+
            `Tuesday :   (${tuesdarray.length}) ${tuesdarray.map(key => client.users.resolve(key).username.replace('_','\\_')).join(', ')}\n`+
            `Wednesday : (${wednsdarray.length}) ${wednsdarray.map(key => client.users.resolve(key).username.replace('_','\\_')).join(', ')}\n`+
            `Thursday :  (${thursdarray.length}) ${thursdarray.map(key => client.users.resolve(key).username.replace('_','\\_')).join(', ')}\n`+
            `Friday :    (${fridarray.length}) ${fridarray.map(key => client.users.resolve(key).username.replace('_','\\_')).join(', ')}\n`+
            `Saturday :  (${saturdarray.length}) ${saturdarray.map(key => client.users.resolve(key).username.replace('_','\\_')).join(', ')}\n`+
            `Sunday :    (${sundarray.length}) ${sundarray.map(key => client.users.resolve(key).username.replace('_','\\_')).join(', ')}\n`)
            .then(msg =>
                {
                    msg.delete({timeout: 30000})
                })
            .then(() =>
                {
                    message.delete()
                })
            .then(() =>
                {
                    console.log('Done!')
                })
            .catch(error =>
                {
                    console.log('Message Already Deleted.')
                })
        },3000)
    })


    command(client, 'reset', (message) =>
    {
        authorised = false
        var Crewmates = client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.CrewRole).members
        var Admins = client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.AdminRole).members
        if(Admins.find(member => member.id === message.author.id))                                                           //Check if member has Crewmate Role
        {
            authorised = true
        }
        console.log('Resetting Poll...')
        
        client.channels.fetch(process.env.PollChannel).then(channel =>
        {
            let msg = Array.from(channel.messages.cache.values()).find(msg => msg.author.bot == true)
            msg.reactions.removeAll().then(r =>
            {
                roleClaim(client)  
            }).then(() =>
            {
                console.log('Removed Reactions!')
            }).then(() =>
            {
                server = client.guilds.resolve(process.env.ServerID)
                members = server.members.cache.values()
                //console.log(members)
                for(member of members)  
                    {
                        member.roles.add(process.env.ImpoRole)
                        member.roles.remove(process.env.CrewRole)
                    }
                message.delete().catch(error =>
                {
                    console.log('Message Already Deleted.')
                })
            }).then(() =>
            {
                console.log('Done!')
            })
        })
    })



    let timeout = false
    command(client, 'code', async (message) =>
    {
        let channel = message.channel
        if(timeout == true)
        {
            channel.send('<@!'+message.author.id+'>, The "code" command is on timeout to prevent API Abuse.').then(msg =>
            {
            msg.delete({timeout: 10000})
            })
            .catch(err =>
            {
                console.log('Error.')
            }) 
            console.log('Timeout Started...')
            setTimeout(() => 
            {
                timeout = false
                console.log('Timeout Done!')
            }, 10000)
        }
        
        var valid = false
        var auth = false
        var Crewmates = client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.CrewRole).members
        var Admins = client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.AdminRole).members
        if(typeof Crewmates.find(member => member.id == message.author.id) != 'undefined' || typeof Admins.find(member => member.id == message.author.id) != 'undefined')   //Check if member has Crewmate Role
        {
            auth = true
        }
        else
        {
            auth = false
        }
        if(auth == false)
        {
            console.log('No authorisation.')
            channel.send("<@!"+message.author.id+">, You're not authorised to use this command.")
            .then(msg =>
            {
            msg.delete({timeout: 10000})
            })
            .catch(err =>
            {
                console.log('Error.')
            }) 
        }
        let [command, code] = message.content.split(" ")
        //console.log(timeout, auth)
        if(timeout == false && auth == true)
        {
            if(code.length === 6)                                                                                   //Check if valid Code Length
            {
                caps = 'abcdefghijklmnopqrstuvwxyz '
                for(letter of code)
                {
                    if(caps.indexOf(letter.toLowerCase()) != -1)                                                    //Check if valid Code letters
                    {
                        valid = true
                    }
                    if(Number.isInteger(letter))
                    {
                        valid = false
                    }
                }
                if(valid == true)
                {
                    client.channels.resolve(process.env.CodeChannel).setName(`🎮 Code | ${code.toUpperCase()}`).then(() =>        //Set Channel Name 
                    {
                        console.log('Done!')
                    })                
                    timeout = true
                    setTimeout(() => 
                    {
                        timeout = false;
                    }, 600001)
                }
            }
            if(code == 'clear')
            {
                valid = true
                client.channels.resolve(process.env.CodeChannel).setName(`🎮 Code | ------`).then(() =>
                {
                    console.log('Done!')
                })
                timeout = true
                    setTimeout(() => 
                    {
                        timeout = false;
                    }, 300001) 
            } 
            if(valid == false)
            {
                channel.send('<@!'+message.author.id+'>, invalid argument after ".code". Write a 6-letter code or "clear".')
                .then(msg =>
                {
                msg.delete({timeout: 10000})
                })
                .catch(err =>
                {
                    console.log('Error.')
                }) 
            }
        }  
        message.delete().catch(error =>
        {
            console.log('Message Already Deleted.')
        })
    })



    command(client, 'embed', message =>
    {
        auth = false
        var Admins = client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.AdminRole).members
        if(typeof Admins.find(member => member.id == message.author.id) != 'undefined')
        auth = Admins.find(member => member.id === message.author.id)
        let [command, ...text] = message.content.split(' ')
        let embed = new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setColor('#c10000')
            //.setFooter(`${message.author.username} sus...`)
            .setDescription(`**${text.join(' ')}**`)
        message.channel.send(embed).then(() =>
        {
            console.log('Done!')
        })
        message.delete().catch(error =>
        {
            console.log('Message Already Deleted.')
        })
    })



    command(client, 'update', (message) =>
    {
        var Crewmates = client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.CrewRole).members
        const server = client.guilds.resolve(process.env.ServerID)
        const members = server.members.cache.values()
        //console.log(members)
        for(member of members)  
        {
            if(typeof Crewmates.find(m => m.id == member.id) != 'undefined')
            {
                member.roles.add(process.env.ImpoRole)
                member.roles.remove(process.env.CrewRole)
            }
        }
        console.log("Day of the week:" + DOW)
        collect(client,DOW,Days).then(() =>
        {
            console.log('Done!')
        }) 
        message.delete().catch(error =>
        {
            console.log('Message Already Deleted.')
        })
    })

    command(client, 'clear', message =>
    {
        var amount = 0
        async function clearChannel(channel, n = 0, old = false) 
        {
            let collected = await channel.messages.fetch();
            if (collected.size > 0) 
            {
              if (old) 
              {
                for (let msg of collected.array()) 
                {
                    try
                    {
                        await msg.delete();
                        n++;
                    }
                    catch (error)
                    {
                        console.log('Error deleting old message.')
                    }
                }
              } 
              else 
              {
                try
                {
                    let deleted = await channel.bulkDelete(100, true);
                    if (deleted.size < collected.size) old = true;
                    n += deleted.size;
                }
                catch (error)
                {
                    console.log('Error bulk-deleting.')
                }
              }
              console.log(n)
              return n + await clearChannel(channel, old);
            } 
            else return 0;
        }

        let [command, ...args] = message.content.split(' ')
        args = args[0]
        if(Number.isInteger(Number(args)))
        {
            console.log('Number argument.')
            var count = Number(args) + 1
            var remainder = count%100
            var times = (count - remainder)/100
            console.log(`Deleting 100 messages ${times} times.`)
            for(let i = 0; i<times; i++)
            {  
                console.log('Deleting 100...')
                message.channel.messages.fetch({limit: 100})
                .then(async messages => 
                {
                await message.channel.bulkDelete(messages)
                done = messages.array().length
                amount += done;
                })
                .catch(err => 
                {
                    console.log('error.')
                    console.log(err)
                });
            }
            if(remainder)
            {
                console.log('Deleting remainder.')
                message.channel.messages.fetch({limit: remainder})
                .then(async messages => 
                {
                await message.channel.bulkDelete(messages)
                done = messages.array().length
                amount += done;
                console.log(`New amount: ${amount}`)
                })
                .catch(err => 
                {
                    console.log('error.')
                    console.log(err)
                })
            }
            setTimeout(() =>
            {
                console.log(`Total number of messages deleted: ${amount-1}`)
                message.channel.send(`Total number of messages deleted: ${amount-1}`).then(msg =>
                {
                msg.delete({timeout: 5000})
                }).then(() =>
                {
                    console.log('Done!')
                }).catch(err =>
                    {
                        console.log('Error.')
                    }) 
            },1000)
            
        }
        if(typeof args == 'undefined' || args == 'all')
        {
            console.log('No argument, or argument "all".')
            try
            {
                clearChannel(message.channel).then(num => 
                {
                    console.log(`Total number of messages deleted: ${num}`)
                    message.channel.send(`Total number of messages deleted: ${num}`).then(msg =>
                    {
                    msg.delete({timeout: 5000})
                    }).then(() =>
                    {
                        console.log('Done!')
                    }).catch(err =>
                        {
                            console.log('Error.')
                        }) 
                })
            }
            catch (error)
            {
                console.log('Error starting clearChannel function.')
            }
        }
        if(typeof args != 'undefined' && args != 'all' && Number.isNaN(Number(args)))
        {
            message.channel.send('Invalid argument provided.').then(msg =>
            {
                msg.delete({timeout: 5000})
            })
            .catch(err =>
            {
                console.log('Error.')
            }) 
        }
    })


    const WriteSlow = (letters,msg) =>
        {
            let add = ''
            if(letters[0] == " ")
            {
                add = " ** ** "
            }
            else
            {
                add = letters[0]
            }
            msg.edit((msg.content + add).replace('******',"")).then(() =>
            {
                letters.shift()
                if(letters.length > 0)
                {
                    setTimeout(() => WriteSlow(letters, msg), 1001)    
                }
            })
        }
    
    command(client, 'slow', message =>
    {
        let letters = new String(message.content.substring(5)).split('')
        let msg = '** ** '
        message.channel.send(msg).then(msg =>
            {
                letters.shift()
                WriteSlow(letters,msg)    
            }
            
        )
        message.delete().catch(error =>
        {
            console.log('Message Already Deleted.')
        })
    })

    command(client, 'sus', message =>
    {
        var chosen = undefined
        let [command, ...text] = message.content.split(' ')
        text = text[0]
        let Crew = new Map()
        var Crewmates = Array.from(client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.CrewRole).members.values())
        var Crewnames = Crewmates.map(crewmate => crewmate.user.username)
        for(i=0;i < Crewmates.length;i++)
        {
            Crew.set(Crewnames[i], Crewmates[i])
        }
        const members = Array.from(client.guilds.resolve(process.env.ServerID).members.cache.values())
        if(typeof text != 'undefined')
        {
            var name = Crewnames.find(function (element)
                {
                    return (element.toLowerCase() == text.toLowerCase())
                })
            chosen = Crew.get(name)
            if(typeof chosen == 'undefined'){message.channel.send('No crewmate named '+text+'. Selecting Random...')}
            chosen = members[random.int(min = 0, max = members.length)]
            console.log(chosen.user.username)
        }
        if(typeof text == 'undefined' || typeof chosen == 'undefined')
        {
            chosen = members[random.int(min = 0, max = members.length)]
            console.log(chosen.user.username)
        }
        if(Crewmates.find(function (mate){return (chosen == mate)}))
        {
            let noimpo = ' 　。　　•　ﾟ　。　　.　。 　•　　ﾟ　　 Ejecting '+ chosen.user.username + '...　 。　. ﾟ　. ,　  .\n. 　。　　•　ﾟ　。　　 。　 ඞ 。 . 　　•　　ﾟ　　 ' +chosen.user.username+' was not An Impostor.　 。　. ´    。　ﾟ　.　. ,　.　 .'
            let letters = noimpo.split('')
            message.channel.send('.').then(msg =>
            {
                letters.shift()
                WriteSlow(letters,msg)
            })
        }
        else
        {
            let impo =   ' 　。　　•　ﾟ　。　　.　。 　•　　ﾟ　　 Ejecting '+ chosen.user.username + '...　 。　. ﾟ　. ,　  .\n. 　。　　•　ﾟ　。　　 。　 ඞ 。 . 　　•　　ﾟ　　 ' +chosen.user.username+' was An Impostor.　 。　. ´    。　ﾟ　.　. ,　.　 .'
            let letters = impo.split('')
            message.channel.send('.').then(msg =>
            {
                letters.shift()
                WriteSlow(letters,msg)
            })
        }
        message.delete().catch(error =>
        {
            console.log('Message Already Deleted.')
        })
    })

    //. 　。　　•　ﾟ　。　　.　。 。　. 　.　 。　 ඞ 。 . 　　 • 　　•　　ﾟ　　 vul naam in was not An Impostor.　 。　. '    。　ﾟ　.　. ,　.　 .
    command(client, 'help', message =>
    {
        client.channels.resolve(process.env.HelpChannel).send('<@!'+message.author.id+'>')
        let embed = new Discord.MessageEmbed()
            .setTitle('Hey ' + message.author.username + '! This should help you figure out how to command the '+ client.guilds.resolve(process.env.ServerID).members.resolve(process.env.BotID).user.username +'!\n\nThese are the existing commands:')
            .setColor('#c10000')
            .setFooter(message.author.username + ' kinda sus...')
            .addFields(
                {name: '.ping',             value: 'Useable in any channel, '+                                                              'by anyone.'+'Basic ping-pong command to check bot response.'},
                {name: '.list',             value: 'Useable in any channel, '+                                                              'by anyone.'+'Sends you a DM with a list of all players per day, who want to play.'},
                {name: '.reset',            value: 'Useable in the '+ client.channels.resolve(process.env.PollChannel).toString()+' channel, by '+ client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.AdminRole).toString() +'. '    +'\nResets the poll and makes everybody an Impostor. (Use in case of Reaction Order mismatch.)'},
                {name: '.code XXXXXX',      value: 'Useable in any channel, '+                                                              'by '+ client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.CrewRole).toString() +'. '     +'Sets the game-code text channel to the game code. \nWrite ".code clear" to clear the code.'},
                {name: '.embed "message"',  value: 'Useable in any channel, '+                                                              'by '+ client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.AdminRole).toString() +'. '    +'Embeds the sent message.'},
                {name: '.update',           value: 'Useable in the '+ client.channels.resolve(process.env.PollChannel).toString()+' channel, by '+ client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.CrewRole).toString() +'. '     +'Updates the Roles. Use in case of Poll mismatch.'},
                {name: '.clear n',            value: 'Useable in any channel, '+                                                            'by '+ client.guilds.resolve(process.env.ServerID).roles.resolve(process.env.AdminRole).toString() +'. '    +'Clears "n" messages in that Channel.'}
            )
        client.channels.resolve(process.env.HelpChannel).send(embed)
        message.delete().catch(error =>
        {
            console.log('Message Already Deleted.')
        })
    })

    //Creates/edits poll
    roleClaim(client)
})

//--------------------------------------------------------------------------------REACTION EVENT---------------------------------------------------------------------------------------

client.on('messageReactionAdd', async function(reaction, user)
{
    if(reaction.message.partial) await reaction.message.fetch()
    if(user.bot){return}
    //console.log(reaction.message.id == process.env.PollMsg)
    if (reaction.message.id == process.env.PollMsg)
    {
        
        const member = reaction.message.guild.members.cache.get(user.id)
        var ID = user.id
        let day = Array('','monday','tuesday','wednesday','thursday','friday','saturday','sunday').indexOf(reaction.emoji.name)
        //console.log(day)
        if(day != -1)
        {
            Days[day].set(ID,member)
            //console.log(typeof Days[day])
            update(DOW,Days,day,[member]).catch(err => caught = err)
        }
    }
});

client.on('messageReactionRemove', async function(reaction, user)
{
    if(reaction.message.partial) await reaction.message.fetch()
    if(user.bot){return}
    //console.log(reaction.message.id == process.env.PollMsg)
    if (reaction.message.id == process.env.PollMsg)
    {
        const member = reaction.message.guild.members.cache.get(user.id)
        var ID = user.id
        let day = Array('','monday','tuesday','wednesday','thursday','friday','saturday','sunday').indexOf(reaction.emoji.name)
        if(day != -1)
        {
            Days[day].delete(ID) 
            update(DOW,Days,day,[member]).catch(err => caught = err)
        }
    }
});

client.on('message', function(message,user)
{
    if(message.channel == client.channels.resolve(process.env.PollChannel))
    {
        if(message.id != Array.from(message.channel.messages.cache.values()).find(msg => msg.author.bot == true).id)
        {
            try
            {
                message.delete()
            }
            catch(error)
            {
                console.log('Message Already Deleted.')
            }
        } 
    }
})
//-----------------------------------------------------------------------------------JOINED-------------------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------LOGIN-------------------------------------------------------------------------------------------------------------
client.login(process.env.BotToken)
