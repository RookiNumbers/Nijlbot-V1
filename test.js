const Discord = require('discord.js');
const config = require('./config.json')
const { Client } = require('discord.js');
const client = new Discord.Client(
    {
        "partials":['CHANNEL','MESSAGE', 'REACTION']
    });