var express = require('express');
var router = express.Router();

var pictures=require('../public/pictures');
var users=require('../public/users');
var settings=require('../public/settings');
const fs=require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.render('index', { pictures: pictures });
});

router.get('/pictures',(req,res,next)=>{
  return res.end(JSON.stringify(pictures));
});

router.get('/pictures/:num',(req,res,next)=>{
  let number=req.params.num;
  for(let value of pictures){
    if(value.id==number) {
      return res.send(value);
    }
  }
});

router.put('/pictures/:num-:type',(req,res)=>{
  for(key in pictures){
    if(pictures[key].id==req.params.num){
      let body=req.body;
      pictures[key][req.params.type]=body.data;
      break;
    }
  }
  fs.writeFile('pictures',JSON.stringify(pictures),(err)=>{
    if(err) throw err;
  });
  res.end();
});

router.get('/pictures/*',(req,res)=>{
  return res.end(JSON.stringify({error:'No such book'}));
});


//----buyers---------

router.get('/buyers',(req,res)=>{
  return res.render('users',{users:users});
});


router.post('/buyers',(req,res)=>{
  let body=req.body;

  var newId=users[users.length-1].id+1;
  users.push({
    id: newId,
    name: body.name,
    surname: body.surname,
    money: body.money
  });

  fs.writeFile('users',JSON.stringify(users),(err)=>{
    if(err) throw err;
  });

  res.send(JSON.stringify(newId));
});

router.put('/buyers/:num-money',(req,res)=>{
  for(key in users){
    if(users[key].id==req.params.num){
      let body=req.body;
      users[key].money=body.data;
      break;
    }
  }
  fs.writeFile('users',JSON.stringify(users),(err)=>{
    if(err) throw err;
  });
  res.end();
});

router.delete('/buyers/:id',(req,res)=>{
  let del_i=users.map((x)=>{return x.id});
  del_i=del_i.indexOf(Number.parseInt(req.params.id));
  if(del_i===-1){
    res.json({message: "Not found"});
  }
  else{
    let id=users[del_i].id;
    users.splice(del_i,1);
    fs.writeFile('users',JSON.stringify(users),(err)=>{
      if(err) throw err;
    });
    res.send(JSON.stringify({id: id}));
  }
});

//-------------auction---------------

router.get('/auction',(req,res)=>{

  return res.render('auction',{settings: settings, pictures:pictures.filter((x)=>{
      return x.auction=='true';
    })});
});

router.put('/auction',(req,res)=>{

  let body=req.body;
  settings.date=body.date;
  settings.time=body.time;
  settings.timeout=body.timeout;
  settings.interval=body.interval;
  settings.pause=body.pause;

  fs.writeFile('settings',JSON.stringify(settings),(err)=>{
    if(err) throw err;
  });
  res.end();
});


module.exports = router;
