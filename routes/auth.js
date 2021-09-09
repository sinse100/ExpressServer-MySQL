const template = require('../lib/template.js');
const express =require('express');
const router = express.Router();
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const mysqlDB = require('../lib/mysqlDB.js');

module.exports = function(passport){
    router.get('/login',function(request,response){
        let fmsg = request.flash();
        let feedback ='';
        if (fmsg.message){
            feedback = fmsg.message;
        }
        const title = 'WEB - login';
        const list = template.list(request.list);
        const html = template.HTML(title,list,`
        <div style="color:red;">${feedback}</div>
        <form action="/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p><input type="submit" value="login"></p>
        </form>
        `,'');
        response.send(html);
    });
    
    router.post('/login_process',(req,res,next)=>{
        passport.authenticate('local', (err, user, info) =>{
            if(req.session.flash) {
                req.session.flash = {};
            }
            req.flash('message', info.message);
            req.session.save(() => {
                if(err) {return next(err)};
                if(!user){
                    return res.redirect('/auth/login');
                }
                req.logIn(user, (err) => {
                    if(err){return next(err);}
                    return req.session.save(()=>{
                        res.redirect('/');
                    });
                });
            });
        })(req, res, next)
        
      
    });

    router.get('/register',function(request,response){
        let fmsg = request.flash();
        let feedback ='';
        if (fmsg.message){
            feedback = fmsg.message;
        }
        const title = 'WEB - login';
        const list = template.list(request.list);
        const html = template.HTML(title,list,`
        <div style="color:red;">${feedback}</div>
        <form action="/auth/register_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p><input type="password" name="pwd2" placeholder="password check"></p>
        <p><input type="text", name="displayName", placeholder="display name"></p>
        <p><input type="submit" value="register"></p>
        </form>
        `,'');
        response.send(html);
    });
   
    router.post('/register_process', (request, response,next)=>{
        const email = request.body.email;
        const pwd= request.body.pwd;
        const pwd2 = request.body.pwd2;
        const displayName = request.body.displayName;
        var emptyField = '';
        const fields = ['email','password','password-check','Nick-Name']; 
        Object.keys(request.body).forEach((field,index)=>{
            if(request.body[field] === ''){
                emptyField += `${fields[index]} `;
            }
        });
        
        if(emptyField !== ''){           
            request.flash('message',`${emptyField}Empty, Please Fill It!!!`);
            request.session.save(function(err){
                if(err) {return next(err)};
                response.redirect('/auth/register');
            });
            return false;
        }

        mysqlDB.query('SELECT * FROM users WHERE users.email=?',[email],(err,userInfo)=>{
            if (userInfo[0]){
                request.flash('message','Duplicated Email Found!! Use Other Email!!');
                request.session.save(function(err){
                    if(err) {return next(err)};
                    response.redirect('/auth/register');
                });
                return false;
            }

            if(pwd !== pwd2){
                request.flash('message','Password Must same!!');
                request.session.save(function(err){
                    if(err) {return next(err)};
                    response.redirect('/auth/register');
                });
                return false;
            }

            else{
                bcrypt.hash(pwd, 10, function(err, hash) {
                    if(err) {next(err);}

                    var user = {
                        'authId' :shortid.generate(),
                        'email' : email,
                        'password' : hash,
                        'displayName' : displayName
                    }

                     mysqlDB.query(
                         `INSERT INTO users (authId, email, password, displayName) VALUES (?,?,?,?)`
                         , [user.authId, user.email, user.password, user.displayName]
                         , (err, result) =>{
                             if(err) {next(err);}
                             user.id= result.insertId; //
                             request.logIn(user, (err) => {
                                if(err){return next(err);}
                                return request.session.save(()=>{
                                    response.redirect('/');
                                });
                            });
                        }
                     );
                });
               }
        });
    });

    router.get('/logout',function(request,response) {
        request.logout();
        request.session.save(function(){
            response.redirect('/');
        })
    });
    return router;
}

