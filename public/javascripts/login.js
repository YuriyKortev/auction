$(".admin").on("click",()=>{
    document.location.href = "buyer/admin";
});

$(".logged").on("click",(event)=>{
    document.location.href = '/buyer/'+$(event.target).closest("div").attr("id");
});