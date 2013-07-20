// Based on Todo list example 
// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). 

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

	// ---------------------
	// Location model
	// ---------------------
	var Location = Backbone.Model.extend({
		defaults: function() {
			return {
				lat: 0,
				lng: 0, 
				address: "",
				nickname: ""
			};
		}
	});


	// ---------------------	
	// Location collection
	// ---------------------
	var LocationList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Location,

		// REST server with CRUD persistence
		url: 'http://localhost:5000/ubertest/api/v1.0/locations',
		
		// Locations are sorted by their original insertion order.
		comparator: 'id'
	});
	
	// Create our global collection of **Locations**.
	var Locations = new LocationList;
	
	
	// ---------------------
	// Location view
	// ---------------------
	var LocationView = Backbone.View.extend({
	
		//... is a list tag.
		tagName:  "li",

		// Cache the template function for a single item.
		template: _.template($('#item-template').html()),
    
		// The DOM events specific to an item.
		events: {
			"click a.destroy" : "clear",
			"click a.edit" : "rename",
			"click a.goto" : "move"
		},
        
		// The LocationView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Location** and a **LocationView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},

		// Re-render the titles of the todo item.
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		// Remove the item, destroy the model.
		clear: function() {
			var r=confirm("Remove this location?");
			if (r==true) {
				this.model.destroy();
			}
		},
		
		// Rename this location
		rename: function() {
			var newname = prompt("Please enter a new nickname for this location.", "");
			if (newname==null || newname=="") {
				return;
			}
			this.model.save({nickname: newname});
		},
		
		// Move the marker on the map
		move: function() {
			moveMarker(this.model.attributes);
			openInfoWindow();
		}
	});
	

	// ---------------------
	// Application view
	// ---------------------
	// Our overall **AppView** is the top-level piece of UI.
	var AppView = Backbone.View.extend({
		
		el: $("#location_app"),		

		events: {
			"click #button_add": "createNew",
		},
		
		// At initialization we bind to the relevant events on the `Location`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting locations that might be saved on the server.
		initialize: function() {
			this.listenTo(Locations, 'add', this.addOne);
			this.listenTo(Locations, 'reset', this.addAll);
			this.listenTo(Locations, 'all', this.render);

			Locations.fetch();
		},

		// Add a single location item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function(location) {
			var view = new LocationView({model: location});
			if (view.model.attributes.address=="" || view.model.attributes.nickname=="") {
				return;
			}
			this.$("#fav_list").append(view.render().el);
		},
    
		// Add all items in the **Locations** collection at once.
		addAll: function() {
			console.log('AppView -> addAll');
			Locations.each(this.addOne, this);
		},
		
		// If you hit return in the main input field, create new **Todo** model,
		// persisting it to *localStorage*.
		createNew: function(e) {
			// prompt for nickname, bail if none
			var nickname = prompt("Please enter a nickname for this location.", "");
			if (nickname==null || nickname=="") {
				return;
			}			
			
			// create and return the unique id
			var position = marker.getPosition();
			Locations.create({
				lat: position.lat(),
				lng: position.lng(), 
				address: $('#address').val(),
				nickname: nickname
			});
		}
	});
	
	// Create the app
	var App = new AppView;

});