/* global google */
/* global _ */
/**
 * scripts.js
 *
 * Computer Science 50
 * Problem Set 8
 *
 * Global JavaScript.
 */

// Google Map
var map;

// markers for map
var Markers = [];

// info window
var info = new google.maps.InfoWindow();

// execute when the DOM is fully loaded
$(function() {

    // styles for map
    // https://developers.google.com/maps/documentation/javascript/styling
    var styles = [

        // hide Google's labels
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                {visibility: "off"}
            ]
        },

        // hide roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {visibility: "off"}
            ]
        }

    ];

    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var options = {
        center: {lat: 37.4236, lng: -122.1619}, // Stanford, California
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 14,
        panControl: true,
        styles: styles,
        zoom: 13,
        zoomControl: true
    };

    // get DOM node in which map will be instantiated
    var canvas = $("#map-canvas").get(0);

    // instantiate map
    map = new google.maps.Map(canvas, options);

    // configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);

     
});

/**
 * Adds marker for place to map.
 */
function addMarker(place)
{
    // creating marker
    
   /*var marker = new google.maps.Marker({
	icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",	
	position: new google.maps.LatLng(place.latitude, place.longitude),
	map: map,
	labelOrigin: (20,100),
	label: place.place_name + ", " + place.admin_name1 ,
	anchor: new google.maps.Point(200,100),
	
//	labelClass: "label"
    });*/
    var marker = new MarkerWithLabel({
	icon: "http://maps.google.com/mapfiles/kml/pal2/icon31.png",	
	position: new google.maps.LatLng(place.latitude, place.longitude),
	map: map,
	labelContent:"<p id = 'places'>"+ place.place_name + ", " + place.admin_name1 
		      + ", " + place.postal_code+"</p>",
    });
    
    google.maps.event.addListener(marker, "click", function() {
	showInfo(marker);
	$.getJSON("articles.php", {
	    geo: place.postal_code
	})
	.done(function(data, textStatus, jqXHR) 
	{
	    // if there is no news, tell user no news check for again using postal_name is notdone as that will 
	    //make it too large and i don't know if it is really needed
	    if (data.length === 0)
	    {
		showInfo(marker, "No News.");
	    }
	    // else if there is news, displays news in unordered list
	    else
	    {
		// making unordred list using function htmlInfo Window 
		var ul = htmlInfoWindow(data);
        
		// show news
		showInfo(marker, ul);
		
	    }
	});
    });
    
   // google.maps.event.addListner(marker,"click",function(){loadinfo(marker,place)});
    Markers.push(marker);
    
}


function htmlInfoWindow(data)
{
    // start a unordered list
    var ul = "<ul>";
    // create a template
    var temp = _.template("<li> <a href = '<%- link %>' target= '_blank'><%- title %></a></li>");
    
    // inserting link and title into template
    for(var i=0, n = data.length;i<n;i++)
    {
        ul+=temp({
            link:data[i].link,
            title:data[i].title
            
        });
    }
    // ending unordered list
    ul += "</ul>";
    return ul;
}

/**
 * Configures application.
 */
function configure()
{
    // update UI after map has been dragged
    google.maps.event.addListener(map, "dragend", function() {
        update();
    });

    // update UI after zoom level changes
    google.maps.event.addListener(map, "zoom_changed", function() {
        update();
    });

    // remove markers whilst dragging
    google.maps.event.addListener(map, "dragstart", function() {
        removeMarkers();
    });

    // configure typeahead
    // https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md
    $("#q").typeahead({
        autoselect: true,
        highlight: true,
        minLength: 1
    },
    {
        // added css by making id of paragraph tag
        source: search,
        templates: {
            empty: "no places found yet",
            suggestion: _.template("<p id ='search'><%- place_name %>,<%- admin_name1 %>, <%- postal_code %></p>")
        }
    });

    // re-center map after place is selected from drop-down
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {

        // ensure coordinates are numbers
        var latitude = (_.isNumber(suggestion.latitude)) ? suggestion.latitude : parseFloat(suggestion.latitude);
        var longitude = (_.isNumber(suggestion.longitude)) ? suggestion.longitude : parseFloat(suggestion.longitude);

        // set map's center
        map.setCenter({lat: latitude, lng: longitude});

        // update UI
        update();
    });

    // hide info window when text box has focus
    $("#q").focus(function(eventData) {
        hideInfo();
    });

    // re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
    // https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
    document.addEventListener("contextmenu", function(event) {
        event.returnValue = true; 
        event.stopPropagation && event.stopPropagation(); 
        event.cancelBubble && event.cancelBubble();
    }, true);

    // update UI
    update();

    // give focus to text box
    $("#q").focus();
}

/**
 * Hides info window.
 */
function hideInfo()
{
    info.close();
}

/**
 * Removes markers from map.
 */
function removeMarkers()
{
    for(var i=0;i<Markers.length;i++)
    {
        Markers[i].setMap(null);
    }
    Markers.length = 0;
}

/**
 * Searches database for typeahead's suggestions.
 */
function search(query, cb)
{
    // get places matching query (asynchronously)
    var parameters = {
        geo: query
    };
    $.getJSON("search.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // call typeahead's callback with search results (i.e., places)
        cb(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());
    });
}

/**
 * Shows info window at marker with content.
 */
function showInfo(marker, content)
{
    // start div
    var div = "<div id='info'>";
    if (typeof(content) === "undefined")
    {
        // http://www.ajaxload.info/
        div += "<img alt='loading' src='img/ajax-loader.gif'/>";
    }
    else
    {
        div += content;
    }

    // end div
    div += "</div>";

    // set info window's content
    info.setContent(div);

    // open info window (if not already open)
    info.open(map, marker);
}

/**
 * Updates UI's markers.
 */
function update() 
{
    // get map's bounds
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // get places within bounds (asynchronously)
    var parameters = {
        ne: ne.lat() + "," + ne.lng(),
        q: $("#q").val(),
        sw: sw.lat() + "," + sw.lng()
    };
    $.getJSON("update.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // remove old markers from map
        removeMarkers();

        // add new markers to map
        for (var i = 0; i < data.length; i++)
        {
            addMarker(data[i]);
        }
     })
     .fail(function(jqXHR, textStatus, errorThrown) {

         // log error to browser's console
         console.log(errorThrown.toString());
     });
}

function funk()
{
    //taking input from user in a window prompt
    //var input=prompt("tell place you want to bookmark");
    
    // calling search for places relatd to it
    infoWindow = new google.maps.InfoWindow;

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                
                // saving local cordinates
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // starting geocoder
                var geocoder = new google.maps.Geocoder();
                var city;
                
                // function to find cityname from object addresscomponents
                var findResult = function(results, name){
                    var result =  _.find(results, function(obj){
                        return obj.types[0] == name && obj.types[1] == "political";
                    });
                    return result ? result.short_name : null;
                };
            
                // changing ps=ostion to google latlng to be needed for making marker
                var latlng = new google.maps.LatLng(pos.lat, pos.lng);
                geocoder.geocode({'latLng': latlng}, function(results, status) {
                    if(status == google.maps.GeocoderStatus.OK)
                    {
                        results = results[0].address_components;
                        city = findResult(results, "locality");
                        
                        // create a marker 
                         var marker = new MarkerWithLabel({
        	        icon: "http://maps.google.com/mapfiles/kml/pal2/icon31.png",	
	                position: latlng,
	                map: map,
	                labelContent:"<p id = 'places'>"+ city +"</p>",
                });
                    /**
                     * this  is not created as if it was created and we draged the map then user loaction will have 
                      *removed which we don't want as if country of user is not us then map will not show markers of his relavance
                      * */
                    //Markers.push(marker);
            
                    showInfo(marker);
                        
                    };
                });
               
            
            //infoWindow.setPosition(pos);
            //infoWindow.setContent('Location found.');
            //infoWindow.open(map);
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
      }

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
      
    return false;
}