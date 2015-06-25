document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elHTML      = document.documentElement,
		elBody      = document.body,
		// elNavToggle = document.getElementById('nav_toggle'), // added here to unbind click event for desktop
		numWinWidth = window.innerWidth;


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
		navToggle();
		cycleLinkColors();

	}


	// initIsotope: Initialize Isotope.js
	// ----------------------------------------------------------------------------
	function initIsotope() {

		var elIsoContainer = document.getElementById('iso_container');

		// layout Isotope after all images have loaded
		imagesLoaded(elIsoContainer, function(instance) {

			objISO = new Isotope(elIsoContainer, {

				itemSelector: '.iso_brick',
				percentPosition: true,
				masonry: {
					columnWidth: '.iso_sizer',
					gutter: '.iso_gutter'
				}
				// layoutMode: 'fitRows'

			});

			// initalize and pass objISO to categoryDropdown once teady
			categoryDropdown(objISO);

		});

	}


	// categoryDropdown: isoTope Category Dropdown
	// ----------------------------------------------------------------------------
	function categoryDropdown(passedISO) {

		var elNavCat = document.getElementById('nav_categories');

		// check if elNavCat exists...
		if (elNavCat === null) {
			return;
		}

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

		});

		// click outside of element to close dropdown
		document.addEventListener('click', function(e) {

			// if this is not the currently toggled dropdown
			if (e.target != elNavCat) {

				// ignore this event if preventDefault has been called
				if (e.defaultPrevented) {
					return;
				}

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

				var strThisLabel = this.innerHTML,
					strThisFilter = this.getAttribute('data-filter');

				// update both elNavCat 'data-selected' and elNavCatLabel innerHTML
				elNavCat.setAttribute('data-selected', strThisLabel);
				elNavCatLabel.innerHTML = strThisLabel;

				classie.remove(elNavCat, 'toggled'); // remove 'toggled' class from elNavCat

				// swap 'selected' class and redefine elNavLinkSelected as new selection
				classie.remove(elNavLinkSelected, 'selected');
				classie.add(this, 'selected');
				elNavLinkSelected = this;

				// now do all that Isotope shit
				passedISO.arrange({
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

		classie.add(elBody, strCurrentColor);

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

				classie.remove(elBody, strCurrentColor);

				strCurrentColor = arrLinkColors[numCurrentColor];

				classie.add(elBody, strCurrentColor);

			});

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