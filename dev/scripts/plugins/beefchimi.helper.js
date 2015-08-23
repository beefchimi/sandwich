// Helper: Animation / Transition Event Listener
// --------------------------------------------------------------------------------------------------------------------------------------------------------
function whichAnimationEvent() {

	var anim,
		element    = document.createElement('fakeelement'),
		animations = {
			'animation'       : 'animationend',
			'OAnimation'      : 'oAnimationEnd',
			'MozAnimation'    : 'animationend',
			'WebkitAnimation' : 'webkitAnimationEnd'
		}

	for (anim in animations) {
		if (element.style[anim] !== undefined) {
			return animations[anim];
		}
	}

}

function whichTransitionEvent() {

	var trans,
		element     = document.createElement('fakeelement'),
		transitions = {
			'transition'       : 'transitionend',
			'OTransition'      : 'oTransitionEnd',
			'MozTransition'    : 'transitionend',
			'WebkitTransition' : 'webkitTransitionEnd'
		}

	for (trans in transitions) {
		if (element.style[trans] !== undefined) {
			return transitions[trans];
		}
	}

}

var animationEvent  = whichAnimationEvent(),
	transitionEvent = whichTransitionEvent();


// Helper: Fire Window Resize Event Upon Finish
// --------------------------------------------------------------------------------------------------------------------------------------------------------
var waitForFinalEvent = (function() {

	var timers = {};

	return function(callback, ms, uniqueId) {

		if (!uniqueId) {
			uniqueId = 'beefchimi'; // Don't call this twice without a uniqueId
		}

		if (timers[uniqueId]) {
			clearTimeout(timers[uniqueId]);
		}

		timers[uniqueId] = setTimeout(callback, ms);

	};

})();


// Helper: Get a random number between a min and max range
// ----------------------------------------------------------------------------
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}