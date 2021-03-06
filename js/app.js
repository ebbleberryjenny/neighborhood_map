var map, google, marker;

//place data/model
var places = [
  {
    name: 'Eataly',
    address: '200 5th Ave, New York, NY 10010, USA',
    location: {lat: 40.742164, lng: -73.989894},
    id: 0,
    foursquare: '4c5ef77bfff99c74eda954d3'
  },
  {
    name: 'The Coffee Shop',
    address: '29 Union Square W, New York, NY 10003, USA',
    location: {lat: 40.736473, lng: -73.991039},
    id: 1,
    foursquare: '3fd66200f964a5204ee41ee3'
  },
  {
    name: 'The Strand Bookstore',
    address: '828 Broadway, New York, NY 10003, USA',
    location: {lat: 40.733095, lng: -73.990773},
    id: 2,
    foursquare: '4a8cc1d4f964a520130f20e3'
  },
  {
    name: 'Pondicheri Restaurant',
    address: '15 W 27th St, New York, NY 10001, USA',
    location: {lat: 40.744449, lng: -73.988307},
    id: 3,
    foursquare: '578aad61498edec74e47456c'
  },
  {
    name: 'Veselka Restaurant',
    address: '144 2nd Ave, New York, NY 10003, USA',
    location: {lat: 40.729026, lng: -73.987121},
    id: 4,
    foursquare: '3fd66200f964a520b8ea1ee3'
  },
  {
    name: 'Momofuku Noodle Bar',
    address: '171 1st Avenue, New York, NY 10003, USA',
    location: {lat: 40.729237, lng: -73.984506},
    id: 5,
    foursquare: '4731be8af964a520244c1fe3'
  }
];

//styles to go with map
var styles = [
  {
    featureType: 'water',
    stylers: [
      { color: '#19a0d8' }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      { color: '#ffffff' },
      { weight: 6 }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -40 }
    ]
  },{
    featureType: 'transit.station',
    stylers: [
      { weight: 9 },
      { hue: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [
      { visibility: 'off' }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      { lightness: 100 }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      { lightness: -100 }
    ]
  },{
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' },
      { color: '#f0e4d3' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -25 }
    ]
  }
];

function initMap(mark) {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13,
    styles: styles,
    mapTypeControl: false
  });

  var largeInfowindow = new google.maps.InfoWindow();

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  // The following group uses the places array to create an array of markers on initialize.
  places.forEach(function(places, i) {
    // Create a marker per location, and put into markers array.
    marker = new google.maps.Marker({
      map: map,
      position: places.location,
      name: places.name,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });

    places.marker = marker;

    // Create an onclick event to open the large infowindow at each marker & have it bounce.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
      this.setIcon(highlightedIcon);
      toggleBounce(this);
    });
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  });

  ko.applyBindings(new ViewModel());
}

function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 2000);
  }
}

function googleError() {
    alert("Google is not loading your map, sorry.");
    $("#map").text(' The google map has an error.  Please try again later.');
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  var apiURL = 'https://api.foursquare.com/v2/venues/';
  var foursquareClientID = 'HUDI4LKRSI4RV5LIDRMDAE1MWRBGNYN3R3SQ1CFPQVUBYX4N';
  var foursquareSecret ='02OHUV51QTN2BPKHUQJB5UZOOIWPZQBIADXB1JIVKQOIGDVC';
  var foursquareVersion = '20170723';
  var index = marker.id;
  var spot = places[index];
  var venueFoursquareID = spot.foursquare;
  var foursquareURL = apiURL + venueFoursquareID + '?client_id=' + foursquareClientID +  '&client_secret=' + foursquareSecret +'&v=' + foursquareVersion;

  $.ajax({
    url: foursquareURL,
    dataType: 'json',
    success: function(data) {
      var info = data.response.venue;
      console.log('Got data!');
      console.log(data);
      infowindow.setContent('<div>' + '<b>' + info.name + '</b>' + '</div><br>' +
            '<a href="' + info.shortUrl + '">Click here for more Foursquare info</a>' +
            '<div><br><em>' + 'Category: </em>' +
            (info.categories[0].name ? info.categories[0].name : 'No categories available.') +
            '</div>' + '<div><em>' + 'Foursquare rating: </em>' +
            (info.rating ? info.rating : 'No rating available.') + '</div>' +
            '<div><br><em>Description: </em>' + (info.description ? info.description : 'No description available.') +
            '</div>');

    },
    fail: function() {
      infowindow.setContent('<div>' + 'Sorry, Foursquare is not returning data.  Please try again later' + '</div>');
    }
  });

  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
      marker.setAnimation(null);
    });

    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
  }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

var Place = function(data) {
  var self = this;

  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
  this.id = data.id;
  this.marker = data.marker;
};

var ViewModel = function() {
  var self = this;
  self.placeList = ko.observableArray([]);
  self.query = ko.observable('');
  self.currentPlace = ko.observable();

  places.forEach(function(placeItem, i){
    self.placeList.push(new Place (placeItem, i));
  });

  //Make currentPlace change when you click on a place name
  self.currentPlace = ko.observable(self.placeList()[0]);

  self.pickPlace = function(clickedPlace) {
    self.currentPlace(clickedPlace);
  };

  // Click binding
  self.markerAnimator = function(clickedPlace) {
    var index = clickedPlace.id;
    var marker = clickedPlace.marker;
    google.maps.event.trigger(marker, 'click');
  };

  self.onClick = function(clickedPlace, a, b) {
    self.pickPlace(clickedPlace);
    self.markerAnimator(clickedPlace);
  };

  self.search = function(value) {
    // remove all the current places, which removes them from the view
    self.placeList.removeAll();
    for(var x in places) {
      if (places[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.placeList.push(places[x]);
      }
    }
  };

  self.markerSearch = function(value) {
    for(var x in places) {
      if (places[x].marker.setMap(map) !== null) {
          places[x].marker.setMap(null);
      }
      if (places[x].marker.name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
          places[x].marker.setMap(map);
      }
    }
  };

  self.query.subscribe(self.search);
  self.query.subscribe(self.markerSearch);

};
