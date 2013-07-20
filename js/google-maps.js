	var map;
	var infowindow;
	var geocoder;
	var marker;
	var markers = [];
	var info_window;
	var loc_sf = new google.maps.LatLng(37.79412228262155, -122.4222478504181);
	
	function initialize() {
		// init the map
		var mapOptions = {
			// san francisco
			center: loc_sf,
			zoom: 16,
			clickable: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

		info_window = new google.maps.InfoWindow();

		//GEOCODER
		geocoder = new google.maps.Geocoder();
	
		// init and place the marker
		moveMarker();
		updateInfoWindow($('#address').val());
	}

	// use the geocoder to determine actual address
	function setMarkerInfo() {
		geocoder.geocode({'latLng': this.marker.getPosition()}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {  
				if (results[0]) {
					$('#address').val(results[0].formatted_address);
					$('#latitude').val(this.marker.getPosition().lat());
					$('#longitude').val(this.marker.getPosition().lng());					
				}	
			}
		});	
	}

	// move the marker to the specified location and update info
	function moveMarker(location) {
		// location is undefined so use defaults
		if (typeof location === 'undefined') {
			// use defaults
			location = {
				"nickname":"Default",
				"address":"",
				"lat": loc_sf.lat(),
				"lng": loc_sf.lng()
			};
		}
		
		// remove existing marker (should only be one, but just in case let's reset)
		for (var i = 0, marker; marker = markers[i]; i++) {
			marker.setMap(null);
		}
		
		var myLatLng = new google.maps.LatLng(location.lat, location.lng);

		this.marker = new google.maps.Marker({
			map: map,
			clickable: true,
			draggable: true,
			position: myLatLng,
			title: location.nickname
		});
		this.markers.push(this.marker);

		map.setCenter(this.marker.getPosition());
		
		// update info when marker is dragged
		google.maps.event.addListener(this.marker, 'drag', function() {	
			setMarkerInfo();
			if (typeof info_window != 'undefined') {
				info_window.close();
				info_window.setContent($('#address').val());
			}
		});
		
		// define info window
		if (location.nickname != '' && location.address != '') {
			updateInfoWindow('<b>' + location.nickname + '</b><br/>' + location.address);
			google.maps.event.addListener(this.marker, 'click', function() {
				info_window.open(this.getMap(), this);
			});
		}

		setMarkerInfo();
	}
	
	
	function updateInfoWindow(content) {
		if (typeof info_window === 'undefined') {
			info_window = new google.maps.InfoWindow({
  				content: '<b>' + location.nickname + '</b><br/>' + location.address
			});
		} else {
			info_window.setContent(content);
		}
	}
	
	
	function openInfoWindow() {
		this.info_window.open(map, marker);
	}
	
	google.maps.event.addDomListener(window, 'load', initialize);