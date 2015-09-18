document.addEventListener('DOMContentLoaded', function() {


	// Global Variables [kept from becoming window properties]
	// ----------------------------------------------------------------------------
	var elHTML       = document.documentElement,
		elBody       = document.body,
		elNavPrimary = document.getElementById('nav_primary'), // required to be global
		elNavCat     = document.getElementById('nav_categories'), // required to be global
		boolPagiRun  = false,
		objISO;

	// window measurement variables
	var numScrollPos      = window.pageYOffset,
		numWinWidth       = window.innerWidth,
		numClientWidth    = document.documentElement.clientWidth,
		numScrollbarWidth = numWinWidth - numClientWidth,
		boolScrollbar     = numScrollbarWidth > 0 ? true : false;

	// modal variables
	var elModal,
		elModalContent,
		elModalHeader,
		elModalTitle,
		elModalClient,
		elWrapVideo,
		elWrapScroll,
		elCaptionClose,
		elModalLinkClose,
		elModalLinkCredits,
		elModalLinkProject,
		elModalLinkShare,
		elModalLoader,
		boolModalCreated = false,
		boolErrorCreated = false,
		boolRetryRequest = false;


	// onPageLoad: Main Function To Fire on Window Load
	// ----------------------------------------------------------------------------
	function onPageLoad() {

/*
		if (boolScrollbar) {
			// store scrollbar width in markup in hopes that CSS can one day utilize it...
			elHTML.setAttribute('data-scrollbar', numScrollbarWidth);
		}
*/

		initIsotope();
		finalAnimate();
		fixedHeader();
		navToggle();
		cycleLinkColors();
		paginationEllipsis(7); // will not run if window width is above 768px

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

		// layout Isotope after all images have loaded
		imagesLoaded(elIsoContainer, function(instance) {

			objISO = new Isotope(elIsoContainer, {

				itemSelector: '.iso_brick',
				percentPosition: true,
				masonry: {
					columnWidth: '.iso_brick',
					gutter: '.iso_gutter'
				},
				filter: strCurrentCat

			});

			// initalize and pass objISO to isoFilterSearch and categoryDropdown once ready
			isoFilterSearch(objISO);
			categoryDropdown(objISO);

			// IE9 does not support animations...
			if ( !elHTML.classList.contains('ie9') ) {

				// listen for CSS transitionEnd before removing the element
				elIsoLoader.addEventListener(transitionEvent, removeLoader);

				// hide loader
				elIsoLoader.classList.remove('visible');

			}

		});

		// iterate through every .iso_link...
		// and attach click event for launching the YouTube modal
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


	// isoLinkClick: Register click event for each .iso_link
	// ----------------------------------------------------------------------------
	function isoLinkClick(thisIsoLink) {

		thisIsoLink.addEventListener('click', function(e) {

			e.preventDefault();

			var strThisLink   = thisIsoLink.getAttribute('href'),
				strThisTitle  = thisIsoLink.getAttribute('title'),
				strThisClient = thisIsoLink.getAttribute('data-client'),
				strThisID     = thisIsoLink.getAttribute('data-youtube');

			ajaxProjectContent(strThisLink, strThisTitle, strThisClient, strThisID);

		});

	}


	// ajaxProjectContent: Get project content from projects single post page
	// ----------------------------------------------------------------------------
	function ajaxProjectContent(pLinkHREF, pLinkTitle, pLinkClient, pLinkID) {

		var ajaxXHR      = new XMLHttpRequest(),
			elAjaxHolder = document.createElement('div');

		// as long as we have not created the modal yet
		if (!boolModalCreated) {
			// create all of our empty modal elements, append it to elBody,
			// and attach the correct references for our undefined modal variables
			createModalYoutube();
		}

		showModal(); // lock body scrolling and reveal modal

		ajaxXHR.onload = function() {

			// successful status should only ever be 200... but be broad about it (why? not sure...)
			if (ajaxXHR.status >= 200 && ajaxXHR.status < 400) {

				// lets tell the modal of our success
				elModal.setAttribute('data-ajax', 'success');

				// append fetched AJAX content to placeholder...
				// this is the only way we can traverse the fetched content for insertion into the document
				elAjaxHolder.innerHTML = ajaxXHR.responseText;

				// grab the content we will need to place in our document
				var ajaxVideo   = elAjaxHolder.getElementsByTagName('iframe')[0],
					ajaxCredits = elAjaxHolder.getElementsByClassName('video_credits')[0];

				// insert our fetched content in all the right places
				elWrapVideo.appendChild(ajaxVideo);
				elWrapScroll.insertBefore(ajaxCredits, elWrapScroll.firstChild);

				// pass in our project title and client name
				elModalTitle.innerHTML  = '&ldquo;' + pLinkTitle + '&rdquo;';
				elModalClient.innerHTML = pLinkClient;

				// attached our link destinations
				elModalLinkProject.href = pLinkHREF;
				elModalLinkShare.href   = 'https://twitter.com/home?status=' + encodeURI(pLinkTitle) + '%20http%3A//y2u.be/' + pLinkID;

				// empty out contents of elAjaxHolder...
				// this element is never appended to the document, so garbage collection can take care of it if / when needed
				elAjaxHolder.innerHTML = '';

				// start listening to modal_loader transition and remove visible class to fade out element
				hideModalLoader();

				// allow closing of modal only if iFrame has loaded?
				// or maybe we leave the loader until the video has loaded?
				// ajaxVideo.onload = function() { afterLoading(); }

			} else {

				ajaxFailed(pLinkHREF, pLinkTitle, pLinkClient, pLinkID); // we reached our target server, but it returned an error... status was not between 200 and 400

			}

		};

		ajaxXHR.onerror = function() {
			ajaxFailed(pLinkHREF, pLinkTitle, pLinkClient, pLinkID); // there was a connection error of some sort...
		};

		// open the passed URL and 'send'
		ajaxXHR.open('GET', pLinkHREF);
		ajaxXHR.send();

	}


	// createModalYoutube: Create modal element for AJAX loaded project content
	// ----------------------------------------------------------------------------
	function createModalYoutube() {

		// create the document fragment to hold all of our created elements
		var docFrag = document.createDocumentFragment();

			elModal = document.createElement('aside'); // created as undefined global variable for scope
			elModal.setAttribute('data-modal', ''); // if using animate: does not require 'hidden' yet... opacity will be 0 default.
			elModal.setAttribute('data-content', 'empty'); // will be set to 'loaded' once AJAX content has been inserted
			elModal.setAttribute('data-ajax', ''); // will be set to either 'success' or 'error' based on the AJAX response

				elModalContent = document.createElement('div'); // created as undefined global variable for scope
				elModalContent.className = 'modal_content';

					elModalHeader = document.createElement('header'); // created as undefined global variable for scope
					elModalHeader.className = 'modal_header video_details';

						var elWrapTitles = document.createElement('div');
						elWrapTitles.className = 'wrap_titles';

							elModalTitle = document.createElement('h3');
							elModalTitle.className = 'title_video truncate';
							elWrapTitles.appendChild(elModalTitle);

							elModalClient = document.createElement('h3');
							elModalClient.className = 'title_client truncate';
							elWrapTitles.appendChild(elModalClient);

						elModalHeader.appendChild(elWrapTitles);

						var elWrapLinks = document.createElement('ul');
						elWrapLinks.className = 'wrap_links';

							// define contents of links
							var arrLinks = [
									{ id: 'close',   title: 'Close project' },
									{ id: 'credits', title: 'Credits' },
									{ id: 'project', title: 'View Project Page' },
									{ id: 'share',   title: 'Share' }
								];

							// iterate through each link and create a <li> and <a>
							for (var i = 0; i < arrLinks.length; i++) {

								var thisItem = document.createElement('li');
								thisItem.className = 'item_link-' + arrLinks[i].id;

									var thisLink = document.createElement('a');
									thisLink.href  = '#';
									// thisLink.id    = 'link_' + arrLinks[i].id;
									thisLink.title = arrLinks[i].title;

									// if this is the 'close' link...
									if (i === 0) {

										thisLink.className = 'wrap_svg wrap_ui-close';

										var elModalCloseText = document.createElement('span');
										elModalCloseText.innerHTML = 'Close Project';

										thisLink.appendChild(elModalCloseText);

										var elModalCloseSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
										elModalCloseSVG.setAttribute('viewBox', '0 0 64 64');
										elModalCloseSVG.className = 'ui_close';

											var elModalCloseUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
											elModalCloseUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#ui_close');

											elModalCloseSVG.appendChild(elModalCloseUse);

										thisLink.appendChild(elModalCloseSVG);

										// define global variable as this 'close' link
										elModalLinkClose = thisLink;

									// the rest of the links do not need any special treatment
									} else {

										thisLink.innerHTML = arrLinks[i].title;

										// if this is the 'credits' link
										if (i === 1) {
											elModalLinkCredits = thisLink;
										// if this is the 'single project page' link
										} else if (i === 2) {
											elModalLinkProject = thisLink;
										// if this is the 'tweet / share video' link
										} else if (i === 3) {
											elModalLinkShare = thisLink;
										}

									}

									thisItem.appendChild(thisLink);

								elWrapLinks.appendChild(thisItem);

							}

						elModalHeader.appendChild(elWrapLinks);

					elModalContent.appendChild(elModalHeader);

					var elModalFigure = document.createElement('figure');
					elModalFigure.className = 'modal_figure';

						elWrapVideo = document.createElement('div'); // created as undefined global variable for scope
						elWrapVideo.className = 'wrap_video';

							// get iframe from AJAX response and elWrapVideo.appendChild

						elModalFigure.appendChild(elWrapVideo);

						var elModalCaption = document.createElement('figcaption');
						elModalCaption.className = 'modal_caption';

							elWrapScroll = document.createElement('div'); // created as undefined global variable for scope
							elWrapScroll.className = 'wrap_scroll';

								// get .video_credits from AJAX response and elWrapScroll.insertBefore('.video_credits', elWrapScroll.firstChild);

								elCaptionClose = document.createElement('a'); // created as undefined global variable for scope
								elCaptionClose.className = 'wrap_svg wrap_ui-arrow';
								elCaptionClose.href = '#';
								elCaptionClose.title = 'Close Credits';

									var elCaptionCloseSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
									elCaptionCloseSVG.setAttribute('viewBox', '0 0 64 64');
									elCaptionCloseSVG.className = 'ui_arrow';

										var elCaptionCloseUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
										elCaptionCloseUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#ui_arrow');

										elCaptionCloseSVG.appendChild(elCaptionCloseUse);

									elCaptionClose.appendChild(elCaptionCloseSVG);

								elWrapScroll.appendChild(elCaptionClose);

							elModalCaption.appendChild(elWrapScroll);

						elModalFigure.appendChild(elModalCaption);

					elModalContent.appendChild(elModalFigure);

				elModal.appendChild(elModalContent);

				elModalLoader = document.createElement('div'); // created as undefined global variable for scope
				elModalLoader.className = 'modal_loader loader_spinner visible';

					var elWrapGraphics = document.createElement('div');
					elWrapGraphics.className = 'wrap_graphics';

						var elWrapSVG = document.createElement('div');
						elWrapSVG.className = 'wrap_svg';

							var elLoaderSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
							elLoaderSVG.setAttribute('viewBox', '0 0 64 64');
							elLoaderSVG.className = 'ui_loader';

								var elLoaderUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
								elLoaderUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#ui_loader');

								elLoaderSVG.appendChild(elLoaderUse);

							elWrapSVG.appendChild(elLoaderSVG);

						elWrapGraphics.appendChild(elWrapSVG);

					elModalLoader.appendChild(elWrapGraphics);

				elModal.appendChild(elModalLoader);

			docFrag.appendChild(elModal);

		// finally, empty contents of document fragment into <body>
		// docFrag does not need to be destroyed, garbage collection should take care of it
		elBody.appendChild(docFrag);

		// apply full transparency upon document insertion
		elModal.style.opacity = 0;

		// make sure the initial state is applied by computing the opacity value
		window.getComputedStyle(elModal).opacity;

		// showModal will then remove the style attribute (if present) and toggle visibility via 'data-modal'

		// we have now added the modal to the page, we do not need to create it again
		boolModalCreated = true;

		// safe to enable click functionality now
		toggleCredits();

		// click to close modal
		elModal.addEventListener('click', closeModal);
		elModalLinkClose.addEventListener('click', closeModal);

		// prevent elModal click event from triggering on undesired children
		elModalContent.addEventListener('click', function(e) {
			e.stopPropagation();
		});

		// prevent elModalLoader click event from triggering on undesired children (also using pointer-events: none;)
		elModalLoader.addEventListener('click', function(e) {
			e.stopPropagation();
		});

	}


	// createModalError: Create modal error for AJAX failure response
	// ----------------------------------------------------------------------------
	function createModalError() {

		// create the document fragment to hold all of our created elements
		var docFrag = document.createDocumentFragment();

			var elModalError = document.createElement('div');
			elModalError.className = 'content_error';

				var elModalErrorText = document.createElement('p');
				elModalErrorText.innerHTML = 'Whoops! For whatever reason, a server error has occured and is preventing us from fetching the right video for you. Maybe if you <a href="#" class="link_retry" title="" data-client="" data-youtube="">try again</a> the server will have learned from its mistakes.';

				elModalError.appendChild(elModalErrorText);

			docFrag.appendChild(elModalError);

		elModalContent.appendChild(docFrag);

/*
		// GET COMPUTED STYLE SHOULD NOT BE NECESSARY, SINCE WE ARE NOT ANIMATING THIS ELEMENT

		// apply full transparency upon document insertion
		elModalError.style.opacity = 0;

		// make sure the initial state is applied by computing the opacity value
		window.getComputedStyle(elModalError).opacity;

		// we can now set this element to full opacity
		elModalError.style.opacity = 1;
*/

		// we have now added the error to the page, we do not need to create it again
		boolErrorCreated = true;

		// define our previously undefined retry link
		elModalLinkRetry = elModalContent.getElementsByClassName('link_retry')[0];

		// register click event to close the modal...
		// which will then check of the target originated from this retry link,
		// and allow us to perform the AJAX request again with the retained arguments
		elModalLinkRetry.addEventListener('click', closeModal);

	}


	// hideModalLoader: Remove 'visible' class from elModalLoader and listen for transition end
	// ----------------------------------------------------------------------------
	function hideModalLoader() {

		elModalLoader.addEventListener(transitionEvent, listenLoaderFadeOut);
		elModalLoader.classList.remove('visible');

		// wait until elModalLoader has faded out to declare content 'loaded'
		function listenLoaderFadeOut(e) {

			// transition event bubbles, and will trigger on all children...
			// so make sure we are looking at the right target and propertyName
			if (e.target === elModalLoader && e.propertyName === 'opacity') {

				// stop listening to the animation event
				elModalLoader.removeEventListener(transitionEvent, listenLoaderFadeOut);

				// declare content loaded
				elModal.setAttribute('data-content', 'loaded');

			}

		}

	}


	// ajaxFailed: Reveal the modal and alert the user what the problem is
	// ----------------------------------------------------------------------------
	function ajaxFailed(pLinkHREF, pLinkTitle, pLinkClient, pLinkID) {

		// as long as we have not created the error yet
		if (!boolErrorCreated) {
			createModalError(); // create the necessary elements and append to elModalContent
		}

		// inform the modal of our failure
		elModal.setAttribute('data-ajax', 'error');

		// update attributes to match original iso link
		elModalLinkRetry.href  = pLinkHREF;
		elModalLinkRetry.title = pLinkTitle;
		elModalLinkRetry.setAttribute('data-client', pLinkClient);
		elModalLinkRetry.setAttribute('data-youtube', pLinkID);

		// start listening to modal_loader transition and remove visible class to fade out element
		hideModalLoader();

	}


	// toggleCredits: Allow for hiding / showing the figcaption for the YouTube modal
	// ----------------------------------------------------------------------------
	function toggleCredits() {

		elModalLinkCredits.addEventListener('click', function(e) {

			e.preventDefault();
			elModal.classList.toggle('toggle_credits');

		});

		elCaptionClose.addEventListener('click', function(e) {

			e.preventDefault();
			elModal.classList.remove('toggle_credits');

		});

	}


	// showModal: Lock body scrolling and fade in modal overlay
	// ----------------------------------------------------------------------------
	function showModal() {

		lockBody(boolScrollbar, numScrollbarWidth);

		// if this is our first time toggling visibility...
		if ( elModal.hasAttribute('style') ) {
			elModal.removeAttribute('style'); // remove the opacity: 0; style
		}

/*
		// apply full transparency upon document insertion
		elModal.style.opacity = 0;

		// make sure the initial state is applied by computing the opacity value
		window.getComputedStyle(elModal).opacity;

		// showModal will then remove the style attribute (if present) and toggle visibility via 'data-modal'
		elModal.removeAttribute('style'); // remove the opacity: 0; style
*/

		// toggle modal visibility now that it is in the document
		elModal.setAttribute('data-modal', 'visible');

		// AJAX content has not been added yet...
		// modal will be informed via 'data-content' = 'loaded',
		// which will hide the modal loader and reveal the modal wrap

	}


	// closeModal: Fade out modal overlay, empty content, and unlock body scrolling
	// ----------------------------------------------------------------------------
	function closeModal(e) {

		e.preventDefault();

		// start listening to the elModal animation event
		elModal.addEventListener(animationEvent, fadeOutModalEnd);

		// set modal to 'hidden', which will trigger our fade out animation (to opacity: 0;)
		elModal.setAttribute('data-modal', 'hidden');

		// untoggle our credits if visible
		elModal.classList.remove('toggle_credits');

		// if elModalLinkRetry has been defined and is an honest-to-goodness element...
		if (typeof(elModalLinkRetry) != 'undefined' && elModalLinkRetry != null) {
			// and only if we have clicked the try again link...
			if (e.target === elModalLinkRetry) {
				boolRetryRequest = true;// inform our boolean we intend to try again
			}
		}

		function fadeOutModalEnd(e) {

			// animation event bubbles, and will trigger on all children...
			// so make sure we are looking at the right target
			if (e.target === elModal) {

				// stop listening to the animation event
				elModal.removeEventListener(animationEvent, fadeOutModalEnd);

				// restore scrolling to the document
				unlockBody(boolScrollbar);

				// empty out AJAX content areas
				emptyModal();

				// retry the ajax request
				if (boolRetryRequest) {

					// THERE IS AN ERROR WHERE 'TRYING AGAIN' CAN HAPPEN TOO QUICKLY FOR THE BROWSER TO COMPLETE THE TRANSITIONEVENT...
					// CAUSING DATA-CONTENT TO NEVER BE DECLARED AS LOADED...
					// IDEALLY WE NEED TO MAKE SURE THE LOADER HAS HAD THE CHANCE TO FULLY TRANSITION IN AND OUT OF 'VISIBLE'
					ajaxProjectContent(elModalLinkRetry.href, elModalLinkRetry.title, elModalLinkRetry.getAttribute('data-client'), elModalLinkRetry.getAttribute('data-youtube'));
					boolRetryRequest = false; // set back to false

				}

			}

		}

	}


	// emptyModal: Clear out the content areas that will be updated later
	// ----------------------------------------------------------------------------
	function emptyModal() {

		// capture the first children of the elements we need to delete from
		var elVideoChild  = elWrapVideo.firstChild,
			elScrollChild = elWrapScroll.firstChild;

		// if the iFrame as been added, we can safely remove it
		if (elVideoChild) {
			elWrapVideo.removeChild(elVideoChild);
		}

/*
		// previous method of removing iFrame if present... was causing errors - but not sure why
		while (elVideoChild) {
			elWrapVideo.removeChild(elVideoChild); // in case iFrame has not loaded in time, we remove while there are children
		}
*/

		// in case of ajax failure, we need to be sure we are not removing our credits arrow
		if (elScrollChild != elCaptionClose) {
			elWrapScroll.removeChild(elScrollChild); // .video_credits will be the first child of elWrapScroll
		}

		// clear inner content
		elModalTitle.innerHTML  = '';
		elModalClient.innerHTML = '';

		// reset link destinations
		elModalLinkProject.href = '#';
		elModalLinkShare.href   = '#';

		// declare our elModal as being 'empty', reset 'data-ajax', and re-apply 'visible' class to elModalLoader
		elModal.setAttribute('data-content', 'empty'); // untoggles the display of .modal_content
		elModal.setAttribute('data-ajax', ''); // untoggles the display of .content_error
		elModalLoader.classList.add('visible'); // allows our modal loader to be visible on next AJAX request

	}


	// finalAnimate: Inform the document when we have finished our loading animations
	// ----------------------------------------------------------------------------
	function finalAnimate() {

		var elFooter = document.getElementById('page_footer');

		elFooter.addEventListener(animationEvent, applyReadyState);

		function applyReadyState() {

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











	// categoryDropdown: isoTope Category Dropdown (NOT locking body once toggled)
	// ----------------------------------------------------------------------------
	function categoryDropdown(pISO) {

		var elNavCatTrigger        = document.getElementById('cat_trigger'),
			elNavCatLabel          = elNavCatTrigger.getElementsByClassName('cat_label')[0],
			elNavCatList           = elNavCat.getElementsByTagName('ul')[0],
			elNavLinkCurrent       = elNavCatList.getElementsByClassName('cat_current')[0],
			strNavLinkCurrentID    = elNavLinkCurrent.id, // not really needed until we change a filter, but let's define it anyways
			numNavLinkCurrentIndex = 1, // leaving this hard coded, since we will always show 'curated' on page load
			arrCatItems            = elNavCatList.getElementsByTagName('li'),
			numCatItemsLength      = arrCatItems.length;

		// click elNavCatTrigger to toggle dropdown
		elNavCatTrigger.addEventListener('click', function(e) {

			e.preventDefault(); // url is just a #, do not follow
			elNavCat.classList.add('toggled'); // since this button is hidden once the dropdown is toggled, it only needs to 'add'

		});

		// click outside of element to close dropdown
		document.addEventListener('click', function(e) {

			// if this is not the currently toggled dropdown
			if (e.target != elNavCat) {

				// ignore this event if preventDefault has been called
				if (e.defaultPrevented) {
					return;
				}

				elNavCat.classList.remove('toggled'); // remove 'toggled' class from elNavCat

			}

		});

		// register clickCatLink for each a.cat_link found
		for (var i = 0; i < numCatItemsLength; i++) {
			clickCatLink(getFirstChild(arrCatItems[i]), i);
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

				// close dropdown by removing 'toggled' class from elNavCat
				elNavCat.classList.remove('toggled');

				// swap 'cat_current' class and redefine elNavLinkCurrent as new selection
				elNavLinkCurrent.classList.remove('cat_current');
				elNavLinkCurrent = this.parentNode;
				elNavLinkCurrent.classList.add('cat_current');

				// capture the ID of the new 'cat_current' so we have trim off the index number from the id string...
				// I don't seem to have a easy way to determine the index position of a HTMLCollection, so this is how I am doing it
				strNavLinkCurrentID    = elNavLinkCurrent.id;
				numNavLinkCurrentIndex = parseInt( strNavLinkCurrentID.substring(strNavLinkCurrentID.indexOf('-') + 1 ) ); // must parseInt from string to number

				// we can now rearrange our isotope bricks with the new filter applied
				pISO.arrange({
					filter: strThisFilter
				});

				// isotope layoutComplete should be timed just so as to fire once our dropdown has faded out (could be using transitionEvent instead)
				pISO.once('layoutComplete', function() {

					// it is now safe to update the selected index number, so CSS can take care of our '.wrap_dropdown' top position
					elNavCat.setAttribute('data-index', numNavLinkCurrentIndex);

					// update the scroll Y position of our <ul>
					if (numNavLinkCurrentIndex <= 3) {
						elNavCatList.scrollTop = 0;
					} else if (numNavLinkCurrentIndex >= 13) {
						elNavCatList.scrollTop = 9999; // 40px * 17items = 680 ... but this can actually be set higher and scrollTop will calculate the max scrollY
					} else {
						elNavCatList.scrollTop = numNavLinkCurrentIndex * 40 - 120; // subtract a certain value...
					}

				});

			});

		}

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










	function paginationEllipsis(numAtleastItems) {

/*
		// exit this function if we are above 768
		if (numWinWidth >= 768) {
			return;
		}
*/

		// get <nav>, then <li>'s within, and count the number of <li>'s
		var elPagination = document.getElementById('pagination');

		// exit this function if we do not have #pagination
		if (elPagination === null) {
			return;
		}

		var arrPagiItems = elPagination.getElementsByClassName('pagi_page'),
			numPagiItems = arrPagiItems.length;

		// we only want to run this code if we have 7 (numAtleastItems) or more li.pagi_page items...
		// CSS specifys :nth-last-child(n+9) because it must include prev / next links
		if (numPagiItems < numAtleastItems) {
			// we have now run this function for the first time,
			// and determined that there are not enough list items to warrant adding an ellipsis...
			// so lets set boolPagiRun to 'true' so there will be need to run it again,
			// and then exit out of here
			boolPagiRun = true;
			return;
		}

		// declare that we have not found the current page yet
		var boolAddedFirstEllipsis = false,
			boolPagiFoundCurrent   = false;

		// for each <li> found within nav#pagination...
		for (var i = 0; i < arrPagiItems.length; i++) {

			// get the current iteration of <li> and its 'display' value
			var elPagiLinkCurrent = arrPagiItems[i],
				dataComputedStyle = window.getComputedStyle(elPagiLinkCurrent).getPropertyValue('display');

			// if boolPagiFoundCurrent has not yet been set to 'true' (continue if boolPagiFoundCurrent === false),
			// we can then check to see if this iteration of list item is the 'current' page
			if ( !boolPagiFoundCurrent && elPagiLinkCurrent.classList.contains('pagi_current') ) {
				boolPagiFoundCurrent = true; // update our boolean to know our answer
			}

			// check to see if this current list item has been set to display: none;
			if (dataComputedStyle === 'none') {

				// if we have not yet added an ellipsis (conditional evaluates to false)
				if (!boolAddedFirstEllipsis) {

					// if so...
					pagiAppendEllipsis(arrPagiItems[i]);

					// add the class 'appended_ellipsis', and CSS will target :nth-child(5) and set display: block;
					elPagination.classList.add('appended_ellipsis');

					// we have now added our first ellipsis
					boolAddedFirstEllipsis = true;

					// we have not only run this function for the first time, but have allowed it to run long enough to complete its job...
					// we can not safely set boolPagiRun to 'true', so it will not be run again on window resize
					boolPagiRun = true;

				}

				// if we have passed the 'current' page ('pagi_current' is forced to display: block; so it will not register as 'none')
				if (boolPagiFoundCurrent) {

					// and we have already added 1 ellipsis...
					if (boolAddedFirstEllipsis) {
						pagiAppendEllipsis(arrPagiItems[i]); // that means there are more hidden items which follow, so add a final ellipsis
					}

					// we have added at least 1 ellipsis and found the current pagi item,
					// so we can not exit this function (no need to continue iterating)
					return;

				}

			}

		}

		function pagiCreateEllipsis() {

			// create the document fragment to hold all of our created elements
			var docFrag = document.createDocumentFragment();

				var elPagiItem = document.createElement('li');
				elPagiItem.className = 'pagi_more';

					var elPagiSpan = document.createElement('span');
					elPagiSpan.className = 'pagi_link pagi_ellipsis';
					elPagiSpan.innerHTML = '&#8230'; // character entity for an ellipsis (...)

					elPagiItem.appendChild(elPagiSpan);

				docFrag.appendChild(elPagiItem);

			return docFrag;

		}

		function pagiAppendEllipsis(currentPagiItem) {

			// run function to create the required elements and pass in our document fragment
			var dataDocFrag = pagiCreateEllipsis();

			// empty our returned document fragment directly before the first list item set to display: none;
			currentPagiItem.parentNode.insertBefore(dataDocFrag, currentPagiItem);

			// we cannot use insertAdjacentHTML('beforebegin') as it does not seem to parse the document fragment?

		}

	}


	// Window Events
	// ----------------------------------------------------------------------------
	window.addEventListener('resize', debounce(function() {

		// re-measure window width on resize
		numWinWidth = window.innerWidth;

		if (numWinWidth >= 768) {

			// remove 'toggled' class from nav_primary and restore body scrolling...
			// nav_primary is the only element we should be concerned about with unlocking the body...
			// but in case this changed, we need to be sure to update how this works
			if ( elNavPrimary.classList.contains('toggled') ) {
				elNavPrimary.classList.remove('toggled');
				unlockBody(boolScrollbar);
			}

			// also remove 'toggled' class from nav_categories (if it exists)
			if (typeof(elNavCat) != 'undefined' && elNavCat != null) {
				elNavCat.classList.remove('toggled');
			}

		} else {

			// remove 'fixed' positioning from header
			elNavPrimary.classList.remove('scrolled');

			// if we have not run our paginationEllipsis() function yet,
			// then we must have started above 768px, so we will need run this now
			if (!boolPagiRun) {
				paginationEllipsis(7);
			}

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