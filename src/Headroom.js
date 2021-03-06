/**
 * UI enhancement for fixed headers.
 * Hides header when scrolling down
 * Shows header when scrolling up
 * @constructor
 * @param {DOMElement} elem the header element
 * @param {Object} options options for the widget
 */
function Headroom (elem, options) {
	options = options || Headroom.options;

	this.lastKnownScrollY = 0;
	this.elem             = elem;
	this.debouncer        = new Debouncer(this.update.bind(this));
	this.tolerance        = options.tolerance;
	this.classes          = options.classes;
	this.offset           = options.offset;
}
Headroom.prototype = {
	constructor : Headroom,

	/**
	 * Initialises the widget
	 */
	init : function() {
		this.elem.classList.add(this.classes.initial);

		// defer event registration to handle browser 
		// potentially restoring previous scroll position
		setTimeout(this.attachEvent.bind(this), 100);
	},

	/**
	 * Destroys the widget
	 */
	destroy : function() {
		window.removeEventListener('scroll', this.eventHandler, false);
		this.elem.classList.remove(this.classes.unpinned, this.classes.pinned, this.classes.initial);
	},

	/**
	 * Attaches the scroll event
	 */
	attachEvent : function() {
		if(!this.eventHandler){
			this.eventHandler = this.debouncer.handleEvent.bind(this.debouncer);
			window.addEventListener('scroll', this.eventHandler, false);
		}
	},
	
	/**
	 * Unpins the header if it's currently pinned
	 */
	unpin : function() {
		this.elem.classList.add(this.classes.unpinned);
		this.elem.classList.remove(this.classes.pinned);
	},

	/**
	 * Pins the header if it's currently unpinned
	 */
	pin : function() {
		this.elem.classList.remove(this.classes.unpinned);
		this.elem.classList.add(this.classes.pinned);
	},

	/**
	 * Test whether tolerance and offset have been exceeded
	 * @param  {Number} currentScrollY the current scroll position
	 * @return {Boolean} true if exceeded, false otherwise
	 */
	toleranceAndOffsetExceeded : function(currentScrollY) {
		var toleranceExceeded = Math.abs(currentScrollY-this.lastKnownScrollY) > this.tolerance,
			offsetExceeded    = currentScrollY >= this.offset;

		return toleranceExceeded && offsetExceeded;
	},

	/**
	 * Handles updating the state of the widget
	 */
	update : function() {
		var currentScrollY    = window.scrollY,
			notBouncing       = currentScrollY > 0; //OSX has bouncy scrolling

		if(this.toleranceAndOffsetExceeded(currentScrollY)) {
			if(currentScrollY > this.lastKnownScrollY && notBouncing) { // Down
				this.unpin();
			}
			else if(currentScrollY < this.lastKnownScrollY) { // Up
				this.pin();
			}
		}

		this.lastKnownScrollY = currentScrollY;
	}
};
/**
 * Default options
 * @type {Object}
 */
Headroom.options = {
	tolerance : 0,
	offset: 0,
	classes : {
		pinned : 'headroom--pinned',
		unpinned : 'headroom--unpinned',
		initial : 'headroom'
	}
};