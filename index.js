
// Load up the discord.js library
const Discord = require("discord.js");
const RolServer = require('./models/Rol');

const client = new Discord.Client();

const config = require("./config.json");

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

//Constantes de la app
const comandos = [
  {
    comando : 'play',
    accion : 'Iniciar una preparacion del juego'
  },
  {
    comando: 'join',
    accion: 'Las personas se unen a la lista de la preparacion'
  },
  {
    comando: 'estado',
    accion: 'Muestra como esta la situacion del juego (solo desarrollo)'
  },
  {
    comando: 'start',
    accion: 'Que inicia el juego. asigna los roles a las personas preparadas'
  },
  {
    comando: 'dev',
    accion: 'Para probar funciones rapidas en el desarrollo'
  }
];
const ROLES = [
  {
    rol: 'Lobo',
    cantidad: 1
  },
  {
    rol: 'Aldeano',
    cantidad: 2
  }
];
const JUGADORES_PREPARADOS = new Set();
const JUGADORES_JUGANDO = new Set();


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();


  if (command === 'play') {
    JUGADORES_PREPARADOS.add(message.member);
    message.channel.send(message.member.id.toString());
  }

  if (command === 'join') {
    //Validar si ya esta dentro de la lista
    if (JUGADORES_PREPARADOS.has(message.member)) {
      message.channel.send('Ya estas dentro de la preparacion');
    } else {
      JUGADORES_PREPARADOS.add(message.member);
      message.channel.send('Agregado: ' +message.member.id.toString());
    }
  }

  if (command === 'start') {
    ROLES.forEach(value => {
    //  Asignar roles
      JUGADORES_PREPARADOS.forEach(value => {
        let rand = getRandomInt(2); // Cantidad de roles maxima


      });
    });
  }

  if (command === 'estado') {
    message.channel.send('Estos son los JUGADORES_PREPARADOS: ');
    JUGADORES_PREPARADOS.forEach((value) => {
      message.channel.send(value.user.toString());
      message.channel.send(value.id);
    });
    message.channel.send('Estos son los JUGADORES_PREPARADOS --- fin');
    message.channel.send('--');
    message.channel.send('Estos son los JUGADORES_JUGANDO: ');
    JUGADORES_JUGANDO.forEach((value) => {
      message.channel.send(value['jugador'].user.toString());
      message.channel.send(value['rol']);
    });
    message.channel.send('Estos son los JUGADORES_JUGANDO --- fin');
  }

  if (command === 'dev'){
    message.author.send('Esto es un DM');
  }

});

//Funciones
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

client.login(config.token);
