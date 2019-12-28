var socket=io.connect('http://localhost:3030');

socket.on('add',(msg)=>{
    console.log('add',msg);
    $("#list_u").append(`<div id="${msg.id}" class="logged" style='cursor:default;'><img src="https://www.bsau.ru/upload/iblock/180/профиль%20мужской2.jpg"><p>${msg.name}</p><p>${msg.surname}</p><p name="money">${msg.money}</p><p name="id">${'#'+msg.id}</p></div>`);
});

socket.on('del',(msg)=>{
    console.log('del',msg);
    $(`#${msg.id}`).remove();
});

socket.on('msg',(msg)=>{
    $('#messages').append($('<li>').text(msg));
});
