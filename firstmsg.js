module.exports = async (client) =>
{
    const channel = await client.channels.fetch('771164503610097705')
            
    channel.messages.fetch().then((messages) =>
        {
            for (const message of messages)
            {
                return message
            }
        })
}