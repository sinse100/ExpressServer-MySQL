const express = require('express');
const compression = require('compression');
const session = require('express-session');
const flash = require('connect-flash');
const mysqlDB = require('./lib/mysqlDB.js');
const MySQLStore = require('express-mysql-session')(session);   

const hostIP = '127.0.0.1';
const port = 3000;

const app = express(); 
app.use(express.static('public/images'))
app.use(express.urlencoded({extended: false}));
app.use(compression());

app.use(session({
  secret: process.env.SESSION_SECRETE,
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    host     : process.env.DB_HOST,
    port: 3306,
  })
}));

app.use(flash());

const passport = require('./lib/passport.js')(app);

app.get('*',function(request,response,next) {
  mysqlDB.query('SELECT topicId, title FROM topics;',(err,topicInfo)=>{
    request.list = topicInfo;
    next('route');
  })
})

const topicRouter= require('./routes/topic.js');
const indexRouter = require('./routes/index.js');
const authRouter = require('./routes/auth.js')(passport);

app.use('/',indexRouter);
app.use('/topic',topicRouter);
app.use('/auth',authRouter);

app.use(function(request,response, next){
  response.status(404).send('Not Found');
})

app.use(function(err,req,res,next){
  console.error(err.stack);
  res.status(500).send('Something broke!');
})

app.listen(port,hostIP, () => {
  console.log(`Example app listening at http://${hostIP}:${port}`);
});
