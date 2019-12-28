setInterval(()=>{
    let date=$("#changeSettings").find('input[name=date]').val();
    let time=$("#changeSettings").find('input[name=time]').val();
    let timeout=$("#changeSettings").find('input[name=timeout]').val();
    let interval=$("#changeSettings").find('input[name=interval]').val();
    let pause=$("#changeSettings").find('input[name=pause]').val();
    let sbm=$("#changeSettings").find('input[type=submit]');
    (date==="" || time==="" || timeout==="" || interval==="" || pause==="")?(sbm.prop("disabled",true)):(sbm.prop("disabled",false));
},500);

$("#changeSettings").submit(function () {
    let data = {};
    let names = [["date", "Дата начала: "], ["time", "Время: "], ["timeout", "Таймаут: "], ["interval", "Интервал: "], ["pause", "Пауза: "]];
    $("#changeSettings").find('input').each(function () {
        if (this.type == "submit") return;
        data[this.name] = $(this).val();
        console.log($(this).val());
    });

    $.ajax({
        url: '/auction',
        type: 'PUT',
        data: data,
        success: () => {
            for (let value of names) {
                $(`#settings p[name=${value[0]}]`).text(value[1] + data[value[0]]);
            }
            $('#settings').css('display','block');
        }
    });
    return false;
});