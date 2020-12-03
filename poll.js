const addReactions = (message, reactions) =>
{
    message.react(reactions[0])
    reactions.shift()
    if (reactions.length > 0)
    {
        setTimeout(() => addReactions(message, reactions), 750)
    }
}

module.exports = (client, id, text, reactions = []) =>
{
    client.channels.fetch(id).then(channel =>
    {
        channel.messages.fetch().then((messages) =>
        {
            if (messages.size === 0) 
            {
                channel.send(text).then(message =>
                {
                    addReactions(message, reactions)
                })
            }
            for(msg of messages.values())
            {
                if(msg.author.bot == false)
                {
                    msg.delete()
                }
                else
                {
                    msg.edit(text)
                    addReactions(msg, reactions)
                }
            }
        })
    }).catch(err => caught = err)
}
