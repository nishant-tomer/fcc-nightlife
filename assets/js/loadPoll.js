$('document').ready(function(){
    
   // Fix for Bootstrap Bug of Body shifting to left on modal Open 
    var fixedCls = 'body .navbar-fixed-top';
    var oldSSB = $.fn.modal.Constructor.prototype.setScrollbar;
    $.fn.modal.Constructor.prototype.setScrollbar = function () {
        oldSSB.apply(this);
        if (this.bodyIsOverflowing && this.scrollbarWidth)
            $(fixedCls).css('padding-right', this.scrollbarWidth);
    }

    var oldRSB = $.fn.modal.Constructor.prototype.resetScrollbar;
    $.fn.modal.Constructor.prototype.resetScrollbar = function () {
        oldRSB.apply(this);
        $(fixedCls).css('padding-right', '');
    }
    
    var myDoughnutChart = null
    var pollId = null
    var send = true
    var addAllButton = null 

    
    var str6 = '<div class="radio"><label><input type="radio" name="optionsRadios" id="'
    var str7 = '">'
    var str8 = '</label></div>'
    var str9 = 'Total Votes<span class = "bg-primary" style = "border-radius:2px; display:inline-block; margin: 0 3px; padding:2px 4px;">'
    var str10 = '</span>'
    
    $('#pollModal').on('show.bs.modal', function (event) {
        
        addAllButton = null 
        var button = $(event.relatedTarget) 
        var id = button.data('poll') ; pollId = id;
        var modal = $(this)
        var votes = 0
        $("#showMsg").html("")
        
        $.ajax({    url: "/poll/"+ id,
                    type:"GET",
                    dataType:'json',
                    success: populate,
                    error: function(){$("#showMsg").html("An error Occured. Try Again")}
            });
        
      
        function populate(data,status){
            var ctx = $("#myChart")
            var chartData = {
                        	labels: [],
                        	datasets: [{
                        		data: [],
                        		backgroundColor: [],
                        		hoverBackgroundColor: []
                        	}]
                        };
                        
            var defaultChartData = {
                        	labels: ["Votes","No Votes"],
                        	datasets: [{
                        		data: [0,1],
                        		backgroundColor: ["#AAAFFF","#FFFAAA"],
                        		hoverBackgroundColor: ["#FAFAFA","#AFAFAF"]
                        	}]
                        };
       
            data = JSON.parse(data)
            modal.find('#pollName').attr( "_id", data[0]._id ).html( data[0].name )
            modal.find('#desc').text(data[0].desc)
            var opts = modal.find('#options')
            opts.html("")

            
            data[0].options.forEach(function(option, index){
                chartData.datasets[0].data.push( option.count )
                chartData.datasets[0].backgroundColor.push( rand() )
                chartData.datasets[0].hoverBackgroundColor.push( rand() )
                chartData.labels.push( option.name )
                votes += option.count
                opts.append( str6 + option._id + str7 + option.name + str8 )
            })
            
            opts.children(":first").find("input").prop("checked", true);
            var tweetURL = "https://twitter.com/intent/tweet?url=" + window.location.href + "&text=" + data[0].name
            
            $("#tweet").attr("href", tweetURL)
            
            var voteshtml =str9 + votes + str10
            
            modal.find("#votes").html(voteshtml)
            
            if ( myDoughnutChart != null ) { myDoughnutChart.destroy() }
          
            if ( votes > 0 ){
                 myDoughnutChart = new Chart(ctx, {
                                                	type:'doughnut',
                                                	data: chartData
                                                	});
                
            } else {
                 myDoughnutChart = new Chart(ctx, {
                                                	type:'doughnut',
                                                	data: defaultChartData
                                                	});
         

            }
            
        }
    })
    
    
    $(document).on("click", "#sendVote", function(event){
        
        var id = $('input[type=radio]:checked').attr("id")
         $.ajax({
                url: "/option/"+id,
                type:"GET",
                dataType: "json",
                success: function(data, status){
                                if (data.ok == "ok" ) {
                                    window.location.href = "/"
                                    }
                                else { $("#showMsg").html("An error Occured. Try Again") }
                            },
                error: function(){ $("#showMsg").html("An error Occured. Try Again") }

            });
        event.stopPropagation();
        event.preventDefault();
    });
    
    
    $(document).on("click", "#addOption", function(event){
        
       event.stopPropagation();
        event.preventDefault();
        if ( addAllButton == null ) { addAllButton = '<button class="btn btn-primary sendOptions" style = "margin-bottom:5px;">Add Options</button>'; $('#options').append(addAllButton);}
        var el = '<div class="form-group"><div class = "col-md-10" style="margin-left: -15px;"><input type="text" class="form-control extraOption" placeholder="Your option here", maxlength = 40, required><small class="text-muted pull-left"> max 40 Chars.</small></div><button class="btn col-md-2 btn-danger removeOption">X</button></div>'
        $('#options').append(el);
    });
    
    $(document).on("click", ".removeOption", function(event){
        event.stopPropagation();
        event.preventDefault();
        event.target.closest(".form-group").remove();
        if (  $('#options').find(".form-group").length == 0 ) { $(".sendOptions").remove(); addAllButton = null }
    });
    
    $(document).on("click", ".sendOptions", function(event){
        $("#showMsg").html("")
        var options = {}
        $(".extraOption").each(function(index, element){
            console.log(this)
            var option = $( this ).val()
            console.log(option)
            options[index] = option
            if( option.length === 0){ send = false; $("#showMsg").append(" <br/>Empty Option Value at option : "+(Number(index)+1)) }
            else if ( !validator(option)){ $("#showMsg").html( " <br/>There is an error at option : " +(Number(index)+1)+ ' <br/>"Allowed Values are Alphabets, Numerals, \', \" _ , ?, :, &, - and , character' ) }
         })
          
        if( send ) { 
            $("#showMsg").html("")
            $.ajax({
                url: "/poll/"+pollId,
                type:"POST",
                data:{ options: options },
                dataType: "json",
                success: function(data, status){
                                if (data.ok == "ok" ) {
                                    window.location.href = "/"
                                    }
                                else { $("#showMsg").html("An error Occured. Try Again") }

                            },
                error: function(){ $("#showMsg").html("An error Occured. Try Again")}

            });
         }
        event.stopPropagation();
        event.preventDefault();
    });
    
    
   function rand() {
       var a = Math.floor(Math.random() * 255)
       var b = Math.floor(Math.random() * 255)
       var c = Math.floor(Math.random() * 255)
       var color = 'rgb(' + a + ',' + b + ',' + c + ')'
       return color

  
    }
    
        
    function validator(string){
        var pattern = /^[^a-zA-Z_?:&,\.'" 0-9-]+( [^a-zA-Z_?:&,\.'" 0-9-]+ )*$/
        var test = string.match(pattern)
        if (test == null ){ return true }
        return false
    }
 
   

});

