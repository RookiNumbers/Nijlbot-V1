const env = require('dotenv').config()

const poll = require('./poll.js')

module.exports = client =>
{
    const channelID = process.env.PollChannel

    const getEmoji = key => client.emojis.cache.find(emoji => emoji.name === key)

    const Emojis = 
    {
        monday: "Red",
        tuesday: "Orange",
        wednesday: "Yellow",
        thursday: "Green",
        friday: "Blue",
        saturday: "Purple",
        sunday: "White"
    }

    const reactions = []

    for (const key in Emojis) 
    {
        const emoji = getEmoji(key)
        reactions.push(emoji)
    }

    text = 'Hey @everyone!\n'
    + '\nDit is de wekelijkse poll.' 
    + '\nJe kan hier stemmen op de dagen die je kan spelen, en de *NijlBot* doet de rest!' 
    + '\nLinksboven bij de "**<#776850922185031710>**" onder "\🔵 **Crewmates:**" zie je dan elke dag hoeveel mensen er kunnen spelen!'
    + '\n_ _'

    poll(client, channelID, text, reactions)
}
 