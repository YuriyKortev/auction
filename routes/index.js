var express = require('express');
var router = express.Router();
let Raven=require('raven');
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


let start=new Date(settings.date.replace(/(\d+)-(\d+)-(\d+)/, '$1/$2/$3')+' '+settings.time);

router.put('/auction',(req,res)=>{

  let body=req.body;
  settings.date=body.date;
  settings.time=body.time;
  settings.timeout=body.timeout;
  settings.interval=body.interval;
  settings.pause=body.pause;
  settings.ended=false;

  start=new Date(settings.date.replace(/(\d+)-(\d+)-(\d+)/, '$1/$2/$3')+' '+settings.time);

  fs.writeFile('settings',JSON.stringify(settings),(err)=>{
    if(err) throw err;
  });
  res.end();
});


//----------login---------

router.get('/login',(req,res)=>{
  return res.render('login',{users:users});
});

router.get('/buyer/:id',(req,res)=>{
    if(req.params.id=='admin'){
        return res.render('admin', {
          users:users.filter((x)=>{
            return x.logged==true;
          }),
          pictures:pictures.filter((x)=>{
            return x.auction=='true';
          })});
    }
    let i=users.map((x)=>{return x.id}).indexOf(Number.parseInt(req.params.id));
    return res.render('buyer',{user:users[i],started:settings.started});
});


router.get('/buyer/:id/packet',(req,res)=>{
    let i=users.map((x)=>{return x.id}).indexOf(Number.parseInt(req.params.id));
    return res.render('packet',{user:users[i]});
});


let date,time=new Date().toLocaleTimeString('en-GB',{ hour12: false });

var io = require('socket.io')(3030);
let cur_pic=0;
let started=false;
let cup=0,leader=0;
let back=[];
let pause_fl=false;
io.sockets.on('connection',(socket)=>{
  socket.on('restore',(msg)=>{
    let i=users.map((x)=>{return x.id}).indexOf(Number.parseInt(msg.id));
    if(i && users[i].logged){
      socket['_id']=msg.id;
      socket['name']=users[i].name+' '+users[i].surname;
      if(started){
        socket.json.emit('pic',cur_pic);
        socket.emit('widget');
      }
    }
  });

  if(!started){
    socket.emit('msg',`${time}: Аукцион начнется ${settings.date} в ${settings.time}`);
  }
  else{
    socket.emit('msg',`Аукцион уже идёт!`);
  }


    setInterval(()=>{
        date=new Date().toLocaleString('en-GB',{ hour12: false });
        time=new Date().toLocaleTimeString('en-GB',{ hour12: false });
        if(date==start.toLocaleString('en-GB',{ hour12: false })){
            started=true;
            starting(socket,pictures.filter((x)=>{
                return x.auction=='true';
            }));
        }

    },1000);


    socket.on('step',(msg)=>{
        let i=users.map((x)=>{return x.id}).indexOf(Number.parseInt(socket['_id']));
        if(users[i].money<msg.money){
            socket.emit('msg',`${time}: У вас не хватает денег.`)
        }
        else {
            cup = msg.money;
            console.log(msg, cup);
            cur_pic.start_price = cup;
            leader = socket['_id'];
            socket.emit('msg', `${time}: Вы повышаете на ${cup}.`);
            socket.broadcast.emit('msg', `${time}: ${socket['name']} повышает на ${cup}.`);
            socket.broadcast.emit('sbm', cup);
        }
    });

    socket.on('hello',(msg)=>{
        console.log('user connected '+msg.id);
        socket['_id']=msg.id;
        let i=users.map((x)=>{return x.id}).indexOf(Number.parseInt(msg.id));
        users[i].logged=true;
        socket['name']=users[i].name+' '+users[i].surname;
        socket.broadcast.emit('msg',`${time}: К нам присоединился ${users[i].name} ${users[i].surname}!`)
        socket.emit('msg',`${time}: Здравствуйте, ${users[i].name} ${users[i].surname}!`)
        socket.broadcast.emit('add',users[i]);
        if(started){
            socket.json.emit('pic',cur_pic);
            if(!pause_fl)
                socket.emit('widget');
        }
    });

});

function starting(socket,pictures_f){
    console.log('started');
    socket.emit('msg',`${time}: Аукцион начался!`);
    settings.started=true;
    pause(socket,pictures_f)
}

function pause(socket,pictures_f) {
    if(pictures_f.length==0){
        socket.emit('msg',`${time}: Аукцион закончен.`);
        socket.emit('end');
        started=false;
        settings.ended=true;
        pictures=pictures.filter((x)=>{
            return (x.auction==false || x.auction=='false');
        });
        back.forEach((el)=>{
            el.auction=false;
            pictures.push(el);
        });
        return;
    }
    pause_fl=true;
    socket.emit('msg',`${time}: Торг по картине ${pictures_f[0].name} начнется через ${settings.pause}. Ознакомтесь с картиной.`);
    socket.json.emit('pic',pictures_f[0]);
    setTimeout(()=>{torg(socket,pictures_f)},settings.pause*1000);
}

function torg(socket,pictures_f){
    pause_fl=false;
    cur_pic=0;
    cup=0;
    leader=0;
    let picture=pictures_f.shift();
    cur_pic=picture;
    if(socket['name']){
        socket.emit('widget');
    }
    socket.emit('msg',`${time}: Начинаем торг по картине "${picture.name}". Начальная цена: ${picture.start_price}.`);
    setTimeout(()=>{
        socket.emit('msg',`${time}: Торг по картине закончится через ${settings.interval-settings.interval/3}.`)
    },settings.interval/3)

    setTimeout(()=>{
        socket.emit('cls_widget');
        let i=users.map((x)=>{return x.id}).indexOf(Number.parseInt(leader));
        if(leader) {
            socket.emit('msg', `${time}: Торг по картине ${picture.name} закончен. Победил ${users[i].name} ${users[i].surname}.`);
            if(socket['_id']==leader){
                users[i].money -= cup;
                users[i].packet.push(picture);
                socket.emit('money',users[i].money);
            }
        }
        else{
            socket.emit('msg',`${time}: Торг по картине ${picture.name} закончен. Победителя нет.`);
            back.push(picture);
        }

        pause(socket,pictures_f)
    },settings.interval*1000)

}


module.exports = router;
