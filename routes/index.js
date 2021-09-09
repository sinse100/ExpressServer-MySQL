const template = require('../lib/template.js');
const auth = require('../lib/auth.js');
const express =require('express');
const router = express.Router();

router.get('/', (request, response) => {
  let fmsg = request.flash();
    let feedback ='';
    if (fmsg.message){
        feedback = fmsg.message;
    }
  const title = 'Welcome';
  const description = 'Hello, Node.js';
  const list = template.list(request.list);
  const html = template.HTML(title, list,
    `
    <div style="color:blue;">${feedback}</div>
    <h2>${title}</h2><p>${description}</p>
    <img src='hello.jpg', width:300px; display:block; margin-top:10px;>
    `,
    `<a href="/topic/create">create</a>`,auth.statusUI(request,response)
  );
    response.send(html);
});

module.exports=router;