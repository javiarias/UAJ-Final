const MongoJS = require('./MongoJS/mongoJS.js');

//import express from 'express';
const Express = require('express');
var cors = require('cors')
const server = Express();
server.use(Express.json())
server.use(cors())
const port = 25565;

server.set("view engine", "ejs");

server.listen(port);

var liveServer = require("live-server");
 
var params = {
    port: port + 1, // Set the server port. Defaults to 8080.
    host: "localhost", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: ".", // Set root directory that's being served. Defaults to cwd.
    open: true, // When false, it won't load your browser by default.
    ignore: 'scss,my/templates', // comma-separated string for paths to ignore
    file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    mount: [['/components', './node_modules']], // Mount a directory to a route.
    logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
    middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
};

liveServer.start(params);

var currentPlayer = {};

var pageSize = 15;

var page = 1;

function pog()
{
  page++;
  console.log(page);
}

async function getInfo(req, res)
{
  var id = parseInt(req.params.id);
  var nick = req.params.nick;

  var player;

  if(id === undefined || isNaN(id))
  {
    if(nick === undefined) return res.status(400).send({message: "Petición inválida, no se ha enviado ningún dato"});

    else
    {
      try
      {
        currentPlayer = await MongoJS.findPlayerByLogin({ nick: nick });
      }
      catch (error)
      {
        return res.status(502).send({message: "Base de datos no acepta conexión"});
      }
    }
  }
  else
  {
    try
    {
      currentPlayer = await MongoJS.findPlayerByLogin({ id: id });
    }
    catch (error)
    {
      return res.status(502).send({message: "Base de datos no acepta conexión"});
    }
  }

  if (currentPlayer === null) return res.status(404).send({message: "No se ha encontrado jugador"});

  currentHistory = currentPlayer.history.concat(currentPlayer.pending);

  //return res.send({poggers: "poggers"});
  return res.send({currentPlayer, currentHistory});
}
//by-id y by-nick inspirado en RIOT: https://developer.riotgames.com/apis#account-v1/GET_getByPuuid
server.get('/accounts/by-id/:id', getInfo);
server.get('/accounts/by-nick/:nick', getInfo);
