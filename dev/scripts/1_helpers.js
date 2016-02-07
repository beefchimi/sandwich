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


// Helper: Returns a function that (as long as it continues to be invoked) will not be triggered.
// --------------------------------------------------------------------------------------------------------------------------------------------------------
function debounce(func, wait, immediate) {

  // The function will be called after it stops being called for N milliseconds.
  // If 'immediate' is passed, trigger the function on the leading edge, instead of the trailing.

  // 'private' variable for instance.
  // The returned function will be able to reference this due to closure.
  // Each call to the returned function will share this common timer.
  var timeout;

  // Calling debounce returns a new anonymous function
  return function() {

    // Reference the context and args for the setTimeout function.
    var context = this,
      args    = arguments;

    // Inside the timeout function...
    var later = function() {

      // Clear the timeout variable, which will let the next execution run when in 'immediate' mode.
      timeout = null;

      // Check if the function already ran with the immediate flag
      if (!immediate) {

        // Call the original function with apply():
        // Lets you define the 'this' object as well as the arguments (both captured before setTimeout)
        func.apply(context, args);

      }

    };

    // Should the function be called now?
    // If immediate is 'true and not already in a timeout', then the answer is: Yes
    var callNow = immediate && !timeout;

    // This is the basic debounce behaviour where you can call this function several times,
    // but it will only execute once, [before or after imposing a delay].
    // Each time the returned function is called, the timer starts over.
    clearTimeout(timeout);

    // Set the new timeout.
    timeout = setTimeout(later, wait);

    // Immediate mode and no wait timer? Execute the function..
    if (callNow) {
      func.apply(context, args);
    }

  };

  // Example of its usage:
  // var myEfficientFn = debounce(function() { codeToBeExecuted(); }, 250);
  // window.addEventListener('resize', myEfficientFn);

}


// Helper: Lock / Unlock Body Scrolling
// ----------------------------------------------------------------------------
function lockBody(pBoolScrollbar, pNumScrollbarWidth) {

  // enable overflow-y: hidden on <html> and <body>
  document.documentElement.setAttribute('data-overflow', 'locked');

  // if necessary, accomodate for scrollbar width
  if (pBoolScrollbar) {
    document.body.style.paddingRight = pNumScrollbarWidth + 'px';
  }

}

function unlockBody(pBoolScrollbar) {

  // disable overflow-y: hidden on <html> and <body>
  document.documentElement.setAttribute('data-overflow', 'scrollable');

  // if necessary, remove scrollbar width styles
  // should be expanded to restore original padding if needed
  if (pBoolScrollbar) {
    document.body.style.paddingRight = '0px'; // pNumOriginalPadding
  }

}


// Helper: Get the firstChild of an element that is not a textNode
// ----------------------------------------------------------------------------
function getFirstChild(el) {

  var firstChild = el.firstChild;

  while (firstChild != null && firstChild.nodeType == 3) { // skip TextNodes
    firstChild = firstChild.nextSibling;
  }

  return firstChild;

  // usage: getFirstChild( document.getElementById('element_id') );

}


/*
// Helper: Get a random number between a min and max range
// ----------------------------------------------------------------------------
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
*/


/*
// secretMail: Add mailto link to home section
// ----------------------------------------------------------------------------
function secretEmail(pStrLocal, pStrDomain, pStrSuffix) {

  var arrLinks = document.getElementsByClassName('email_secret');

  // update email address for each 'email_secret' found
  for (var i = 0; i < arrLinks.length; i++) {

    // do we need to replace the inner text as well?
    if ( arrLinks[i].classList.contains('email_replace') ) {
      arrLinks[i].innerHTML = pStrLocal + '@' + pStrDomain + '.' + pStrSuffix;
    }

    // update the href
    arrLinks[i].setAttribute('href', 'mailto:' + pStrLocal + '@' + pStrDomain + '.' + pStrSuffix);

  }

}
*/


/*
// Helper: Create and Destroy [data-overlay] element
// ----------------------------------------------------------------------------
function createOverlay(childElement, strLabel) {

  // create document fragment
  var docFrag = document.createDocumentFragment();

  lockBody();

  // create empty overlay <div>
  elOverlay = document.createElement('div');

  // set data-overlay attribute as passed strLabel value
  elOverlay.setAttribute('data-overlay', strLabel);

  // append passed child elements
  if (childElement) {
    elOverlay.appendChild(childElement);
  }

  // append the [data-overlay] to the document fragement
  docFrag.appendChild(elOverlay);

  // empty document fragment into <body>
  elBody.appendChild(docFrag);

  fadeIn(elOverlay);

}

function destroyOverlay() {

  if ( classie.has(elHTML, 'ie9') ) {

    unlockBody();
    elBody.removeChild(elOverlay);

  } else {

    fadeOut(elOverlay);

    // listen for CSS transitionEnd before removing the element
    elOverlay.addEventListener(transitionEvent, removeOverlay);

    // add id to overlay element and get it within destory?
    // maybe expand this to be passed an ID, and it can destroy / remove any element?
    function removeOverlay(e) {

      // only listen for the opacity property
      if (e.propertyName == 'opacity') {

        unlockBody();

        // remove elOverlay from <body>
        elBody.removeChild(elOverlay);

        // must remove event listener!
        elOverlay.removeEventListener(transitionEvent, removeOverlay);

      }

    }

  }

}
*/


/*
// Helper: Case insensitive array value
// ----------------------------------------------------------------------------

// Test for String equality ignoring case
// returns Boolean true if both string is equals ignoring case
function equalsIgnoreCase(str1, str2) {
  return str1.toLowerCase() === str2.toLowerCase();
}

// Find the index of a string in an array of string
// returns Number the index of the element in the array or -1 if not found
function indexOfIgnoreCase(array, element) {

  var ret = -1;

  array.some(function(ele, index, array) {
    if ( equalsIgnoreCase(element, ele) ) {
      ret = index;
      return true;
    }
  });

  return ret;

}

// Test the existence of a string in an array of string
// returns Boolean true if found and false if not found
function existsIgnoreCase(array, element) {
  return -1 !== indexOfIgnoreCase(array, element);
}

// convenience method
Array.prototype.indexOfIgnoreCase = function(input) {
  return indexOfIgnoreCase(this, input);
};

// convenience method
Array.prototype.existsIgnoreCase = function(input) {
  return -1 !== this.indexOfIgnoreCase(input);
}

// With the above-mentioned convenience functions, we can do things like:
// console.log( ["Apple", "bOy", "caR"].existsIgnoreCase('boy') ); // returns true
// console.log( ["Apple", "bOy", "caR"].indexOfIgnoreCase('car') ); // returns 2
*/


/*
// Helper: Find Parent Element by Class or Tag Name
// ----------------------------------------------------------------------------
function findParentClass(el, className) {

  while (el && !el.classList.contains(className) ) {
    el = el.parentNode;
  }

  return el;

}

function findParentTag(el, tagName) {

  while (el && el.nodeName !== tagName) {
    el = el.parentNode;
  }

  return el;

}
*/


/*
// Helper: CSS Fade In / Out
// ----------------------------------------------------------------------------
function fadeIn(thisElement) {

  // make the element fully transparent
  // (don't rely on a predefined CSS style... declare this with JS to getComputedStyle)
  thisElement.style.opacity = 0;

  // make sure the initial state is applied
  window.getComputedStyle(thisElement).opacity;

  // set opacity to 1 (CSS transition will handle the fade)
  thisElement.style.opacity = 1;

}

function fadeOut(thisElement) {

  // set opacity to 0 (CSS transition will handle the fade)
  thisElement.style.opacity = 0;

}
*/
