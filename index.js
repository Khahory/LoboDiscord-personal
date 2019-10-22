
// Load up the discord.js library
const Discord = require("discord.js");
const RolServer = require('./models/Rol');

const client = new Discord.Client();

const config = require("./config.json");

// Banderas para controlar los usuarios
let juego_on = false;
let preparacion_on = false;

//  Arreglos del servidor
let jugadores = new Set();
let lobos = new Set();
let aldeanos = new Set();
let reyes = new Set();

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});




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


  // Los comandos de mi BOT
  if (command === 'play') {
    if (!preparacion_on) {
      preparacion_on = true;

      //  Asignar un Rol que ya esta definido por el Admin del servidor
      let miembro = message.member;
      let rolJugador = message.member.roles.find('name', 'BotLobo');
      let rolLider = message.member.roles.find('name', 'Anfitrion');

      if (rolJugador && !rolLider) {
        //Asignar rol Anfitrion
        let memberRole = message.guild.roles.find('name', 'Anfitrion');
        let memberJugador = message.guild.roles.find('name', 'Jugador');

        await message.member.addRoles([memberRole, memberJugador]).then(() => {
          message.channel.send(`${miembro.user} eres un ${memberRole.name}`);
          jugadores.add(message.member.user);
        });

      }else {
        message.channel.send(`Ya eres anfitrion, escuchaste ${miembro.user} ?`);
      }
      message.delete().catch(O_o=>{});

    } else return message.channel.send('Ya hay una preparacion activa');

    //`Timer
    let myTime = setInterval(myTimer, 500000);
    function myTimer() {  //  Se ejecuta cuando se acaba el tiempo
      myStopFunction();
      message.channel.send('Oh oh, se acabo el tiempo de iniciar el juego');
      resetTodo();
    }

    function myStopFunction() {
      clearInterval(myTime);
    }

  }

  //  Mostrat a todos los jugadores activos con el rol
  if (command === 'mos') {
    jugadores.forEach((value, index, array) => {
      message.channel.send('Jugadores activos: ' +value);
    });

    message.channel.send('------------Ahora mostraremos las lista de los roles---------------');
    message.channel.send('Tuumm tumm tummm, taran!!');

    message.channel.send('Los **Lobos** son :');
    lobos.forEach((value, value2, set) => {
        message.channel.send('Lobo: ' +value);
    });

    message.channel.send('Los **Aldenaos** son :');
    aldeanos.forEach((value, value2, set) => {
        message.channel.send('Aldeano: ' +value);
    });

  }

  //  Agregar a los jugadores a la lista y asignarles e rol Jugador
  if (command === 'join') {
    if (preparacion_on) {

      if (jugadores.has(message.member.user)) {
        return message.channel.send('Eehh, dime? ya estas dentro')
      } else {
        let memberJugador = message.guild.roles.find('name', 'Jugador');
        if (!memberJugador) return message.channel.send('No se encontro el rol **Jugador** en el server');

        await message.member.addRole(memberJugador).then(() => {
          // message.author.send(`${message.member.user} eres un ${memberJugador.name}`);
        });

        jugadores.add(message.member.user);
        return message.channel.send('¡Te has unido!')
      }

    } else {
      message.channel.send('Nadie ha iniciado una preparacion del juego')
    }
  }

  if (command === 'start') {
    message.channel.send(jugadores.size.toString());
    if (jugadores.size >= 1 && !juego_on) {

      //  Obteniendo el rol anfitrion y un objeto miembro
      let rolLider = message.member.roles.find('name', 'Anfitrion');
      let miembro = message.member;

      //  Asignar los roles random
      if (rolLider) {
        juego_on = true;

        await asignarPersonajes();

      } else {
        message.channel.send(`No eres el **Anfitrion** ${miembro.user}`);
      }
    } else { message.channel.send('Ya hay una partida iniciada o no hay jugadores suficientes (minimo 4)')}
  }


  //  Resetea rodito pa poder iniciar un juego de nuevo
  if (command === 'reset') {
    await removerRolesVariables();
  }



  async function resetTodo() {
    await removerRolesVariables();
  }

  // Busca y eliminas a los usuarios con rol Anfitrion y Jugador
  async function removerRolesVariables() {
    {
      let miembro = message.member;

      let rolAnfitrion = message.guild.roles.find("name", 'Anfitrion');
      let rolJugador = message.guild.roles.find("name", 'Jugador');
      let miembroroles = message.guild.roles.get(rolJugador.id).members;

      message.channel.send(`Tienes a **${miembroroles.size}** miembro(s) con el rol **Anfitrion**.`);

      miembroroles.forEach((value, key, map) => {
        value.removeRole(rolAnfitrion).catch(reason => console.log('Error al eliminar rol (seguro no existe en el usuario) '));
        value.removeRole(rolJugador).catch(reason => console.log('Error al eliminar rol (seguro no existe en el usuario)'));
      });

      //  Resetea las variables de la aplicacion
      message.channel.send('Todo se fue al carajo (Variables)');
      preparacion_on = false;
      juego_on = false;
      jugadores = new Set();
      lobos = new Set();
      aldeanos = new Set();
    }
  }

  //  Llenar los arreglos de los personajes
  async function asignarPersonajes() {
      {
          let limiteJugadores;
          const gente = [];

          jugadores.forEach((value, value2) => {
              gente.push(value);
          });

          jugadores.forEach((value, key, map) => {
              limiteJugadores = gente.length;
              let numRandom = Math.floor(Math.random() * limiteJugadores);

              if (lobos.size < 1) {
                  lobos.add(gente[numRandom]);
                  gente.splice(numRandom, 1);
                  return;
              }

              if (aldeanos.size < 5) {
                  aldeanos.add(gente[numRandom]);
                  gente.splice(numRandom, 1);
              }

          });

          //  Enviar DM a los que tienen roles
          await enviarAvisosPersonajes();
          await nocheExe();
      }
  }

    //  Enviar DM a los que tienen roles
  async function enviarAvisosPersonajes() {
      {
          for (let item of lobos) {
              item.send('Eres un Lobo: ' +item);
          }

          for (let item of aldeanos) {
              item.send('Eres un Aldeano: ' +item);
          }
      }
  }

  //    Accion que pasa en la noche
    async function nocheExe() {
        {
            if (lobos) {
                for (let item of lobos) {
                    item.send('Es de noche, que comeremos hoy ?');
                    await queHacerLobo();
                }
            }else {message.channel.send('No hay lobos - nocheExe()')}

            if (aldeanos) {
                for (let item of aldeanos) {
                    item.send('Es de noche, suerme bien...por ahora');
                }
            }else {message.channel.send('No hay aldeanos - nocheExe()')}
        }
    }

  //    Lobo que hacer .exe
  async function queHacerLobo() {
      {
          let contador = 0;

          for (let item of lobos) {
              item.send('Puedes comerte a una estas personas mmm riko');
              for (let item2 of aldeanos) {
                  item.send('Esta: ' +item2 +' en: ' +contador);
                  contador++;
              }
          }
      }
  }




















  // if(command === 'rol'){
  //
  //   //  Asignar un Rol que ya esta definido por el Admin del servidor
  //   let miembro = message.member;
  //   if (message.member.roles.find('name', 'BotLobo')) {
  //     let memberRole = message.guild.roles.find('name', RolServer.RolServer[Math.floor(Math.random() * 4)]);
  //     await message.member.addRole(memberRole).then(() => {
  //       message.author.send(`${miembro.user} eres un ${memberRole.name}`);
  //     });
  //   }else {
  //     message.channel.send(`Debes ser un BotLobo, escuchaste ${miembro.user} ?`);
  //   }
  //   message.delete().catch(O_o=>{});
  // }


  //  El bot responde los menjaes privados
  if (message.channel.type === "dm") {
    message.author.send("You are DMing me now! = Khahory .dm");
    return;
  }

  if (command === "avatar") {
    // await message.reply(message.author.avatarURL);

    // const id = args.join(" ");
    // const random =Math.floor(Math.random() * 100);
    // message.guild.createRole({ name: random.toString(), color: "BLUE"}).then(() =>
    //     client.users.get("454692686662991873")
    //         .send(`He archivo la id del rol ${random}, bajo la razón de ${id}`));

    let miembro = message.mentions.members.first();
    let nombrerol = args.slice(1).join(' ');

    let role = message.guild.roles.find("name", nombrerol);
    let perms = message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS");

    if(!perms) return message.channel.send("`Error` `|` No tienes Permisos para usar este comando.");

    if(message.mentions.users.size < 1) return message.reply('Debe mencionar a un miembro.').catch(console.error);
    if(!nombrerol) return message.channel.send('Escriba el nombre del rol a agregar, `-addrol @username [rol]`');
    if(!role) return message.channel.send('Rol no encontrado en el servidor.');

    miembro.addRole(role).catch(console.error);
    message.channel.send(`El rol **${role.name}** fue agregado correctamente a **${miembro.user.username}**.`);

    // await message.guild.createRole({
    //   name: "Mio",
    //   color: "AQUA"
    // }, message.author.send('Me gusta'));
  }

  if(command === "ping") {
    // channel.send('hello!')
    //     .then(message => console.log(`Sent message: ${message.content}`))
    //     .catch(console.error);

    // message.author.send("Hola");
    //  const ok = new Discord.DMChannel(client, "nani");


    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{});
    // And we get the bot to say the thing:
    message.channel.send('sayMessage');
  }
  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Admin"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
  if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.
    
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});

client.login(config.token);
