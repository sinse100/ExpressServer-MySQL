const mysqlDB = require('./mysqlDB.js')
const bcrypt = require('bcrypt');

module.exports = function(app) {    
    const passport = require('passport')
    ,LocalStrategy = require('passport-local').Strategy;  // Local Strategy Ganna Be Used...
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    passport.serializeUser(function(user, done) {
        done(null,user.id);
    });
    
    passport.deserializeUser(function(id, done) {;
        mysqlDB.query('SELECT * FROM users WHERE users.id=?',[id],(err,userInfo)=>{
            if(err) {throw (err)}
            done(null, userInfo[0]);
        });
    });
    
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pwd'
    },
    (email, password, done) => { 
        mysqlDB.query('SELECT * FROM users WHERE users.email=?',[email],(err,userInfo)=>{
            if(err) {throw (err)}
            if(userInfo[0]){
                bcrypt.compare(password, userInfo[0].password, function(err, result){
                    if(err) {next(err);}
                    if(result){
                        return done(null, userInfo[0], {
                            message: 'Welcome.'
                        });
                    } else {
                        return done(null, false, {
                            message: 'Password is not correct.'
                        });
                    }
                });
            } 
            else{
                return done(null, false, {
                    message: 'There is no such email'
                });
            }      
        });   
    }
    ));
    
    return passport;
}