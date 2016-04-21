$('document').ready(function(){
    
    $('#pollModal').on('show.bs.modal', function (event) {
                $("#createMsg").html("")
    })

    $('#createOption').on('click', function(event){
        event.stopPropagation();
        event.preventDefault();
        var el = '<div class="form-group"><label for="options" class="col-sm-2 control-label">Option</label><div class="col-sm-7"><input type="text" class="form-control option" placeholder="Your option here", maxlength = 40, required><small class="text-muted pull-left"> max 40 Chars.</small></div><button class="btn btn-danger col-sm-2 removeOption">Remove</button></div>'
        $('#pollForm').append(el);
    })
    $(document).on("click", ".removeOption", function(event){
        event.stopPropagation();
        event.preventDefault();
        event.target.closest(".form-group").remove();
    });
    $(document).on("click", "#createPoll", function(event){
        var send = true;
        event.stopPropagation();
        event.preventDefault();
        $("#createMsg").html("")
        var modal = $("#newPoll")
        var name = modal.find('#name').val()
        var desc = modal.find('#desc').val()
        var options = {}
        $(".option").each(function(index){
            var option = $( this ).val()
            if ( !validator(option)){ $("#createMsg").html( " <br/>There is an error at option : " +(Number(index)+1)+ ' <br/>"Allowed Values are Alphabets, Numerals, \', \" _ , ?, :, &, - and , character' ) }
            options[index] = option
            if( option.length === 0){ send = false; modal.find("#createMsg").append(" <br/>Empty Option Value at option : "+(Number(index)+1)) }
        })

        if(name.length === 0){ modal.find("#createMsg").append("<br/>Please give your poll a Name")}
        else if ( !validator(name)){ $("#createMsg").html( '<br/>There is an error in your Name <br/> Allowed Values are Alphabets, Numerals, \', \" _ , ?, :, &, - and , character' ) }
        else if(desc.length < 10){ modal.find("#createMsg").append("<br/>Please give your poll a bit long Description. Min is 20 characters.")}
        else if ( !validator(desc)){ $("#createMsg").html( '<br/>There is an error in your Description <br/> Allowed Values are Alphabets, Numerals, \', \" _ , ?, :, &, - and , character' ) }
        else if(options.length < 2){ modal.find("#createMsg").append("<br/>Please give your poll atleast two options")}
        
        else if( send ) {

            modal.find("#createMsg").html("")
            $.ajax({
                url: "/profile/poll",
                type:"POST",
                data: { name : name, desc : desc, options : options },
                dataType: "json",
                success: function(data, status){
                                if (data.ok == "ok" ) {
                                    window.location.href = "/profile"
                                    }
                                else { $("#createMsg").html("An error Occured. Try Again") }

                            },
                error: function(){ $("#createMsg").html("An error Occured. Try Again")}

            });
        }
    });
    
    
    
       function validator(string){
        var pattern = /^[^a-zA-Z_?:&,\.'" 0-9-]+( [^a-zA-Z_?:&,\.'" 0-9-]+ )*$/
        var test = string.match(pattern)
        if (test == null ){ return true }
        return false
    }
 
});
