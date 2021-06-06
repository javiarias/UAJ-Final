const MongoJS = require('./MongoJS/mongoJS.js');
var fs = require('fs');

const USE_CUSTOM_URI = true;
const URI_PATH = './uri.uri';

//import express from 'express';
const Express = require('express');
var cors = require('cors')
const server = Express();
server.use(Express.json())
server.use(cors())
const port = 25565;

server.set("view engine", "ejs");

server.listen(port, startup);

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

async function startup()
{
  if(USE_CUSTOM_URI)
  {
    try {
      var uri = fs.readFileSync(URI_PATH, 'utf8');
      MongoJS.init(uri);
    } catch (error)
    {    
      console.log(error);
    }
  }
}

var currentPlayer = {};
var currentRanking = [];

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

  if(id === undefined || isNaN(id))
  {
    if(nick === undefined) return res.status(400).send({message: "Petición inválida, no se ha enviado ningún dato"});

    else
    {
      try
      {
        currentPlayer = await MongoJS.findPlayerSafe({ nick: nick });
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
      currentPlayer = await MongoJS.findPlayerSafe({ id: id });
    }
    catch (error)
    {
      return res.status(502).send({message: "Base de datos no acepta conexión"});
    }
  }

  if (currentPlayer === null) return res.status(404).send({message: "No se ha encontrado jugador"});

  return res.send({currentPlayer});
}
//by-id y by-nick inspirado en RIOT: https://developer.riotgames.com/apis#account-v1/GET_getByPuuid
server.get('/accounts/by-id/:id', getInfo);
server.get('/accounts/by-nick/:nick', getInfo);

//"/accounts/top/?amount=int&bottom=bool&skip=int"
async function getRankings(req, res)
{
  var amount = req.query.amount === undefined ? 0 : parseInt(req.query.amount);
  var bottom = req.query.bottom === undefined ? false : (req.query.bottom == "true");
  var skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip);

  var userCount = 0;

  try
  {
    currentRanking = await MongoJS.getPlayerRankings(amount, skip, bottom);
    userCount = await MongoJS.getUserCount();
  }
  catch (error)
  {
    return res.status(502).send({message: "Base de datos no acepta conexión"});
  }

  //return res.send({poggers: "poggers"});
  return res.send({currentRanking, userCount});
}
server.get('/accounts/top', getRankings);

//"/accounts/data"
async function getData(req, res)
{
  try
  {
    data = await MongoJS.getData();
  }
  catch (error)
  {
    return res.status(502).send({message: "Base de datos no acepta conexión"});
  }

  //return res.send({poggers: "poggers"});
  return res.send({data});
}
server.get('/accounts/data', getData);
