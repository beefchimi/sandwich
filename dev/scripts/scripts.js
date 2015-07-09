document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elHTML       = document.documentElement,
		elBody       = document.body,
		elNavPrimary = document.getElementById('nav_primary'), // required to be global
		elNavCat     = document.getElementById('nav_categories'); // required to be global

	// window measurement variables
	var numScrollPos      = window.pageYOffset,
		numWinWidth       = window.innerWidth,
		numClientWidth    = document.documentElement.clientWidth,
		numScrollbarWidth = numWinWidth - numClientWidth,
		hasScrollbar      = numScrollbarWidth > 0 ? true : false;


	// Helper: Lock / Unlock Body Scrolling
	// ----------------------------------------------------------------------------
	function lockBody() {

		// enable overflow-y: hidden on <body>
		elHTML.setAttribute('data-overflow', 'locked');

		// if necessary, accomodate for scrollbar width
		if (hasScrollbar) {
			elBody.style.paddingRight = numScrollbarWidth + 'px';
		}

	}

	function unlockBody() {

		// disable overflow-y: hidden on <body>
		elHTML.setAttribute('data-overflow', 'scrollable');

		// if necessary, remove scrollbar width styles
		// should be expanded to restore original padding if needed
		if (hasScrollbar) {
			elBody.style.paddingRight = '0px';
		}

	}


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

		initIsotope();
		finalAnimate();
		fixedHeader();
		navToggle();
		cycleLinkColors();

	}


	// initIsotope: Initialize Isotope.js
	// ----------------------------------------------------------------------------
	function initIsotope() {

		var elIsoContainer = document.getElementById('iso_container');

		// check if iso_container exists
		if (elIsoContainer == null) {
			return;
		}

		// lock body on initial page load
		// (should be doing this only if images are NOT loaded)
		// lockBody();

		// it does exist! continue on...
		var elIsoLoader   = document.getElementById('iso_loader'),
			strCurrentCat = elNavCat.getAttribute('data-selected');

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

			// initalize and pass objISO to categoryDropdown once ready
			categoryDropdown(objISO);

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

				// unlockBody();

				elIsoContainer.removeChild(elIsoLoader);
				elIsoLoader.removeEventListener(transitionEvent, removeLoader);

			}

		}

	}


	// categoryDropdown: isoTope Category Dropdown
	// ----------------------------------------------------------------------------
	function categoryDropdown(pISO) {

		// it does exist! define our remaining variables
		var elNavCatTrigger   = document.getElementById('cat_trigger'),
			elNavCatLabel     = elNavCatTrigger.getElementsByClassName('cat_label')[0],
			elNavLinkSelected = elNavCat.querySelector('.selected'),
			arrCatLinks       = elNavCat.getElementsByClassName('cat_link'),
			numCatLinksLength = arrCatLinks.length;

		// click elNavCatTrigger to toggle dropdown
		elNavCatTrigger.addEventListener('click', function(e) {

			e.preventDefault(); // url is just a #, do not follow

			classie.toggle(elNavCat, 'toggled'); // add / remove 'toggled' class from elNavCat

/*
			if ( classie.has(elNavCat, 'toggled') ) {

				classie.remove(elNavCat, 'toggled');
				unlockBody();

			} else {

				classie.add(elNavCat, 'toggled');
				lockBody();

			}
*/

		});

		// click outside of element to close dropdown
		document.addEventListener('click', function(e) {

			// if this is not the currently toggled dropdown
			if (e.target != elNavCat) {

				// ignore this event if preventDefault has been called
				if (e.defaultPrevented) {
					return;
				}

				// unlockBody();

				classie.remove(elNavCat, 'toggled'); // remove 'toggled' class from elNavCat

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
					strThisColor  = this.getAttribute('data-color'),
					strThisFilter = this.getAttribute('data-filter');

				// update elNavCat 'data-color', 'data-selected', and elNavCatLabel innerHTML
				elNavCat.setAttribute('data-color', strThisColor);
				elNavCat.setAttribute('data-selected', strThisFilter);
				elNavCatLabel.innerHTML = strThisLabel;

				// unlockBody();
				classie.remove(elNavCat, 'toggled'); // remove 'toggled' class from elNavCat

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


	// finalAnimate: Inform the document when we have finished our loading animations
	// ----------------------------------------------------------------------------
	function finalAnimate() {

		// watching for #nav_twitter, which only animates >= 768px

		var elNavTwitter = document.getElementById('nav_twitter');

		elNavTwitter.addEventListener(animationEvent, applyReadyState);

		function applyReadyState() {

			classie.add(elHTML, 'ready');
			elNavTwitter.removeEventListener(animationEvent, applyReadyState);

			console.log('animations have ended');

		}

	}


	// fixedHeader: Decrease Primary Nav Padding Top On Scroll
	// ----------------------------------------------------------------------------
	function fixedHeader() {

		var numNavTravel = 60; // arbitrary number based on what feels good

		if (numWinWidth >= 768) {

			if (numScrollPos >= numNavTravel) {
				classie.add(elNavPrimary, 'scrolled');
			} else {
				classie.remove(elNavPrimary, 'scrolled');
			}

		}

	}


	// navToggle: Toggle Mobile Navigation
	// ----------------------------------------------------------------------------
	function navToggle() {

		var elNavPrimaryTrigger = document.getElementById('nav_toggle');

		elNavPrimaryTrigger.addEventListener('click', function(e) {

			e.preventDefault();

			// since we are removing the 'toggled' class if window is < 768...
			// we cannot rely on classie.toggle to switch our nav class
			if ( classie.has(elNavPrimary, 'toggled') ) {

				classie.remove(elNavPrimary, 'toggled');
				unlockBody();

			} else {

				window.scrollTo(0,0);

				classie.add(elNavPrimary, 'toggled');
				lockBody();

			}

		});

	}


	// cycleLinkColors: Cycle through an array of colours on mouseenter of any link
	// ----------------------------------------------------------------------------
	function cycleLinkColors() {

		// currently assumes there is at least 1 link on every page...

		var arrPageLinks    = document.getElementsByClassName('color_random'),
			arrLinkColors   = ['red', 'orange', 'yellow', 'aqua', 'cyan'],
			numPageLinks    = arrPageLinks.length,
			numColorsLength = arrLinkColors.length - 1,
			numCurrentColor = 0,
			strCurrentColor = 'color_' + arrLinkColors[numCurrentColor];

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

				checkForClass(thisPageLink);

				// if this is an isotope block...
				if ( classie.has(e.target, 'iso_link') ) {

					// we only want to cycle color classes on 'rainbow' categories,
					// so exit the function if elNavCat is not 'data-color' => 'random'
					if ( elNavCat.getAttribute('data-color') != 'random' ) {
						return;
					}

				}

				// redfine strCurrentColor as current color iteration
				strCurrentColor = 'color_' + arrLinkColors[numCurrentColor];

				// apply the 'color_*' class to 'this' hovered link
				classie.add(thisPageLink, strCurrentColor);

			});

		}

		// function to iterate through arrLinkColors and check if the arguement contains the class
		function checkForClass(pThisPageLink) {

			for (var i = 0; i < arrLinkColors.length; i++) {

				if ( classie.has(pThisPageLink, 'color_' + arrLinkColors[i]) ) {
					classie.remove(pThisPageLink, 'color_' + arrLinkColors[i]);
					return;
				}

			}

		}

	}


	// Window Events
	// ----------------------------------------------------------------------------
	window.addEventListener('resize', function(e) {

		// do not fire resize event for every pixel... wait until finished
		waitForFinalEvent(function() {

			// re-measure window width on resize
			numWinWidth = window.innerWidth;

			if (numWinWidth >= 768) {

				// remove 'toggled' class from nav_primary and restore body scrolling
				classie.remove(elNavPrimary, 'toggled');
				unlockBody();

			} else {
				classie.remove(elNavPrimary, 'scrolled');
			}

		}, 500, 'unique string');

	}, false);

	window.addEventListener('scroll', function(e) {

		// re-measure the window scroll distance
		numScrollPos = window.pageYOffset;

		// functions that require scroll data
		fixedHeader();

	});


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	onPageLoad();


}, false);