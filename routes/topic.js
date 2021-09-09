const express = require('express');
const auth = require('../lib/auth.js');
const template = require('../lib/template.js');
const sanitizeHtml = require('sanitize-html');
const shortid = require('shortid');
const mysqlDB = require('../lib/mysqlDB.js');

const router = express.Router();

router.get('/create',(request,response)=>{
    if(!auth.isOwner(request,response)){
        response.redirect('/');
        return false;
    }
    const title = 'WEB - create';
    const list = template.list(request.list);
    const html = template.HTML(title, list, `
      <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
      </form>
    `, '',auth.statusUI(request,response));
    response.send(html);
});

router.post('/create_process', (request, response,next)=>{
    if(!auth.isOwner(request,response)){
        response.redirect('/');
        return false;
    }
    
    const post = request.body;
    const title = post.title;
    const description = post.description;
    const topicId = shortid.generate();

    mysqlDB.query('INSERT INTO topics (aid,title,description,created,topicId) VALUES (?,?,?,NOW(),?);'
        ,[request.user.authId,title,description,topicId]
        ,(err,result)=>{
            if(err) {next(err);}
            response.redirect(`/topic/${topicId}`);
        });
});
  
router.get('/update/:pageId',(request, response,next) =>{
    if(!auth.isOwner(request,response)){
        response.redirect('/');
        return false;
    }
    
    mysqlDB.query('SELECT title,description,topicId,aid FROM topics WHERE topics.topicId=?',[request.params.pageId],(err, topicInfo)=>{
        if(err) {next(err)};
        if(!topicInfo.length){
            next(new Error('Not Found'));
            return false;
        }

        if (topicInfo[0].aid !== request.user.authId){
            request.flash('message',`Not Yours!!`);
            request.session.save(function(err){
                if(err) {return next(err)};
                response.redirect('/');
            });
            return false;
        }
        const list = template.list(request.list);
        const html = template.HTML(topicInfo[0].title, list,
            `
            <form action="/topic/update_process" method="post">
              <input type="hidden" name="topicId" value="${topicInfo[0].topicId}">
              <p><input type="text" name="title" placeholder="title" value="${topicInfo[0].title}"></p>
              <p><textarea name="description" placeholder="description">${topicInfo[0].description}</textarea></p>
              <p><input type="submit"></p>
            </form>
            `,
            `<a href="/topic/create">create</a> <a href="/topic/update/${topicInfo[0].topicId}">update</a>`,
            auth.statusUI(request,response));
            response.writeHead(200);
            response.end(html);
    });
})

router.post('/update_process',(request,response)=>{
    if(!auth.isOwner(request,response)){          
        response.redirect('/');                  
        return false;                             
    }

    const post = request.body;
    const topicId = post.topicId;
    const title = post.title;
    const description = post.description;
    mysqlDB.query('SELECT aid FROM topics WHERE topics.topicId=?',[topicId],(err,topicInfo)=>{
        if (topicInfo[0].aid !== request.user.authId){
            request.flash('message',`Not Yours!!`);
            request.session.save(function(err){
                if(err) {return next(err)};
                response.redirect('/');
            });
            return false;
        }

        mysqlDB.query('UPDATE topics SET title=?, description=? WHERE topics.topicId=?',[title,description,topicId],(err,result)=>{
            if(err) {next(err);}
            response.redirect(`/topic/${topicId}`);
        });
    });
});
  
router.post('/delete_process',(request,response)=>{
    if(!auth.isOwner(request,response)){
        response.redirect('/');
        return false;
    }
    const post = request.body;
    const topicId = post.topicId;

    mysqlDB.query('SELECT aid FROM topics WHERE topics.topicId=?',[topicId],(err, topicInfo)=>{
        if(err) {next(err);}
        if(topicInfo[0].aid !== request.user.authId) {
            request.flash('message',`Not Yours!!`);
            request.session.save(function(err){
                if(err) {return next(err)};
                response.redirect('/');
            });
            return false;
        }
        mysqlDB.query('DELETE FROM topics WHERE topics.topicId=?;',[topicId],(err,results)=>{
            if(err) {next(err);}
            response.redirect('/');
        })
    });
});

router.get('/:pageId',(request,response, next)=> {
    mysqlDB.query('SELECT description,title,topicId,aid FROM topics WHERE topics.topicId=?;',[request.params.pageId],(err,topicInfo)=>{
        if(err) {
            next(err); 
            return false;
        }
        if(!topicInfo.length){
            next(new Error('Not Found'));
            return false;
        }
        mysqlDB.query('SELECT displayName FROM users WHERE users.authId=?;',[topicInfo[0].aid],(err,displayName)=>{
            if(err) {next(err);}
            const sanitizedTitle = sanitizeHtml(topicInfo[0].title);
            const sanitizedDescription = sanitizeHtml(topicInfo[0].description, {
                allowedTags:['h1']
            });
            const list = template.list(request.list);
            const html = template.HTML(sanitizedTitle, list,
                `
                <h2>${sanitizedTitle}</h2>${sanitizedDescription}
                <p>by ${displayName[0].displayName}</p>
                `,
                ` 
                <a href="/topic/create">create</a>
                <a href="/topic/update/${topicInfo[0].topicId}">update</a>
                <form action="/topic/delete_process" method="post">
                  <input type="hidden" name="topicId" value="${topicInfo[0].topicId}">
                  <input type="submit" value="delete">
                </form>
                `, auth.statusUI(request,response));
                response.send(html);
            })
        
        });
});

module.exports=router;

