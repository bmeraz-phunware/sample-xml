 // Page-level JavaScript. Individual XML pages link to this in the head element.
console.log("main.js start");

// atv.onPageLoad
// Called when a page is loaded.
// Note that if you have an app-level javascript context (defined in your bag.plist) in addition to a javascript included a page's head element, onPageLoad will get invoked on both
atv.onPageLoad = function(pageIdentifier) {
    console.log('Page ' + pageIdentifier + ' loaded');
}

// atv.onPageUnload
// Called when a page is unloaded.
// Note that if you have an app-level javascript context (defined in your bag.plist) in addition to a javascript included a page's head element, onPageUnload will get invoked on both.
// In a page level onPageUnload handler, the JavaScript execution context is about to be destroyed. Therefore, any async
// task (e.g., timer or XHR) started in atv.onPageUnload is unlikely to complete.
atv.onPageUnload = function(pageIdentifier) {
    console.log('Page ' + pageIdentifier + ' unloaded');
};

// atv.onPageBuried
// Called when a new paged is pushed on top of the page
// Note that if you have an app-level javascript context (defined in your bag.plist) in addition to a javascript included a page's head element, onPageBuried will get invoked on both.
atv.onPageBuried = function( pageIdentifier ) {
    console.log('Page JS: Page'+ pageIdentifier + ' buried ');
}

// atv.onPageExhumed
// Called when a new paged is brought back to the top of the stack
// Note that if you have an app-level javascript context (defined in your bag.plist) in addition to a javascript included a page's head element, onPageExhumed will get invoked on both.
atv.onPageExhumed = function( pageIdentifier ) {
    console.log('Page JS: Page'+ pageIdentifier + ' exhumed ');
}

//------------------------------ Proxy Document -------------------------------

function decorateURLWithProxy(url) {
    var separator = "&";
    if ( url.indexOf("?") == -1 ) {
        separator = "?"
    }
    var deviceToken = atv.sessionStorage.getItem('deviceToken');

    if (deviceToken == null) {
        var httpRequest = new XMLHttpRequest();
        var proxy = new atv.ProxyDocument();

        proxy.onCancel = function () {
            httpRequest.abort();
        }
        httpRequest.onreadystatechange = function() {
            try {
                if (httpRequest.readyState == 4 ) 
                {
                    if ( httpRequest.status == 200) 
                    {
                        var json = JSON.parse(httpRequest.responseText);
                        deviceToken = json['result'];
                        atv.sessionStorage.setItem('deviceToken', deviceToken);

                        console.log('device token generated using proxy');
                        proxy.loadURL(url + separator + 'deviceToken=' + deviceToken);
                    }
                    else
                    {
                        console.error('HTTP request failed. Status ' + httpRequest.status + ': ' + httpRequest.statusText);
                    }
                }
            }
            catch (e) {
                console.error('Caught exception while processing request. Aborting. Exception: ' + e);
            }
        }
        httpRequest.open("GET", 'http://cbs-staging.phunware.com/sample-xml/js/objects/device-token.json');

        proxy.show();
        httpRequest.send();
    }
    else {
        console.log('device token used from session storage');
        atvutils.loadURL(url + separator + "device-token" + deviceToken);
    }
}

function decorateXMLWithProxy(url) {
    var httpRequest = new XMLHttpRequest();
    var proxy = new atv.ProxyDocument();

    proxy.onCancel = function () {
        httpRequest.abort();
    }
    httpRequest.onreadystatechange = function() {
        try {
            if (httpRequest.readyState == 4 ) 
            {
                if ( httpRequest.status == 200) 
                {
                    var responseDocument = atv.parseXML(httpRequest.responseText);
                    var dialog = responseDocument.rootElement.getElementByTagName('body').getElementByTagName('dialog');
                    var description = dialog.getElementByTagName('description');

                    console.log('performing preferred video format check')
                    if (atv.device.preferredVideoFormat == 'HD') {
                        description.textContent = 'This is the HD description. Change the Video Resolution setting to see a different result';
                    }
                    else {
                        description.textContent = 'This is the SD description. Change the Video Resolution setting to see a different result';
                    }

                    console.log('swapping with xml')
                    proxy.loadXML(responseDocument);
                }
                else
                {
                    console.error('HTTP request failed. Status ' + httpRequest.status + ': ' + httpRequest.statusText);
                }
            }
        }
        catch (e) {
            console.error('Caught exception while processing request. Aborting. Exception: ' + e);
        }
    }
    httpRequest.open('GET', url);

    proxy.show();
    httpRequest.send();
}

//-------------------------------- DOM Menus ------------------------------------

function toggle(id) 
{
    try
    {
        var menuItem = document.getElementById(id);
        if (menuItem) 
        {
            var label = menuItem.getElementByTagName('label');
            if ( label.textContent == "JS Toggle") 
            {
                label.textContent = "JS Toggle state 2";
            } 
            else if ( label.textContent == "JS Toggle state 2") 
            {
                label.textContent = "JS Toggle state 3";
            } 
            else 
            {
                label.textContent = "JS Toggle";
            }
        }
    }
    catch(error)
    {
        console.log("Caught exception trying to toggle DOM element: " + error);
    }
}

function remove(id) 
{
    try
    {
        var menuItem = document.getElementById(id);
        console.log("removing menu item: " + menuItem);
        menuItem.removeFromParent();
    }
    catch(error)
    {
        console.log("Caught exception trying to toggle DOM element: " + error);
    }
}

function append() 
{
    try
    {
        var items = document.getElementById("items");

        var newChild = document.makeElementNamed("oneLineMenuItem");
        newChild.setAttribute("id", "newChild");

        var label = document.makeElementNamed("label");
        label.textContent = "I was inserted at the end";
        newChild.appendChild(label);

        items.appendChild(newChild);
    }
    catch(error)
    {
        console.log("Caught exception trying to toggle DOM element: " + error);
    }
}

function insertBefore(id) 
{
    try
    {
        var menuItem = document.getElementById(id);

        // BUG: This should generate a new ID each time.
        var newChild = document.makeElementNamed("oneLineMenuItem");
        newChild.setAttribute("id", "newChildBefore");

        var label = document.makeElementNamed("label");
        label.textContent = "I was inserted before";
        newChild.appendChild(label);

        menuItem.parent.insertChildBefore(newChild, menuItem);
    }
    catch(error)
    {
        console.log("Caught exception trying to toggle DOM element: " + error);
    }
}

function insertAfter(id) 
{
    try
    {
        var menuItem = document.getElementById(id);

        var newChild = document.makeElementNamed("oneLineMenuItem");
        newChild.setAttribute("id", "newChildAfter");

        var label = document.makeElementNamed("label");
        label.textContent = "I was inserted after";
        newChild.appendChild(label);

        menuItem.parent.insertChildAfter(newChild, menuItem);
    }
    catch(error)
    {
        console.log("Caught exception trying to toggle DOM element: " + error);
    }
}

function toggleSpinner(id) 
{
    try
    {
        var menuItem = document.getElementById(id);

        var accessories = menuItem.getElementByTagName("accessories");
        if ( accessories )
        {
            accessories.removeFromParent();
        }
        else
        {
            accessories = document.makeElementNamed("accessories");
            var spinner = document.makeElementNamed("spinner");
            accessories.appendChild(spinner);
            menuItem.appendChild(accessories);
        }

    }
    catch(error)
    {
        console.log("Caught exception trying to toggle DOM element: " + error);
    }
}

function toggleCheckmark(id) 
{
    try
    {
        var menuItem = document.getElementById(id);

        var accessories = menuItem.getElementByTagName("accessories");
        if ( accessories )
        {
            accessories.removeFromParent();
        }
        else
        {
            accessories = document.makeElementNamed("accessories");
            var checkmark = document.makeElementNamed("checkMark");
            accessories.appendChild(checkmark);
            menuItem.appendChild(accessories);
        }

    }
    catch(error)
    {
        console.log("Caught exception trying to toggle DOM element: " + error);
    }
}

function toggleFavorite(id) 
{
    try
    {
        var menuItem = document.getElementById(id);
        if (menuItem) 
        {
            var label = menuItem.getElementByTagName('label');
            if ( label.textContent == "Add to Favorites") 
            {
                label.textContent = "Remove from Favorites";
                menuItem.setAttribute("accessibilityLabel", "Remove from Favorites");
            } 
            else 
            {
                label.textContent = "Add to Favorites";
                menuItem.setAttribute("accessibilityLabel", "Add to Favorites");
            }
        }
    }
    catch(error)
    {
        console.log("Caught exception trying to toggle DOM element: " + error);
    }
}

function toggleAll(section) 
{
    console.log('toggle all');
    try
    {
        var root = document.rootElement;
        var items = root.getElementByTagName('body').getElementByTagName('listWithPreview').getElementByTagName('menu').getElementByTagName('sections').childElements[section].getElementByTagName('items');
        var menuItems = items.childElements;

        for ( i=0; i<menuItems.length; i++ )
        {
            var menuItem = menuItems[i];
            var label = menuItem.getElementByTagName('label');
            label.textContent = "BAM";
        }
    }
    catch(error)
    {
        console.log("Caught exception trying to toggle DOM element: " + error);
    }
}

/**
 * params id - Element ID
 * params tag - Tag name of the element whose text will change
 * params values - array of values that will be used to change the Tag text
 * params callback - function used to perform settings based on the new value.
 */
function swapLabel(id, tag, values, callback) {
	var e = document.getElementById(id), 
		l = e.getElementByName(tag),		
		curText = l.textContent,
		callback = callback || function(oldValue, newValue, allValues) {
			console.log("oldValue: "+ oldValue);
			console.log("newValue: "+ newValue);
			console.log("allValue: "+ allValues);
		};
// TODO:: localize the l.textContent setting using the values as a key
	if( values.indexOf(curText) > -1 && ( values.indexOf(curText) < (values.length - 1) ) ) {
		l.textContent = values[ values.indexOf(curText) + 1 ];
	} else {
		l.textContent = values[0];
	}
	
	if(typeof(callback) == "function") callback.call(this, curText, l.textContent, values);
}

function handleRefresh() {
    console.log("Handle refresh event called");
    var now = new Date();
    document.getElementById('menuToChange').getElementByTagName('label').textContent = "Updated at " + now.toLocaleTimeString();
}

function handleNavigate(e) {
    console.log("Handle navigate event called: " + e + ", e.navigationItemId = " + e.navigationItemId);
    
    // Grab stash out of a copy of the document so it isn't removed from document.
    var documentCopy = atv.parseXML(document.serializeToString());
    var navItem = documentCopy.getElementById(e.navigationItemId);
    var navData = navItem.getElementByTagName("stash");
    var newMenuSections = navData.childElements[0];
	
	newMenuSections.removeFromParent();
    
    var menu = document.rootElement.getElementByTagName("menu");
    var oldMenuSections = menu.getElementByTagName("sections");
    menu.replaceChild(oldMenuSections, newMenuSections);
    
    console.log("Menu sections replaced");
    
    e.onCancel = function() {
        // Cancel any outstanding requests related to the navigation event.
        console.log("Navigation got onCancel.");
    }
}

function handleNavbarNavigate( event, pageId ) {
    console.log( "Handling the navigation event."+ JSON.stringify( event ) );

    function indexForNavItemWithId( navItems, navId )
    {
        console.log ( " == TRYING TO FIND THE CURRENT INDEX FOR ID: "+ navId );
        console.log ( " == HOW MANY NAV ITEMS DO WE HAVE: "+ navItems.length );
        var currentIndex = 0;
        navItems.forEach( function( item, index ) {
            var id = item.getAttribute( "id" );
            console.log( " == test id: "+ id +" <== " );
            if( navId == id ) currentIndex = index;
        });
        return currentIndex;
    }

    event.onCancel = function() {
        console.log("nav bar nagivation was cancelled");
        // declare an onCancel handler to handle cleanup if the user presses the menu button before the page loads.
        ajax.cancelRequest();
    }

    // The navigation item ID is passed in through the event parameter.
    var navId = event.navigationItemId,
        
        // Use the event.navigationItemId to retrieve the appropriate URL information this can
        // retrieved from the document navigation item.
        navigationItems = document.evaluateXPath( '//navigationItem', document ),
        navigationItem = document.getElementById( navId )
        docUrl = navigationItem.getElementByTagName( 'url' ).textContent,
        currentIndex = indexForNavItemWithId( navigationItems, navId );

    console.log( " == We have nav item with index: "+ currentIndex +" <== " );

    // Set the current index so that on a volatile reload we can reset the index.
    atv.sessionStorage.setItem( pageId.toUpperCase()+"CURRENTINDEX", currentIndex );

        // Request the XML document via URL and send any headers you need to here.
    var ajax = new ATVUtils.Ajax({
            "url": docUrl,
            "success": function( xhr ){
                console.log( "successfully loaded the XHR" );

                // After successfully retrieving the document you can manipulate the document
                // before sending it to the navigation bar.
                var doc = xhr.responseXML,
                    title = doc.rootElement.getElementByTagName( 'title' );
                title.textContent = title.textContent +": Appended by Javascript";

                // Once the document is ready to load pass it to the event.success function
                event.success( doc );
            },
            "failure": function( status, xhr ){
                // If the document fails to load pass an error message to the event.failure button
                event.failure( "Navigation failed to load." );
            }
        });

}

function handleNavBarVolatileReload( doc, pageId )
{
    console.log ( " == Handling nav bar volatile reload of: ".toUpperCase()+ pageId +" <== " );

    var siteStateHasNotChanged = !atv.sessionStorage.getItem( 'SITESTATEHASCHANGED' );

    console.log( "== this is the navigation bar == " );
    if( event && event.cancel && siteStateHasNotChanged )
    {
        console.log( " == we have an event and cancel == "+ event +" and type "+ typeof( event ) );
        event.cancel();
    }
    else
    {
        var navigation = doc.rootElement.getElementByTagName( 'navigation' ),
            currentIndex = atv.sessionStorage.getItem( pageId.toUpperCase+"CURRENTINDEX" ) || 0;

        navigation.childElements[ currentIndex ].getElementByTagName( "title" ).textContent = Date.now();

        navigation.setAttribute( "currentIndex", currentIndex );

        atv.sessionStorage.setItem( 'SITESTATEHASCHANGED', false );

        atv.loadAndSwapXML( doc );
    }
}

function handleVolatileReload( doc, pageId )
{
    console.log ( " == Handling volatile reload of: ".toUpperCase()+ pageId +" <== " );
    
    var title = doc.rootElement.getElementByTagName( 'title' );

    console.log (" == this is the current title: "+ title.textContent );

    if( event )
    {
        if( title )
        {
            title.textContent = "Changed by reload";
            console.log( " == new title is: "+ title.textContent );
        }

        atv.loadAndSwapXML( doc );
    }
}

//----------------------------Dialogs--------------------------------------------

function showTextEntry() {
    console.log('show text entry');

    var textEntry = new atv.TextEntry();
    textEntry.type = 'emailAddress';
    textEntry.title = 'Title';
    textEntry.instructions = 'Instructions go here.';
    textEntry.label = 'Label';
    textEntry.footnote = 'Footnote goes here.';
    textEntry.defaultValue = 'jsexample@apple.com';
    textEntry.defaultToAppleID = true;
    textEntry.image = 'http://cbs-staging.phunware.com/sample-xml/images/ZYXLogo.png'
    textEntry.onSubmit = function(value) {
        console.log('Results from text entry: ' + value);
    }
    textEntry.onCancel = function() {
        console.log('User cancelled text entry.');
    }

    textEntry.show();
}

function showPINEntry() {
    console.log(' == Show PIN entry ==');

    var pinEntry = new atv.PINEntry();

    pinEntry.title = 'PIN TITLE';
    pinEntry.prompt = 'PROMPT TEXT';
    
    // Initial pin code to display, in the clear, when the PIN code screen is loaded.
    // Though users can only enter digits 0-9, the initialPINCode can contain a-z A-Z and 0-9
    pinEntry.initialPINCode = '5443'; 

    // Maximum of 7 digits if userEditbale is set to true, Maximum of 8 digits if userEditible is set to false
    pinEntry.numDigits = 4; 

    // If false the user is not able to change the pin code.
    pinEntry.userEditable = true;

    // If false the pin is entered in the clear 
    pinEntry.hideDigits = true; 

    pinEntry.onSubmit = function(value) {
        console.log(' == Show PIN entry: ON SUBMIT - Results from pin entry: '+ value +' == ');
    }

    pinEntry.onCancel = function() {
        console.log(' == Show PIN entry: ON Cancel ==');
    }
    
    pinEntry.show();
}

function showSavedCredentials() {
    var credentials = atv.savedCredentials;
    var message = "username: " + credentials.username + ", password: " + credentials.password;
    atv.loadXML(atvutils.makeErrorDocument("Saved Credentials", message));
}

//----------------------------Context Menu---------------------------------------

var contextMenuDocument = null;

function showContextMenu(itemId) {
	// Clear the context menu.
	contextMenuDocument = null;
	
	// Check if the context menu is available and enabled in the current page.
	if ( atv.contextMenu )
	{
		var ajax = new ATVUtils.Ajax({
			'url':'http://cbs-staging.phunware.com/sample-xml/js/context-menu.xml',
			'success':function(xhr) {
				atv.setTimeout(function() {
					// Check again to see if the context menu session is still available.
					if ( atv.contextMenu )
					{
			            // Load the context menu. 
			            contextMenuDocument = xhr.responseXML;
			            console.log('Context menu response is ' + contextMenuDocument);

						atv.contextMenu.onCancel = function() {
				            console.log('Context menu onCancel');
							contextMenuDocument = null;
						}
						atv.contextMenu.load(contextMenuDocument);
					}
					else
					{
			            console.log('Context menu disabled before loading');
					}
				}, 200);
			},
			'failure':function(status, xhr) {
	            console.error('HTTP request failed. Status ' + xhr.status + ': ' + xhr.statusText);
			}
		});
	}
}


function toggleContextMenuCheckmark(id) 
{
    try
    {
        var menuItem = contextMenuDocument.getElementById(id);

        var accessories = menuItem.getElementByTagName("accessories");
        if ( accessories )
        {
            accessories.removeFromParent();
        }
        else
        {
            accessories = contextMenuDocument.makeElementNamed("accessories");
            var checkmark = contextMenuDocument.makeElementNamed("checkMark");
            accessories.appendChild(checkmark);
            menuItem.appendChild(accessories);
        }

    }
    catch(error)
    {
        console.log("Caught exception trying to toggle DOM element: " + error);
    }
}

//-------------------------------------------------------------------------------

console.log("main.js end");
