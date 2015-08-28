document.addEventListener('DOMContentLoaded', function() {


	// Global Variables [kept from becoming window properties]
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
		boolScrollbar     = numScrollbarWidth > 0 ? true : false;


	// onPageLoad: Main Function To Fire on Window Load
	// ----------------------------------------------------------------------------
	function onPageLoad() {

		if (boolScrollbar) {
			elHTML.setAttribute('data-scrollbar', numScrollbarWidth);
		}

		initIsotope();
		finalAnimate();
		fixedHeader();
		navToggle();
		cycleLinkColors();

		// modalYoutube();

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
		// lockBody(boolScrollbar, numScrollbarWidth);

		// it does exist! continue on...
		var elIsoLoader   = document.getElementById('iso_loader'),
			strCurrentCat = elNavCat.getAttribute('data-current'),
			arrIsoLinks   = document.getElementsByClassName('iso_link');

/*
		// modal variables to be defined in createModal()
		var elModal,
			elModalHeader,
			elModalFigure,
			elWrapScroll,
			elModalClose;
*/

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

			// initalize and pass objISO to isoFilterSearch and categoryDropdown once ready
			// isoFilterSearch(objISO);
			categoryDropdown(objISO);

			// IE9 does not support animations...
			if ( !elHTML.classList.contains('ie9') ) {

				// listen for CSS transitionEnd before removing the element
				elIsoLoader.addEventListener(transitionEvent, removeLoader);

				// hide loader
				elIsoLoader.classList.remove('visible');

			}

		});

		// iterate through every .iso_link and attach click event
		for (var i = 0; i < arrIsoLinks.length; i++) {
			isoLinkClick(arrIsoLinks[i]);
		}

		function removeLoader(e) {

			// only listen for the opacity property
			if (e.propertyName == 'opacity') {

				// unlockBody(boolScrollbar);

				elIsoContainer.removeChild(elIsoLoader);
				elIsoLoader.removeEventListener(transitionEvent, removeLoader);

			}

		}

	}


	// isoLinkClick: Register click event for each .iso_link
	// ----------------------------------------------------------------------------
	function isoLinkClick(thisIsoLink) {

		thisIsoLink.addEventListener('click', function(e) {

			e.preventDefault();

			var strThisLink  = thisIsoLink.getAttribute('href'),
				strThisTitle = thisIsoLink.getAttribute('title'),
				strThisID    = thisIsoLink.getAttribute('data-youtube');

			ajaxProjectContent(strThisLink, strThisTitle, strThisID);

		});

	}


	// isoFilterSearch: isoTope filter by search input
	// ----------------------------------------------------------------------------
	function isoFilterSearch(pISO) {

		// FILTER 'TRUE' WILL RETURN EVERYTHING...
		// DO SOMETHING ELSE INSTEAD, LIKE SET THE TAG FILTER TO CURRENT UNTIL A MATCH IS FOUND, THEN:

		// NEEDS TO RESET TAG FILTER / SET CURRENT TAG TO 'ALL'

		// quick search regex
		var elSearchInput = document.getElementById('filter_search'),
			qsRegex;

		// use value of search field to filter
		elSearchInput.addEventListener('input', debounce(function() {

			qsRegex = new RegExp(elSearchInput.value, 'gi');

			// rearrange our isotope bricks using this new filter
			pISO.arrange({
				filter: function(itemElem) {
					return qsRegex ? itemElem.innerHTML.match(qsRegex) : true;
				}
			});

		}, 250));

	}





	// categoryDropdown: isoTope Category Dropdown
	// ----------------------------------------------------------------------------
	function categoryDropdown(pISO) {

		var elNavCatTrigger   = document.getElementById('cat_trigger'),
			elNavCatLabel     = elNavCatTrigger.getElementsByClassName('cat_label')[0],
			elNavLinkCurrent  = elNavCat.getElementsByClassName('cat_current')[0], // elNavCat.querySelector('.cat_current'),
			arrCatLinks       = elNavCat.getElementsByClassName('cat_link'),
			numCatLinksLength = arrCatLinks.length;


		// click elNavCatTrigger to toggle dropdown
		elNavCatTrigger.addEventListener('click', function(e) {

			e.preventDefault(); // url is just a #, do not follow

			elNavCat.classList.toggle('toggled'); // add / remove 'toggled' class from elNavCat

			/*
				if ( elNavCat.classList.contains('toggled') ) {
					elNavCat.classList.remove('toggled')
					unlockBody(boolScrollbar);
				} else {
					elNavCat.classList.add('toggled')
					lockBody(boolScrollbar, numScrollbarWidth);
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

				// unlockBody(boolScrollbar);

				elNavCat.classList.remove('toggled'); // remove 'toggled' class from elNavCat


			}

		});

		// register clickCatLink for each a.cat_link found
		for (var i = 0; i < numCatLinksLength; i++) {
			clickCatLink(arrCatLinks[i], i);
		}

		// close dropdown and filter categories using Isotope
		function clickCatLink(thisCatLink, index) {

			thisCatLink.addEventListener('click', function(e) {

				e.preventDefault(); // prevent navigation to url

				var strThisLabel  = this.innerHTML,
					strThisColor  = this.getAttribute('data-color'),
					strThisFilter = this.getAttribute('data-filter');

				// update elNavCat 'data-color', 'data-current', and elNavCatLabel innerHTML
				elNavCat.setAttribute('data-color', strThisColor);
				elNavCat.setAttribute('data-current', strThisFilter);
				elNavCatLabel.innerHTML = strThisLabel;

				// unlockBody(boolScrollbar);
				elNavCat.classList.remove('toggled'); // remove 'toggled' class from elNavCat

				// swap 'cat_current' class and redefine elNavLinkCurrent as new selection
				elNavLinkCurrent.classList.remove('cat_current');
				elNavLinkCurrent = this.parentNode;
				elNavLinkCurrent.classList.add('cat_current');

				// now do all that Isotope shit
				pISO.arrange({
					filter: strThisFilter
				});

			});

		}



		function positionDropdown() {

			// elNavCatList.style.paddingTop = -numDropdownPos + 'px';

			elNavCatList.style.transform = 'translate3d(0,' + -numDropdownPos + 'px,0)';

			// get currently selected item from array
			// multiply index number by height of row
			// set top position

		}

		// positionDropdown();



/*
		var elNavCatList      = document.getElementById('cat_list'),
			numCatCurrent     = 1, // 'curated' is the default option on page load...
			numCatLinkHeight  = arrCatLinks[0].offsetHeight,
			numDropdownPos    = numCatLinkHeight * numCatCurrent;
*/



	}




// rowHeight = 40px
// rowsVisible = 7
// dropdownHeight = 280px (rowHeight * rowsVisible)
// rowCount = 14 (15 actual rows)
// threshold = Math.floor(rowsVisible / 2)
// topThreshold = first threshold rows [0,1,2]
// bottomThreshold = last threshold rows [14,13,12]
// defaultTopPos = rowHeight * threshold

// if - selected row is within the topThreshold :
	// top = dropdownHeight * topThreshold[currentRow]
// else if - selected row is within the bottomThreshold :
	// top = dropdownHeight * bottomThreshold[currentRow]
// else
	// top = defaultTopPos + 'px'



















/*
	// modalYoutube: All the code for the YouTube modal
	// ----------------------------------------------------------------------------
	function modalYoutube() {

		var elTempModal     = document.getElementById('temp_modal'),
			elToggleCaption = document.getElementById('caption_toggle'),
			elCloseCaption  = document.getElementById('caption_close');

		if (elTempModal === null) {
			return;
		}

		elToggleCaption.addEventListener('click', function(e) {

			e.preventDefault();
			elTempModal.classList.toggle('toggle_credits');

		});

		elCloseCaption.addEventListener('click', function(e) {

			e.preventDefault();
			elTempModal.classList.remove('toggle_credits');

		});

	}
*/









	// Helper: Create modal element for AJAX loaded project content
	// ----------------------------------------------------------------------------
	function createModalYoutube() {

		// console.log('execute createModalYoutube');

		// create the document fragment to hold all of our created elements
		var docFrag = document.createDocumentFragment();

			// definied in initIsotope for scope
			elModal = document.createElement('aside');
			elModal.setAttribute('data-modal', 'hidden');

				var elModalWrap = document.createElement('div');
				elModalWrap.classList.add('wrap_modal');

					elModalHeader = document.createElement('header');
					elModalHeader.classList.add('modal_header', 'video_details');

						// get .wrap_titles from AJAX response, use:
						// elModalHeader.insertBefore('.wrap_titles', elModalHeader.firstChild);
						// to add it before ul.wrap_links

						var elWrapLinks = document.createElement('ul');
						elWrapLinks.classList.add('wrap_links');

						// define contents of links
						var arrLinks = [
								{ id: 'link_credits', title: 'Credits' },
								{ id: 'link_post',    title: 'View Project Page' },
								{ id: 'link_share',   title: 'Share' }
							];

						// iterate through each link and create
						for (var i = 0; i < arrLinks.length; i++) {

							var thisItem = document.createElement('li');
							thisItem.id = arrLinks[i].title;

								var thisLink = document.createElement('a');
								thisLink.href      = '#';
								thisLink.title     = arrLinks[i].title;
								thisLink.innerHTML = arrLinks[i].title;

								thisItem.appendChild(thisLink);

							elWrapLinks.appendChild(thisItem);

						}

						elModalHeader.appendChild(elWrapLinks);

					elModalWrap.appendChild(elModalHeader);

					elModalFigure = document.createElement('figure');
					elModalFigure.classList.add('modal_figure');

						// get .wrap_video from AJAX response, use:
						// elModalFigure.insertBefore('.wrap_video', elModalFigure.firstChild);
						// to add it before figcaption

						var elModalCaption = document.createElement('figcaption');
						elModalCaption.classList.add('modal_caption');

							elWrapScroll = document.createElement('wrap_scroll');
							elWrapScroll.classList.add('wrap_scroll');

								// get .video_credits from AJAX response, use:
								// elWrapScroll.insertBefore('.video_credits', elWrapScroll.firstChild);
								// to add it before figcaption

							elModalClose = document.createElement('a');
							elModalClose.classList.add('wrap_svg', 'wrap_ui-arrow');
							elModalClose.href = '#';
							elModalClose.title = 'Close Credits';

								var elCloseSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
								elCloseSVG.setAttribute('viewBox', '0 0 64 64'); // elCloseSVG.setAttributeNS('viewBox', '0 0 64 64');

									var elCloseUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
									elCloseUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#ui_arrow');

									elCloseSVG.appendChild(elCloseUse);

								elModalClose.appendChild(elCloseSVG);

							elModalCaption.appendChild(elModalClose);

						elModalFigure.appendChild(elModalCaption);

					elModalWrap.appendChild(elModalFigure);

				elModal.appendChild(elModalWrap);

			docFrag.appendChild(elModal);

		// finally, empty contents of document fragment into <body>
		elBody.appendChild(docFrag);

		// is there a way to destroy the document fragment once we are done with it?

		// we have now added the modal to the page, we do not need to create it again
		// boolCreateModal = false;

		// toggle modal visibility now that it is in the document (or should we wait until AJAX content is loaded?) ... (should we fade in with JS instead?)
		// elModal.setAttribute('data-modal', 'visible');

	}


	// ajaxProjectContent: Get project content from single post page
	// ----------------------------------------------------------------------------
	function ajaxProjectContent(pLinkHREF, pLinkTitle, pLinkID) {

		var ajaxXHR       = new XMLHttpRequest(),
			docFrag       = document.createDocumentFragment(),
			elPlaceholder = document.createElement('div');

		// if modal has not been created:
			// create modal
			// become aware of its element variables

		createModalYoutube();

		// suspend modal it with a loading animation until our AJAX content has been added and is ready

		ajaxXHR.onload = function() {

			// successful status should only ever be 200... but be broad about it (why? not sure...)
			if (ajaxXHR.status >= 200 && ajaxXHR.status < 400) {

				// append fetched AJAX content to placeholder for insertion into document fragment
				elPlaceholder.innerHTML = ajaxXHR.responseText;

				// will need to be destroyed or emptied!
				docFrag.appendChild(elPlaceholder);

				// grab the content we will need to place in our document
				var ajaxVideo   = elPlaceholder.getElementsByClassName('wrap_video')[0],
					ajaxTitles  = elPlaceholder.getElementsByClassName('wrap_titles')[0],
					ajaxCredits = elPlaceholder.getElementsByClassName('video_credits')[0];

				console.log(ajaxVideo);

				elModalFigure.insertBefore(ajaxVideo, elModalFigure.firstChild);
				// elModalHeader.insertBefore(ajaxTitles, elModalHeader.firstChild);
				// elWrapScroll.insertBefore('.video_credits', elWrapScroll.firstChild);

				// li.link_post > a[href] = pLinkHREF
				// li.link_share > a[href] = 'https://twitter.com/home?status=' + encodeURI(pLinkTitle) + '%20http%3A//y2u.be/' + pLinkID

			} else {

				console.log('We reached our target server, but it returned an error. Status was not between 200 and 400.');

			}

		};

		ajaxXHR.onerror = function() {
			console.log('There was a connection error of some sort');
		};

		// open the passed URL and 'send'
		ajaxXHR.open('GET', pLinkHREF);
		ajaxXHR.send();

	}






/*
	// toggleModal: Open & Close modal windows
	// ----------------------------------------------------------------------------
	function toggleModal() {

		var arrModalOpen   = document.getElementsByClassName('modal_open'),
			arrModalClose  = document.getElementsByClassName('modal_close'),
			elTargetModal;

		// check if a.modal_open exists and is not empty
		if (typeof arrModalOpen !== 'undefined' && arrModalOpen.length > 0) {

			for (var i = 0; i < arrModalOpen.length; i++) {
				arrModalOpen[i].addEventListener('click', openModal, false);
			}

			for (var i = 0; i < arrModalClose.length; i++) {
				arrModalClose[i].addEventListener('click', closeModal, false);
			}

		} else {

			return; // array not found or empty... exit function

		}

		function openModal(e) {

			var dataTargetModal = this.getAttribute('href').substring(1); // capture the href of the clicked element, remove the # prefix

			elTargetModal = document.getElementById(dataTargetModal); // get the modal we need to open

			// create overlay element and fade in modal
			createOverlay(false, 'modal');
			elTargetModal.setAttribute('data-modal', 'active');

			e.preventDefault();

			document.addEventListener('click', documentClick);

		}

		function closeModal(e) {

			var dataTargetModal = this.getAttribute('href').substring(1); // capture the href of the clicked element, remove the # prefix

			elTargetModal = document.getElementById(dataTargetModal); // get the modal we need to open

			// once we have found the desired parent element, hide that modal
			elTargetModal.setAttribute('data-modal', 'inactive');
			destroyOverlay();

			e.preventDefault();

			document.removeEventListener('click', documentClick);

		}

		function documentClick(e) {

			// if this is not the currently toggled dropdown
			if ( e.target === elOverlay ) {

				// ignore this event if preventDefault has been called
				if (e.defaultPrevented) {
					return;
				}

				// once we have found the desired parent element, hide that modal (copied from closeModal)
				elTargetModal.setAttribute('data-modal', 'inactive');
				destroyOverlay();

			}

		}

	}
*/





















	// finalAnimate: Inform the document when we have finished our loading animations
	// ----------------------------------------------------------------------------
	function finalAnimate() {

		var elFooter = document.getElementById('page_footer');

		elFooter.addEventListener(animationEvent, applyReadyState);

		function applyReadyState() {

			// elHTML.classList.add('ready');
			elHTML.setAttribute('data-ready', 'ready');
			elFooter.removeEventListener(animationEvent, applyReadyState);

		}

	}


	// fixedHeader: Decrease Primary Nav Padding Top On Scroll
	// ----------------------------------------------------------------------------
	function fixedHeader() {

		var numNavTravel = 60; // arbitrary number based on what feels good

		if (numWinWidth >= 768) {

			if (numScrollPos >= numNavTravel) {
				elNavPrimary.classList.add('scrolled');
			} else {
				elNavPrimary.classList.remove('scrolled');
			}

		}

	}


	// navToggle: Toggle mobile navigation
	// ----------------------------------------------------------------------------
	function navToggle() {

		var elNavPrimaryTrigger = document.getElementById('nav_toggle');

		elNavPrimaryTrigger.addEventListener('click', function(e) {

			e.preventDefault();

			// since we are removing the 'toggled' class if window is < 768...
			// we cannot rely on 'toggle' to switch our nav class
			if ( elNavPrimary.classList.contains('toggled') ) {

				elNavPrimary.classList.remove('toggled');
				unlockBody(boolScrollbar);

			} else {

				window.scrollTo(0,0); // scroll to top of document

				elNavPrimary.classList.add('toggled');
				lockBody(boolScrollbar, numScrollbarWidth);

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
				if ( e.target.classList.contains('iso_link') ) {

					// we only want to cycle color classes on 'rainbow' categories,
					// so exit the function if elNavCat is not 'data-color' => 'random'
					if ( elNavCat.getAttribute('data-color') != 'random' ) {
						return;
					}

				}

				// redfine strCurrentColor as current color iteration
				strCurrentColor = 'color_' + arrLinkColors[numCurrentColor];

				// apply the 'color_*' class to 'this' hovered link
				thisPageLink.classList.add(strCurrentColor);

			});

		}

		// function to iterate through arrLinkColors and check if the arguement contains the class
		function checkForClass(pThisPageLink) {

			for (var i = 0; i < arrLinkColors.length; i++) {

				if ( pThisPageLink.classList.contains('color_' + arrLinkColors[i]) ) {
					pThisPageLink.classList.remove('color_' + arrLinkColors[i]);
					return;
				}

			}

		}

	}


	// Window Events
	// ----------------------------------------------------------------------------
	window.addEventListener('resize', debounce(function() {

		// re-measure window width on resize
		numWinWidth = window.innerWidth;

		if (numWinWidth >= 768) {

			// remove 'toggled' class from nav_primary and restore body scrolling
			elNavPrimary.classList.remove('toggled');
			unlockBody(boolScrollbar);

		} else {

			elNavPrimary.classList.remove('scrolled');

		}

	}, 500));

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