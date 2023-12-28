const express = require('express')
const dotenv = require('dotenv').config()
const promBundle = require("express-prom-bundle");
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bodyParser = require('body-parser')
const cors = require('cors')
const db = require('./db.js')
const app = express()
var expressWs = require('express-ws')(app);
const { Telegraf } = require('telegraf')
app.use(cors())
app.use(bodyParser.json())
const port = process.env.PORT || 3000
const masterpassword = process.env.MASTER_PASSWORD || '1Strong_Password@'
const bot = new Telegraf(process.env.BOT_TOKEN)
app.use(express.static("public"))

const metricsMiddleware = promBundle({
    includeMethod: true, 
    includePath: true, 
    includeStatusCode: true, 
    includeUp: true,
    promClient: {
        collectDefaultMetrics: {
        }
      }
});
app.use(metricsMiddleware)



app.get('/', (req, res) => {
  res.redirect('/dashboard.html')
})

function preventXSS(body) {
  for (var key in body) {
    if (typeof body[key] === 'string') {
      body[key] = body[key].replace(/</g, ".").replace(/>/g, ".")
    }
  }
  return body
}

bot.command('addChannel', async (ctx) => {
  console.log(ctx.message.chat.id.toString())
  try {
    await db.telegramId.create({telegramId : ctx.message.chat.id.toString()})
  } catch (e) {
    console.log(e)
    ctx.reply("DB error")
    return
  }
  if (ctx.message.chat.type == "private") {
    ctx.reply("You have been added to the list of authorized users")
  } else {
    ctx.reply("This chat has been added to the list of authorized chats")
  }
})

bot.command('removeChannel', (ctx) => {
  console.log(ctx.message.chat.id)
  try {
      db.telegramId.destroy({where : {telegramId : ctx.message.chat.id.toString()}})
  } catch (e) {
      console.log(e)
      ctx.reply("DB error")
      return
  }
  if (ctx.message.chat.type == "private") {
    ctx.reply("You have been removed from the list of authorized users")
  } else {
    ctx.reply("This chat has been removed from the list of authorized chats")
  }
})

app.get("/resetCodes/:masterpassword/:n", async (req, res) => {
    if (req.params.masterpassword != masterpassword) {
        res.status(401).json({error : "Unauthorized, invalid master password", code : 401})
    } else {
        try {
            await db.passkey.destroy({where : {}, truncate : true})
            for (i = 0; i < new Number(req.params.n); i++) {
              await db.passkey.create({passkey : crypto.randomBytes(8).toString('hex').slice(0, 8), hasBeenUsed: false})  
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({error : "Internal server error", code : 500})
        }
        res.status(200).json({message : "Passkeys generated", code : 200, n : req.params.n})
    }
})

app.get("/getCodes/:masterpassword", async (req, res) => {
  if (req.params.masterpassword != masterpassword) {
      res.status(401).json({error : "Unauthorized, invalid master password", code : 401})
  } else {
      try {
        json = await db.passkey.findAll()
        res.status(200).json(json)
      } catch(e) {
        console.log(e)
        res.status(500).json({error : "Internal server error", code : 500})
      }
  }
})

app.post("/sendMessage", async (req, res) => {
  if (req.body.token.length == 0 || req.body.token == "") {
    res.status(400).json({error : "Bad request, token not provided", code : 400})
    return
  }
  if (req.body.message.length == 0 || req.body.message == "") {
    res.status(400).json({error : "Bad request, message not provided", code : 400})
    return
  }
  if (req.body.title.length == 0 || req.body.title == "") {
    res.status(400).json({error : "Bad request, title not provided", code : 400})
    return
  }
  if (req.body.prior.length == 0 || req.body.prior == "") {
    res.status(400).json({error : "Bad request, prior not provided", code : 400})
    return
  }
  try {
    jwt.verify(req.body.token, process.env.JWT_SECRET)
  } catch (e) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  req.body = preventXSS(req.body)
  var timenow = new Date().getTime().toString()
  db.message.create({time: timenow ,message : req.body.message, title : req.body.title, prior : req.body.prior, useremail : jwt.decode(req.body.token).email})
  res.status(200).json({message : "Message created", code : 200})
  var telegramIds = await db.telegramId.findAll()
  for (var i = 0; i < telegramIds.length; i++) {
    console.log(telegramIds[i].dataValues.telegramId)
    bot.telegram.sendMessage(new Number (telegramIds[i].dataValues.telegramId), timenow + "\nNew message from\n" + jwt.decode(req.body.token).email + "\n [Title]: " + req.body.title + " [Priority]: " + req.body.prior + "\n[Message]:\n" + req.body.message.replace("\n", ""))
  }
  return
})

bot.on('reply_to_message', (ctx) => {
  var timeid = ctx.message.reply_to_message.text.split("\n")[0]
  if (new Number(timeid) > 0) {
    db.message.update({answer : ctx.message.text}, {where : {time : timeid}})
    ctx.reply("Sync ok!")
    return
  } else {
    ctx.reply("Invalid time id")
    return
  }
})

app.post("/getMessages", async (req, res) => {
  if (req.body.token.length == 0 || req.body.token == "") {
    res.status(400).json({error : "Bad request, token not provided", code : 400})
    return
  }
  try {
    jwt.verify(req.body.token, process.env.JWT_SECRET)
  } catch (e) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  db.message.findAll({where : {useremail : jwt.decode(req.body.token).email}}).then((messages) => {
    res.status(200).json(messages)
  })
})

app.post("/register", async (req, res) => {
  if (req.body.passkey == null) {
    res.status(400).json({error : "Bad request, passkey not provided", code : 400})
    return
  }
  validKeys = await db.passkey.findOne({where : {passkey : req.body.passkey}})
  if (validKeys == null) {
    res.status(401).json({error : "Unauthorized, invalid passkey", code : 401})
    return
  }
  if (validKeys.dataValues.hasBeenUsed == true) {
    res.status(401).json({error : "Unauthorized, passkey has been already used", code : 401})
    return
  }
  console.log(req.body)
  if (req.body.name.length == 0 || req.body.name == "") {
    res.status(400).json({error : "Bad request, name property not provided", code : 400})
    return
  }
  if (req.body.email.length == 0 || req.body.email == "") {
    res.status(400).json({error : "Bad request, email property not provided", code : 400})
    return
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email) == false) {
    res.status(400).json({error : "Bad request, email property invalid", code : 400})
    return
  }
  if (req.body.bio.length == 0 || req.body.bio == "") {
    res.status(400).json({error : "Bad request, bio property not provided", code : 400})
    return
  }
  if (req.body.country.length == 0 || req.body.country == "") {
    res.status(400).json({error : "Bad request, country property not provided", code : 400})
    return
  }
  if (req.body.school.length == 0 || req.body.school == "") {
    res.status(400).json({error : "Bad request, school property not provided", code : 400})
    return
  }
  if (req.body.project.length == 0 || req.body.project == "") {
    res.status(400).json({error : "Bad request, project property not provided", code : 400})
    return
  }
  req.body = preventXSS(req.body)
  db.user.create({
    name : req.body.name,
    email : req.body.email,
    bio : req.body.bio,
    country : req.body.country,
    school : req.body.school,
    project : req.body.project,
    passkey : req.body.passkey,
    d6_Identifier: crypto.randomBytes(8).toString('hex').slice(0, 8)
  }).then(() => {
    db.passkey.update({hasBeenUsed : true}, {where : {passkey : req.body.passkey}})
    res.status(200).json({message : "User created", code : 200})
  }).catch((e) => {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  })
})

app.put("/register", async (req, res) => {
  if (req.body.token == null) {
    res.status(400).json({error : "Bad request, token property not provided", code : 400})
    return
  }
  if (req.body.name.length == 0 || req.body.name == "") {
    res.status(400).json({error : "Bad request, name property not provided", code : 400})
    return
  }
  if (req.body.email.length == 0 || req.body.email == "") {
    res.status(400).json({error : "Bad request, email property not provided", code : 400})
    return
  }
  if (req.body.bio.length == 0 || req.body.bio == "") {
    res.status(400).json({error : "Bad request, bio property not provided", code : 400})
    return
  }
  if (req.body.project.length == 0 || req.body.project == "") {
    res.status(400).json({error : "Bad request, project property not provided", code : 400})
    return
  }
  try {
    decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
  } catch (e) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  if (decoded.passkey == null) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  req.body = preventXSS(req.body)
  db.user.update({
    name : req.body.name,
    email : req.body.email,
    bio : req.body.bio,
    project : req.body.project
  }, {where : {passkey : decoded.passkey}}).then(() => {
    res.status(200).json({message : "User updated", code : 200})
  }).catch((e) => {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  })
})

app.post("/login", async (req, res) => {
  if (req.body.email == null) {
    res.status(400).json({error : "Bad request, email property not provided", code : 400})
    return
  }
  if (req.body.passkey == null) {
    res.status(400).json({error : "Bad request, passkey property not provided", code : 400})
    return
  }
  user = await db.user.findOne({where : {email : req.body.email, passkey : req.body.passkey}})
  if (user == null) {
    res.status(401).json({error : "Unauthorized, invalid email or passkey", code : 401})
    return
  }
  token = jwt.sign({email : req.body.email, passkey: req.body.passkey}, process.env.JWT_SECRET, {expiresIn : '1d'})
  res.status(200).json({message : "User logged in", code : 200, token : token})
})

app.post("/getInfo", async (req, res) => {
  tokenValidOrPresent = true
  if (req.body.token == null) {
    tokenValidOrPresent = false
  }
  if (req.body.d6_Identifier == null) {
    res.send(400).json({error : "Bad request, d6_Identifier property not provided", code : 400})
  }
  try {
    decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
  } catch (e) {
    tokenValidOrPresent = false
  }
  if (decoded.passkey == null) {
    tokenValidOrPresent = false
  }

  if (tokenValidOrPresent == true) {

  user = await db.user.findOne({where : {email : decoded.email, passkey : decoded.passkey}})
  if (user == null) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  try {
    db.contacttransfer.create({fromc : user.d6_Identifier, toc : req.body.d6_Identifier})
  } catch (e) {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
    return
  }

  }

  db.user.findOne({where : {d6_Identifier : req.body.d6_Identifier}}).then((user) => {
    if (user == null) {
      res.status(404).json({error : "Not found, user not found", code : 404})
      return
    }
    user.dataValues.passkey = "-"
    res.status(200).json({message : "User found", code : 200, user : user})
  }).catch((e) => {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  })
})

app.post("/getAllUsers", async (req, res) => {
  if (req.body.token == null) {
    res.status(400).json({error : "Bad request, token property not provided", code : 400})
    return
  }
  try {
    decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
  } catch (e) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  var bearer = await db.user.findOne({where : {email : decoded.email, passkey : decoded.passkey}})
  if (bearer == null) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  if (bearer.dataValues.isStaff == false) {
    res.status(401).json({error : "Unauthorized, user is not a staff", code : 401})
    return
  }
  var users = await db.user.findAll()
  if (users == null) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  res.status(200).json({message : "Users found", code : 200, users : users})
})


app.post("/getPersonalInfo", async (req, res) => {
  if (req.body.token == null) {
    res.status(400).json({error : "Bad request, token property not provided", code : 400})
    return
  }
  try {
    decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
  } catch (e) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  if (decoded.passkey == null) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  user = await db.user.findOne({where : {email : decoded.email, passkey : decoded.passkey}})
  if (user == null) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  res.status(200).json({message : "User found", code : 200, user : user})
})

app.get("/countries", async (req, res) => {
  try {
    json = await db.country.findAll()
    res.status(200).json(json)
  } catch(e) {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  }
})

app.post("/events", async (req, res) => {
  if (req.body.token == null) {
    res.status(400).json({error : "Bad request, token property not provided", code : 400})
    return
  }
  try {
    decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
  } catch (e) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  if (decoded.passkey == null) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  events = await db.event.findAll()
  res.status(200).json({message : "Events found", code : 200, events : events})
})

app.get("/events/:masterpassword", async (req, res) => {
  if (req.params.masterpassword != masterpassword) {
    res.status(401).json({error : "Unauthorized, invalid master password", code : 401})
    return
  }
  try {
    events = await db.event.findAll()
    res.status(200).json({message : "Events found", code : 200, events : events})
  } catch(e) {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  }
})

app.put("/events/:masterpassword", async (req, res) => {
  if (req.params.masterpassword != masterpassword) {
    res.status(401).json({error : "Unauthorized, invalid master password", code : 401})
    return
  }
  if (req.body.name.length == 0 || req.body.name == "") {
    res.status(400).json({error : "Bad request, name property not provided", code : 400})
    return
  }
  if (req.body.description.length == 0 || req.body.description == "") {
    res.status(400).json({error : "Bad request, description property not provided", code : 400})
    return
  }
  if (req.body.start_date.length == 0 || req.body.start_date == "") {
    res.status(400).json({error : "Bad request, start_date property not provided", code : 400})
    return
  }
  if (req.body.end_date.length == 0 || req.body.end_date == "") {
    res.status(400).json({error : "Bad request, end_date property not provided", code : 400})
    return
  }
  if (req.body.place.length == 0 || req.body.place == "") {
    res.status(400).json({error : "Bad request, place property not provided", code : 400})
    return
  }
  req.body = preventXSS(req.body)
  db.event.create({
    name : req.body.name,
    description : req.body.description,
    start_date : req.body.start_date,
    end_date : req.body.end_date,
    place : req.body.place
  }).then(() => {
    res.status(200).json({message : "Event created", code : 200})
  }).catch((e) => {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  })
})

app.delete("/events/:masterpassword/:id", async (req, res) => {
  if (req.params.masterpassword != masterpassword) {
    res.status(401).json({error : "Unauthorized, invalid master password", code : 401})
    return
  }
  try {
    await db.event.destroy({where : {id : req.params.id}})
    res.status(200).json({message : "Event deleted", code : 200})
  } catch(e) {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  }
})



app.get("/schools", async (req, res) => {
  try {
    json = await db.school.findAll()
    res.status(200).json(json)
  } catch(e) {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  }
})

app.post("/map_places/", async (req, res) => {
  try {
    decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
  } catch (e) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  if (decoded.passkey == null) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  try {
    json = await db.map_place.findAll()
    res.status(200).json(json)
  } catch(e) {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  }
})

app.put("/map_places/:masterpassword", async (req, res) => {
  if (req.params.masterpassword != masterpassword) {
    res.status(401).json({error : "Unauthorized, invalid master password", code : 401})
    return
  }
  if (req.body.name.length == 0 || req.body.name == "") {
    res.status(400).json({error : "Bad request, name property not provided", code : 400})
    return
  }
  if (req.body.description.length == 0 || req.body.description == "") {
    res.status(400).json({error : "Bad request, description property not provided", code : 400})
    return
  }
  if (req.body.lat.length == 0 || req.body.lat == "") {
    res.status(400).json({error : "Bad request, lat property not provided", code : 400})
    return
  }
  if (req.body.long.length == 0 || req.body.long == "") {
    res.status(400).json({error : "Bad request, long property not provided", code : 400})
    return
  }
  req.body = preventXSS(req.body)
  console.log(req.body)
  db.map_place.create({
    name : req.body.name,
    description : req.body.description,
    lat : req.body.lat,
    long : req.body.long
  }).then(() => {
    res.status(200).json({message : "Map place created", code : 200})
  }).catch((e) => {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  })
})
  
app.delete("/map_places/:masterpassword/:id", async (req, res) => {
  if (req.params.masterpassword != masterpassword) {
    res.status(401).json({error : "Unauthorized, invalid master password", code : 401})
    return
  }
  try {
    await db.map_place.destroy({where : {id : req.params.id}})
    res.status(200).json({message : "Map place deleted", code : 200})
  } catch(e) {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  }
})


app.get("/map_places/:masterpassword", async (req, res) => {
  if (req.params.masterpassword != masterpassword) {
    res.status(401).json({error : "Unauthorized, invalid master password", code : 401})
    return
  }
  try {
    json = await db.map_place.findAll()
    res.status(200).json(json)
  } catch(e) {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  }
})

app.post("/projects", async (req, res) => {
  if (req.body.token == null) {
    res.status(400).json({error : "Bad request, token property not provided", code : 400})
    return
  }
  try {
    decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
  } catch (e) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  try {
    json = await db.project.findAll()
    res.status(200).json(json)
  } catch(e) {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  }
})

app.get("/graphdata/:masterpassword", async (req, res) => {
  if (req.params.masterpassword != masterpassword) {
    res.status(401).json({error : "Unauthorized, invalid master password", code : 401})
    return
  }
  try {
    json = await db.contacttransfer.findAll()
    res.status(200).json(json)
  } catch(e) {
    console.log(e)
    res.status(500).json({error : "Internal server error", code : 500})
  }
})


var connections = []

app.ws('/', async function (ws, req) {
  connections.push(ws)
  ws.on('close', function() {
    connections.splice(connections.indexOf(ws), 1)
  })
});

app.get("/remote/:masterpassword/:commandword", async (req, res) => {
  if (req.params.masterpassword != masterpassword) {
    res.status(401).json({error : "Unauthorized, invalid master password", code : 401})
    return
  }
  if (req.params.commandword.length == 0 || req.params.commandword == "") {
    res.status(400).json({error : "Bad request, commandword not provided", code : 400})
    return
  }
  if (req.params.commandword == "lo") {
    res.status(200).json({message : "Loopback", code : 200})
    return
  }
  res.status(200).json({message : "Sent", code : 200})
  connections.forEach((connection) => {
    connection.send(JSON.stringify({command : req.params.commandword , code : 200}))
  }
  )
  return
})

app.post("/sendQnaMessage", async (req, res) => {
  if (req.body.token.length == 0 || req.body.token == "") {
    res.status(400).json({error : "Bad request, token not provided", code : 400})
    return
  }
  if (req.body.message.length == 0 || req.body.message == "") {
    res.status(400).json({error : "Bad request, message not provided", code : 400})
    return
  }
  if (req.body.country.length == 0 || req.body.country == "") {
    res.status(400).json({error : "Bad request, country not provided", code : 400})
    return
  }
  if (req.body.school.length == 0 || req.body.school == "") {
    res.status(400).json({error : "Bad request, school not provided", code : 400})
    return
  }
  try {
    jwt.verify(req.body.token, process.env.JWT_SECRET)
  } catch (e) {
    res.status(401).json({error : "Unauthorized, invalid token", code : 401})
    return
  }
  req.body = preventXSS(req.body)
  var timenow = new Date().getTime().toString()
  db.qnamessage.create({message : req.body.message, country: req.body.country, school: req.body.school, sender: req.body.sender})
  res.status(200).json({message : "Message created", code : 200})
      connections.forEach((connection) => {
    connection.send(JSON.stringify({message : req.body.message, country: req.body.country, school: req.body.school, sender: req.body.sender, uuid: btoa(new Date().getTime().toString())}))
  }
  )
  return
})

app.ws('/lo', function(ws, req) {
  ws.on('message', function(msg) {
    ws.send(msg)
  });
});


app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
  db.testConnection()
  bot.launch();
  var telegramIds = await db.telegramId.findAll()
  for (var i = 0; i < telegramIds.length; i++) {
    bot.telegram.sendMessage(new Number (telegramIds[i].dataValues.telegramId), "Telegram service restart at: " + new Date().toLocaleString())
  }
})
