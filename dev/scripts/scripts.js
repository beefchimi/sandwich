document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elHTML      = document.documentElement,
		elBody      = document.body;

	var numWinWidth       = window.innerWidth;

/*
	// window measurement variables
	var numWinWidth       = window.innerWidth,
		numClientWidth    = document.documentElement.clientWidth,
		numScrollbarWidth = numWinWidth - numClientWidth,
		hasScrollbar      = numScrollbarWidth > 0 ? true : false;
*/


/*
	// Helper: Lock / Unlock Body Scrolling
	// ----------------------------------------------------------------------------
	function lockBody() {

		// get current scroll position
		// numScrollPos = window.pageYOffset;

		// enable overflow-y: hidden on <body>
		elHTML.setAttribute('data-overflow', 'locked');

		// lock scrolling by setting explicit height on <body>
		// elBody.style.height = numWindowHeight + 'px';

		// set a negative margin on the content wrapper based on current scroll position
		// document.getElementById('test-wrap').style.marginTop = -numScrollPos + 'px';

		// if necessary, accomodate for scrollbar width
		if (hasScrollbar) {
			elBody.style.paddingRight = numScrollbarWidth + 'px';
		}

	}

	function unlockBody() {

		// disable overflow-y: hidden on <body>
		elHTML.setAttribute('data-overflow', 'scrollable');

		// restore scrolling to document by removing locked <body> height
		// elBody.removeAttribute('style');

		// remove negative margin on content wrapped
		// document.getElementById('test-wrap').removeAttribute('style');

		// to prevent window from returning to 0, apply scroll position
		// window.scrollTo(0, numScrollPos);

		// if necessary, remove scrollbar width styles
		// should be expanded to restore original padding if needed
		if (hasScrollbar) {
			elBody.style.paddingRight = '0px';
		}

	}
*/


/*
	// secretMail: Add mailto link to home section
	// ----------------------------------------------------------------------------
	function secretMail() {

		var mailLink = document.getElementById('contact'),
			prefix    = 'mailto',
			local    = 'curtis',
			domain   = 'dulmage',
			suffix    = 'me';

		mailLink.setAttribute('href', prefix + ':' + local + '@' + domain + '.' + suffix);

	}
*/


	// onPageLoad: Main Function To Fire on Window Load
	// ----------------------------------------------------------------------------
	function onPageLoad() {

		initIsotope(); // not checking if elements exists... so only load on pages that use ISOTOPE
		navToggle();
		cycleLinkColors();

	}


	// initIsotope: Initialize Isotope.js
	// ----------------------------------------------------------------------------
	function initIsotope() {

		// not checking if elements exists... so only load on pages that use ISOTOPE

		var elIsoContainer = document.getElementById('iso_container'),
			elIsoLoader    = document.getElementById('iso_loader'),
			elNavCat       = document.getElementById('nav_categories'),
			strCurrentCat  = elNavCat.getAttribute('data-selected');

		// layout Isotope after all images have loaded
		imagesLoaded(elIsoContainer, function(instance) {

			objISO = new Isotope(elIsoContainer, {

				itemSelector: '.iso_brick',
				percentPosition: true,
				masonry: {
					columnWidth: '.iso_sizer',
					gutter: '.iso_gutter'
				},
				filter: strCurrentCat

			});

			// initalize and pass objISO to categoryDropdown once teady
			categoryDropdown(objISO, elNavCat);

			// IE9 does not support animations...
			if ( !classie.has(elHTML, 'ie9') ) {

				// listen for CSS transitionEnd before removing the element
				elIsoLoader.addEventListener(transitionEvent, removeLoader);

				// hide loader
				classie.remove(elIsoLoader, 'visible');

			}

		});

		function removeLoader(e) {

			// only listen for the opacity property
			if (e.propertyName == 'opacity') {

				// elBody not working for some reason
				// elIsoLoader.parentNode.removeChild(elIsoLoader);
				elIsoContainer.removeChild(elIsoLoader);
				elIsoLoader.removeEventListener(transitionEvent, removeLoader);

				console.log('loader removed');

			}

		}

	}


	// categoryDropdown: isoTope Category Dropdown
	// ----------------------------------------------------------------------------
	function categoryDropdown(pISO, pNavCat) {

		// it does exist! define our remaining variables
		var elNavCatTrigger   = document.getElementById('cat_trigger'),
			elNavCatLabel     = elNavCatTrigger.getElementsByClassName('cat_label')[0],
			elNavLinkSelected = pNavCat.querySelector('.selected'),
			arrCatLinks       = pNavCat.getElementsByClassName('cat_link'),
			numCatLinksLength = arrCatLinks.length;

		// click elNavCatTrigger to toggle dropdown
		elNavCatTrigger.addEventListener('click', function(e) {

			e.preventDefault(); // url is just a #, do not follow

			classie.toggle(pNavCat, 'toggled'); // add / remove 'toggled' class from pNavCat

		});

		// click outside of element to close dropdown
		document.addEventListener('click', function(e) {

			// if this is not the currently toggled dropdown
			if (e.target != pNavCat) {

				// ignore this event if preventDefault has been called
				if (e.defaultPrevented) {
					return;
				}

				classie.remove(pNavCat, 'toggled'); // remove 'toggled' class from pNavCat

			}

		});

		// register clickCatLink for each a.cat_link found
		for (var i = 0; i < numCatLinksLength; i++) {
			clickCatLink(arrCatLinks[i]);
		}

		// close dropdown and filter categories using Isotope
		function clickCatLink(thisCatLink) {

			thisCatLink.addEventListener('click', function(e) {

				e.preventDefault(); // prevent navigation to url

				var strThisLabel  = this.innerHTML,
					strThisFilter = this.getAttribute('data-filter');

				// update both pNavCat 'data-selected' and elNavCatLabel innerHTML
				pNavCat.setAttribute('data-selected', strThisFilter);
				elNavCatLabel.innerHTML = strThisLabel;

				classie.remove(pNavCat, 'toggled'); // remove 'toggled' class from pNavCat

				// swap 'selected' class and redefine elNavLinkSelected as new selection
				classie.remove(elNavLinkSelected, 'selected');
				classie.add(this, 'selected');
				elNavLinkSelected = this;

				// now do all that Isotope shit
				pISO.arrange({
					filter: strThisFilter
				});

			});

		}

	}


	// navToggle: Toggle Mobile Navigation
	// ----------------------------------------------------------------------------
	function navToggle() {


		var // elNavPrimary        = document.getElementById('nav_primary'),
			elNavPrimaryTrigger = document.getElementById('nav_toggle');


		elNavPrimaryTrigger.addEventListener('click', function(e) {

			e.preventDefault();

			classie.toggle(this, 'toggled');

			// classie.toggle(elNavPrimary, 'toggled');

/*
			if ( classie.has(this, 'toggled') ) {

				classie.remove(this, 'toggled');
				unlockBody();

			} else {

				classie.add(this, 'toggled');
				lockBody();

			}
*/

		});


	}


	// randomLinkColors: Randomly select from an array of colours on mouseenter of any link
	// ----------------------------------------------------------------------------
/*
	function randomLinkColors() {

		var elLinkTest      = document.getElementById('link_test'),
			arrLinkColors   = ['links_red', 'links_orange', 'links_yellow', 'links_aqua', 'links_cyan'],
			numColorsLength = arrLinkColors.length - 1,
			numCurrentColor = getRandomInt(0, numColorsLength),
			strCurrentColor = arrLinkColors[numCurrentColor];

		classie.add(elBody, strCurrentColor);

		window.setInterval(function() {

			classie.remove(elBody, strCurrentColor);

			numCurrentColor = getRandomInt(0, numColorsLength);
			strCurrentColor = arrLinkColors[numCurrentColor];

			classie.add(elBody, strCurrentColor);

		}, 1000);

	}
*/

	// cycleLinkColors: Cycle through an array of colours on mouseenter of any link
	// ----------------------------------------------------------------------------
	function cycleLinkColors() {

		// currently assumes there is at least 1 link on every page...

		var arrPageLinks    = document.getElementsByTagName('a'),
			arrLinkColors   = ['links_red', 'links_orange', 'links_yellow', 'links_aqua', 'links_cyan'],
			numPageLinks    = arrPageLinks.length,
			numColorsLength = arrLinkColors.length - 1,
			numCurrentColor = 0,
			strCurrentColor = arrLinkColors[numCurrentColor];

		// classie.add(elBody, strCurrentColor);
		// everything must have a default colour

		// iterate through each <a href> and bind the mouseenter
		for (var i = 0; i < numPageLinks; i++) {
			linkMouseEnter(arrPageLinks[i]);
		}

		// function for mouseenter
		function linkMouseEnter(thisPageLink) {

			thisPageLink.addEventListener('mouseenter', function(e) {

				if (numCurrentColor >= numColorsLength) {
					numCurrentColor = 0;
				} else {
					numCurrentColor++;
				}

				// classie.remove(elBody, strCurrentColor);
				checkForClass(thisPageLink);

				strCurrentColor = arrLinkColors[numCurrentColor];

				// classie.add(elBody, strCurrentColor);
				classie.add(thisPageLink, strCurrentColor);

			});

		}

		// function to iterate through arrLinkColors and check is the arguement contains the class
		function checkForClass(pThisPageLink) {

			for (var i = 0; i < arrLinkColors.length; i++) {

				if ( classie.has(pThisPageLink, arrLinkColors[i]) ) {
					classie.remove(pThisPageLink, arrLinkColors[i]);
					return;
				}

			}

		}

	}



/*
	// Window Events
	// ----------------------------------------------------------------------------
	window.addEventListener('resize', function(e) {

		// do not fire resize event for every pixel... wait until finished
		waitForFinalEvent(function() {

			// re-measure window width on resize
			numWinWidth = window.innerWidth;

		}, 500, 'unique string');

	}, false);
*/



	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	onPageLoad();


}, false);