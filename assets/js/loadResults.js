$(document).ready(function(){
    
    $("form").on("submit", function(event){ event.preventDefault(); event.stopPropagation(); getCityLatLong()  })
    $("#search").on("click", function(event){  getCityLatLong()  })
    $("input").on('keydown', function(event){ clearInterval(timer); })
    
    
    if ( user ){
        
        getCityLatLong()
    }
    
   
    function getCityLatLong(){
       
        var city = $("input").val().trim()

        if( !validator(city) ){  alert("Not a valid name. Can't start with a space or cant contain characters other than alphabets - and _ character")}
       
        else {
            var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "&sensor=false"
            $.ajax({
                  dataType: "json",
                  url: url,
                  success: latLongParser,
                  error: networkError
                });
                           
                           
        }
        
    }

    function latLongParser(data, status){
        
        
        if( data.status == "ZERO_RESULTS" ){ alert ("Not a Place. Please input an existant city Name.") }
        else if ( data.status == "OK" ){    $("#instructions").css("top","-30vw"); $("#bars").html('Loading..')
                                            getPlaces( data.results[0].geometry.location ) }
        else { networkError() }
        
        
    }
    
    var service;

    
    function getPlaces(location) {
    
        var city = new google.maps.LatLng(location.lat,location.lng);
        var request = {
            location: city,
            radius:"5000",
            types: ['bar']
        };
    
        service = new google.maps.places.PlacesService($('#bars')[0]);
        service.radarSearch(request, getPlaceIds);
    }
    
     
    function getPlaceIds(results, status) {
      
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var places = [] 
            results.forEach( function ( place ){
                     places.push(place.place_id)

                    });
                    
        getData(places)
            
        
        }
    }
    
    var pointer = 0
    var timer 
    
    function getData(arrayIDs){
                $("#bars").html("")
                $("footer").remove()
        

        timer = setInterval( function() {
            
                            if( pointer == arrayIDs.length ){ clearInterval(timer); pointer = 0  }
                            
                            var request = {
                                            placeId: arrayIDs[pointer]
                                        };
                            
                            service.getDetails(request, populate);
                            pointer++;
                          
                        }, 200)
    }

        
    function populate(place, status) {
        
          if (status == google.maps.places.PlacesServiceStatus.OK) {
              $("#bars").append( prepareElem(place) );

          }
    }
        
    function prepareElem(place) {
       
        var img = ""
        if ( place.hasOwnProperty( "photos" ) ){ img =   place.photos[0].getUrl({'maxWidth':300})  }
        else { img = place.icon ; console.log(img) }
        var id = place.place_id
        var name = place.name
        var addr = place.formatted_address || place.adr_address || place.vicinity
        var phone = place.formatted_phone_number  == undefined ? "Not Available" : place.formatted_phone_number
        var open = false
        if ( place.hasOwnProperty("opening_hours") ) { 
            if ( place.opening_hours.hasOwnProperty("open_now")) { open = true } }
        
        var el  =   '<div class="col-md-3 text-center bar" style ="margin-top:20px; min-height: 500px; color:white; padding:20px;">'  +
                        '<img style="height:200px;  margin:auto;" class="img-responsive img-thumbnail" alt="image of '+ name + '" src="'+img+'">' +
                        '<h4>' + name + '</h4>' +
                        '<h5 style="font-family:Open Sans;">' + addr + '</h5>' +
                        '<h4>' + phone + '</h4>' 
                        
        if ( open ) { el += '<h5>Open Now</h5>' }
        else { el += '<h5>Closed Now</h5>' }
        el += '<a href="/auth/google/' + id + '/'+ $("input").val() +'"><button class = "btn btn-default rsvp" id="' + id + '">RSVP</button></a></div>'
        
        return el    
        
    } 
    
 
    
     $(".navbar").on('click',"#myPlaces",function(){
         
        $(this).toggleClass("dropup")
        clearInterval(timer)
        
        if ( $("#userPlacesContainer").css("top") == "0px" ){
            $("#userPlacesContainer").css("top","-2000px")
            
        } else {
            
           $("#userPlacesContainer").css("top","0px")

        }
        
        if (user != undefined && $(this).hasClass("dropup")) {
            $.ajax({
                url:"/bars",
                type:"GET",
                dataType:"json",
                success : populateUserPlaces,
                error: networkError
               
            })
        }    
        
    })
    
    function populateUserPlaces(bars, status) {
        
        $("#userPlaces").html("");

        if (bars) {
            bars = JSON.parse(bars)
       
            bars.bars.forEach( function (bar) {
                
                var request = {
                                            placeId: bar
                                        };
                            
                service.getDetails(request, prepareElemUser);

            })
        }
        
    }
          
            
    
        
    function prepareElemUser(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          
            var img = ""
            if ( place.hasOwnProperty( "photos" ) ){ img =   place.photos[0].getUrl({'maxWidth':300})  }
            else { img = place.icon ; console.log(img) }
            var id = place.place_id
            var name = place.name
            var addr = place.formatted_address || place.adr_address || place.vicinity
            var phone = place.formatted_phone_number  == undefined ? "Not Available" : place.formatted_phone_number
            var open = false
            if ( place.hasOwnProperty("opening_hours") ) { 
                if ( place.opening_hours.hasOwnProperty("open_now")) { open = true } }
            
            var el  =   '<div class="col-md-3 text-center bar" style ="margin-top:20px; min-height: 500px; padding:20px;">'  +
                            '<img style="height:200px;  margin:auto;" class="img-responsive img-thumbnail" alt="image of '+ name + '" src="'+img+'">' +
                            '<h4>' + name + '</h4>' +
                            '<h5 style="font-family:Open Sans;">' + addr + '</h5>' +
                            '<h4>' + phone + '</h4>' 
                            
            if ( open ) { el += '<h5>Open Now</h5>' }
            else { el += '<h5>Closed Now</h5>' }
            el += '<button class = "btn btn-default removeBar" id="' + id + '">Cancel</button></div>'
            
            $("#userPlaces").append( el );
   
        
        
        }
    } 
    
    $("#userPlaces").on("click",".removeBar", function(event){
        
        var id = $(this).attr("id")
        
        $.ajax({
                url:"/bar/" + id,
                type:"GET",
                dataType:"json",
                success : removeBar,
                error: networkError
               
            })
        
        
    })
    
    function removeBar(data,status){
        
    
            if(data.ok == "ok"){
                window.location.href = "/"
                
                
            }
        
        
    }
    
    function networkError () {
        alert ("Network is very Shaky today. Try Again")
    }
    
    
    function validator(string){
        
        var pattern = /[^a-zA-Z_ -]+/
        var test = string.match(pattern)
        if(test == null ){ return true }
        return false
        
        
    }    
        
        
});