function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

$(document).on("click","#list > div",(event)=>{
    if($(event.target).parent().is("[name=selected]")){
        $("div").find("[name=selected]").css("background","#e2e2e2");
        $("div").find("[name=selected]").removeAttr("name");
        $("#change_money").val("");
        $("#del_user").val("");
        return;
    }
    $("div").find("[name=selected]").css("background","#e2e2e2");
    $("div").find("[name=selected]").removeAttr("name");
    $(event.target).closest("div").attr("name","selected");
    $(event.target).closest("div").css("background","#9c9c9c");
    $("#change_money").val($("div").find("[name=selected]").find("p[name=money]").text());
    $("#del_user").val($("div").find("[name=selected]").find("p[name=id]").text().replace(/#/g,""));
});

$("#addUser").submit(function () {
    let data={};
    $("#addUser").find('input').each(function () {
        if(this.type=="submit")return;
        data[this.name]=$(this).val();
    });
    $.post('/buyers',data,(id)=>{
        $("#list").append(`<div id="${id}" class="logged"><img src="https://www.bsau.ru/upload/iblock/180/профиль%20мужской2.jpg"><p>${data.name}</p><p>${data.surname}</p><p name="money">${data.money}</p><p name="id">${'#'+id}</p></div>`);
        $("#addUser").find('input').each(function () {
            if($(this).is("[type=submit]"))return;
            $(this).val("");
        });
    });

    return false;
});

$("#changeMoney").submit(function () {

    $.ajax({
        url: `/buyers/${$("div").find("[name=selected]").attr("id")}-money`,
        type: 'PUT',
        data: {data:$("#changeMoney").find('input[name=money]').val()},
        success: ()=>{
            $("div").find("[name=selected]").find("p[name=money]").text($("#changeMoney").find('input[name=money]').val());
        }
    });
    return false;
});

$("#delUser").submit(function () {
    $.ajax({
        url: `/buyers/${$("#delUser").find('input[name=id]').val()}`,
        type: 'DELETE',
        success: ()=>{
            $(`#${$("#delUser").find('input[name=id]').val()}`).remove();
        }
    });
    return false;
});

setInterval(()=>{
    let name=$("#addUser").find('input[name=name]').val();
    let surname=$("#addUser").find('input[name=surname]').val();
    let money=$("#addUser").find('input[name=money]').val();
    let sbm=$("#addUser").find('input[type=submit]');
    (name==="" || surname==="" || money==="" || !isNumeric(money))?(sbm.prop("disabled",true)):(sbm.prop("disabled",false));
},500);

setInterval(()=>{
    let id=$("#delUser").find('input[name=id]').val();
    let sbm=$("#delUser").find('input[type=submit]');
    (id==="" || !isNumeric(id))?(sbm.prop("disabled",true)):(sbm.prop("disabled",false));
},500);

setInterval(()=>{
    let money=$("#changeMoney").find('input[name=money]').val();
    let sbm=$("#changeMoney").find('input[type=submit]');
    (money==="" || !isNumeric(money))?(sbm.prop("disabled",true)):(sbm.prop("disabled",false));
},500);