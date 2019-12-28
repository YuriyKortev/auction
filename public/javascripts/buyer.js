$('#packet').attr('href',document.location.pathname+'/packet');


var socket=io.connect('http://localhost:3030');

let cur_pic;


$('.polzunok-2').slider({
  create: function () {
    $('.polzunok-2 span').html("<b>&lt;</b>" + '$' + $(".polzunok-2").slider("value") + "<b>&gt;</b>");
  },
  slide:function (event,ui) {
    $('.polzunok-2 span').html("<b>&lt;</b>" +'$'+ ui.value + "<b>&gt;</b>");
  }
});

socket.on('connect',()=>{
  socket.json.emit('restore',{id:document.location.pathname.slice(-1)});
});

socket.on('msg',(msg)=>{
  $('#messages').append($('<li>').text(msg));
});

$('#loggin').on('click',function(){
  $(this).prop('disabled',true);
  socket.json.emit('hello',{id:document.location.pathname.slice(-1)});
});

socket.on('widget',()=>{
  $(".polzunok-container-2").css("display","block");
});

socket.on('cls_widget',()=>{
  $(".polzunok-container-2").css("display","none");
})

socket.on('pic',(msg)=>{
  cur_pic=msg;
  $('#current_pic div').remove();
  $('#current_pic').append($(`<div id="pic"><p data="author">${msg.author}</p><p data="name">"${msg.name}"</p><img src=${msg.url}></div>`));
  $('.polzunok-2').slider("option","min",msg.start_price+msg.min_step);
  $('.polzunok-2').slider("option","max",msg.start_price+msg.max_step);
  $('.polzunok-2 span').html("<b>&lt;</b>" + '$' + $(".polzunok-2").slider("value") + "<b>&gt;</b>");
  $('#sbm').prop('disabled',false);
});

$('#sbm').on('click',function(){
  socket.json.emit('step',{money:$( ".polzunok-2" ).slider( "value" )});
  $(this).prop('disabled',true);
});

socket.on('sbm',(msg)=>{
  console.log(msg);
  $('.polzunok-2').slider("option","min",msg+cur_pic.min_step);
  $('.polzunok-2').slider("option","max",msg+cur_pic.max_step);
  $('.polzunok-2 span').html("<b>&lt;</b>" + '$' + $(".polzunok-2").slider("value") + "<b>&gt;</b>");
  $('#sbm').prop('disabled',false);
});

socket.on('end',()=>{
  $('#current_pic div').remove();
  $(".polzunok-container-2").css("display","none");
});

socket.on('money',(msg)=>{
  $('#money').text('$'+msg);
});