function isAN(value) {
    if(value instanceof Number)
        value = value.valueOf(); // Если это объект числа, то берём значение, которое и будет числом

    return  isFinite(value) && value === parseInt(value, 10);
}

$("#list > div").on("click",()=>{
   $.get(`/pictures/${$(event.target).parent().attr('id')}`).done((data)=>{
       $(".name").text('"'+data.name+'"');
       $("#input_change").val(data.name);
       if(data.auction=='true') {
           $("label.container > input[type=checkbox]").prop("checked", true);
       }
       $(".author").text(data.author);
       $(".imgFull").attr("src",data.url);
       $(".description").text(data.description);
       $(".start_price").text('Начальная цена: '+data.start_price);
       $(".min_step").text('Минимальный шаг: '+data.min_step);
       $(".max_step").text('Максимальный шаг: '+data.max_step);
   });
    $("#fade").css("display","block");
    $(".container").css("display","block");
    $(".container").data("id",$(event.target).parent().attr('id'));
});

$("#fade").on("click",()=>{
    $('#selector option:selected').each(function(){
        this.selected=false;
    });
    $(event.target).css("display","none");
    $(".container").css("display","none");
    $(".imgFull").attr("src","");
    $(".description").text("");
    $("#input_change").val("");
    $("label.container > input[type=checkbox]").prop("checked",false);
});

$("#fade").on("mouseenter",()=>{
    $(".cls_but").css("opacity","1");
});

$("#fade").on("mouseleave",()=>{
    $(".cls_but").css("opacity","0.4");
});

$("#list > div").on("mouseenter",()=>{
    $(event.target).closest("div").css("background","#c1c1c1");
});

$("#list > div").on("mouseleave",()=>{
    $("#list > div").css("background","#f1f1f1");
});

$(".change").on("change",function(){
    if(this.value=='name' || this.value=='author') {
        $("#input_change").val($(`.${this.value}`).text().replace(/"/g,''));
    }
    else{
        $("#input_change").val($(`.${this.value}`).text().replace(/\D+/g,''));
    }
});

$('#input_change').keydown(function(e) {
    if(e.keyCode === 13 && $(".change").val()!='name' && $(".change").val()!='author' && !isAN(Number.parseInt(this.value))){$('#input_change').val("Некорректно");return;};
    if(e.keyCode === 13 && this.value!=$(`.${$(".change").val()}`).text() && this.value!='Изменено' && this.value!='Некорректно') {
        $.ajax({
            url: `/pictures/${$(".container").data("id")}-${$(".change").val()}`,
            type: 'PUT',
            data: {data:$('#input_change').val()},
            success: ()=>{
                switch ($(".change").val()){
                    case 'author':
                        $(`.${$(".change").val()}`).text($('#input_change').val());
                        $(`#${$(".container").data("id")}`).children("p[data=author]").text($('#input_change').val());
                        $('#input_change').val("Изменено");
                        break;
                    case 'name':
                        $(`.${$(".change").val()}`).text('"'+$('#input_change').val()+'"');
                        $(`#${$(".container").data("id")}`).children("p[data=name]").text('"'+$('#input_change').val()+'"');
                        $('#input_change').val("Изменено");
                        break;
                    case 'start_price':
                        $(`.${$(".change").val()}`).text('Начальная цена: '+$('#input_change').val());
                        $('#input_change').val("Изменено");
                        break;
                    case 'min_step':
                        $(`.${$(".change").val()}`).text('Минимальный шаг: '+$('#input_change').val());
                        $('#input_change').val("Изменено");
                        break;
                    case 'max_step':
                        $(`.${$(".change").val()}`).text('Максимальный шаг: '+$('#input_change').val());
                        $('#input_change').val("Изменено");
                        break;
                    default:
                        $(`.${$(".change").val()}`).text($('#input_change').val());
                        $('#input_change').val("Изменено");
                }

            }
        });
    }
});

$("label.container>input").on("change",function(){
    let data=this.checked;
    $.ajax({
        url: `/pictures/${$(".container").data("id")}-auction`,
        type: 'PUT',
        data: {data:data},
    });
});
