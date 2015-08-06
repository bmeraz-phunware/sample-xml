// ***************************************************
// ATVUtils - a JavaScript helper library for Apple TV
var atvutils = ATVUtils = {
	makeRequest: function(url, method, headers, body, callback) {
		if ( !url ) {
			throw "loadURL requires a url argument";
		}

		var method = method || "GET",
		headers = headers || {},
		body = body || "";

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			try {
				if (xhr.readyState == 4 ) {
					if ( xhr.status == 200) {
						callback(xhr.responseXML);
					} else {
						console.log("makeRequest received HTTP status " + xhr.status + " for " + url);
						callback(null);
					}
				}
			} catch (e) {
				console.error('makeRequest caught exception while processing request for ' + url + '. Aborting. Exception: ' + e);
				xhr.abort();
				callback(null);
			}
		}
		xhr.open(method, url, true);

		for(var key in headers) {
			xhr.setRequestHeader(key, headers[key]);
		}

		xhr.send();
		return xhr;
	},

	makeErrorDocument: function(message, description) {
		if ( !message ) {
			message = "";
		}
		if ( !description ) {
			description = "";
		}

		var errorXML = '<?xml version="1.0" encoding="UTF-8"?> \
		<atv> \
		<body> \
		<dialog id="com.sample.error-dialog"> \
		<title><![CDATA[' + message + ']]></title> \
		<description><![CDATA[' + description + ']]></description> \
		</dialog> \
		</body> \
		</atv>';

		return atv.parseXML(errorXML);
	},

	siteUnavailableError: function() {
	    // TODO: localize
	    return this.makeErrorDocument("sample-xml is currently unavailable. Try again later.", "Go to sample-xml.com/appletv for more information.");
	},

	loadError: function(message, description) {
		atv.loadXML(this.makeErrorDocument(message, description));
	},

	loadAndSwapError: function(message, description) {
		atv.loadAndSwapXML(this.makeErrorDocument(message, description));
	},

	loadURLInternal: function(url, method, headers, body, loader) {
		var me = this,
		xhr,
		proxy = new atv.ProxyDocument;

		proxy.show();

		proxy.onCancel = function() {
			if ( xhr ) {
				xhr.abort();
			}
		};

		xhr = me.makeRequest(url, method, headers, body, function(xml) {
			try {
				loader(proxy, xml);
			} catch(e) {
				console.error("Caught exception in for " + url + ". " + e);
				loader(me.siteUnavailableError());
			}
		});
	},

	loadURL: function( options ) { //url, method, headers, body, processXML) {
		var me = this;
		if( typeof( options ) === "string" ) {
			var url = options;
		} else {
			var url = options.url,
			method = options.method || null,
			headers = options.headers || null,
			body = options.body || null,
			processXML = options.processXML || null;
		}

		this.loadURLInternal(url, method, headers, body, function(proxy, xml) {
			if(typeof(processXML) == "function") processXML.call(this, xml);
			try {
				proxy.loadXML(xml, function(success) {
					if ( !success ) {
						console.log("loadURL failed to load " + url);
						proxy.loadXML(me.siteUnavailableError());
					}
				});
			} catch (e) {
				console.log("loadURL caught exception while loading " + url + ". " + e);
				proxy.loadXML(me.siteUnavailableError());
			}
		});
	},

	// loadAndSwapURL can only be called from page-level JavaScript of the page that wants to be swapped out.
	loadAndSwapURL: function( options ) { //url, method, headers, body, processXML) {
		var me = this;
		if( typeof( options ) === "string" ) {
			var url = options;
		} else {
			var url = options.url,
			method = options.method || null,
			headers = options.headers || null,
			body = options.body || null,
			processXML = options.processXML || null;
		}

		this.loadURLInternal(url, method, headers, body, function(proxy, xml) {
			if(typeof(processXML) == "function") processXML.call(this, xml);
			try {
				proxy.loadXML(xml, function(success) {
					if ( success ) {
						atv.unloadPage();
					} else {
						console.log("loadAndSwapURL failed to load " + url);
						proxy.loadXML(me.siteUnavailableError(), function(success) {
							if ( success ) {
								atv.unloadPage();
							}
						});
					}
				});
			} catch (e) {
				console.error("loadAndSwapURL caught exception while loading " + url + ". " + e);
				proxy.loadXML(me.siteUnavailableError(), function(success) {
					if ( success ) {
						atv.unloadPage();
					}
				});
			}
		});
	},

	/**
	 * Used to manage setting and retrieving data from local storage
	 */
	 data: function(key, value) {
	 	if(key && value) {
	 		try {
	 			atv.localStorage.setItem(key, value);
	 			return value;
	 		} catch(error) {
	 			console.error('Failed to store data element: '+ error);
	 		}

	 	} else if(key) {
	 		try {
	 			return atv.localStorage.getItem(key);
	 		} catch(error) {
	 			console.error('Failed to retrieve data element: '+ error);
	 		}
	 	}
	 	return null;
	 },

	 deleteData: function(key) {
	 	try {
	 		atv.localStorage.removeItem(key);
	 	} catch(error) {
	 		console.error('Failed to remove data element: '+ error);
	 	}
	 },


	/**
	 * @params options.name - string node name
	 * @params options.text - string textContent
	 * @params options.attrs - array of attribute to set {"name": string, "value": string, bool}
	 * @params options.children = array of childNodes same values as options
	 * @params doc - document to attach the node to
	 * returns node
	 */
	 createNode: function(options, doc) {
	 	var doc = doc || document;
	 	options = options || {};

	 	if(options.name && options.name != '') {
	 		var newElement = doc.makeElementNamed(options.name);

	 		if(options.text) newElement.textContent = options.text;

	 		if(options.attrs) {
	 			options.attrs.forEach(function(e, i, a) {
	 				newElement.setAttribute(e.name, e.value);
	 			}, this);
	 		}

	 		if(options.children) {
	 			options.children.forEach(function(e,i,a) {
	 				newElement.appendChild( this.createNode( e, doc ) );
	 			}, this)
	 		}

	 		return newElement;
	 	}
	 },

	 validEmailAddress: function( email ) {
	 	var emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
	 	isValid = email.search( emailRegex );
	 	return ( isValid > -1 );
	 },

	 softwareVersionIsAtLeast: function( version ) {
	 	var deviceVersion = atv.device.softwareVersion.split('.'),
	 	requestedVersion = version.split('.');

		// We need to pad the device version length with "0" to account for 5.0 vs 5.0.1
		if( deviceVersion.length < requestedVersion.length ) {
			var difference = requestedVersion.length - deviceVersion.length,
			dvl = deviceVersion.length;

			for( var i = 0; i < difference; i++ ) {
				deviceVersion[dvl + i] =  "0";
			};
		};

		// compare the same index from each array.
		for( var c = 0; c < deviceVersion.length; c++ ) {
			var dv = deviceVersion[c],
			rv = requestedVersion[c] || "0";

			if( parseInt( dv ) > parseInt( rv ) ) {
				return true;
			} else if( parseInt( dv ) < parseInt( rv )  ) {
				return false;
			};
		};

		// If we make it this far the two arrays are identical, so we're true
		return true;
	},

	shuffleArray: function( arr ) {
		var tmp, current, top = arr.length;

		if(top) {
			while(--top) {
				current = Math.floor(Math.random() * (top + 1));
				tmp = arr[current];
				arr[current] = arr[top];
				arr[top] = tmp;
			};
		};

		return arr;
	},

	loadTextEntry: function( textEntryOptions ) {
		var textView = new atv.TextEntry;

		textView.type              = textEntryOptions.type             || "emailAddress";
		textView.title             = textEntryOptions.title            || "";
		textView.image             = textEntryOptions.image            || null;
		textView.instructions      = textEntryOptions.instructions     || "";
		textView.label             = textEntryOptions.label            || "";
		textView.footnote          = textEntryOptions.footnote         || "";
		textView.defaultValue      = textEntryOptions.defaultValue     || null;
		textView.defaultToAppleID  = textEntryOptions.defaultToAppleID || false;
		textView.onSubmit          = textEntryOptions.onSubmit,
		textView.onCancel          = textEntryOptions.onCancel,

		textView.show();
	},

	log: function ( message , level ) {
		var debugLevel = atv.sessionStorage.getItem( "DEBUG_LEVEL" ),
		level = level || 0;

		if( level <= debugLevel ) {
			console.log( message );
		}
	},

	accessibilitySafeString: function ( string ) {
		var string = unescape( string );

		string = string
				.replace( /&amp;/g, 'and' )
				.replace( /&lt;/g, 'less than' )
				.replace( /&gt;/g, 'greater than' )
				.replace( /&/g, 'and' )
				.replace( /\</g, 'less than' )
				.replace( /\>/g, 'greater than' );

		return string;
	}
};

// Extend Object
Object.create = function (o) {
    var F = function() {}
    F.prototype = o;
    return new F();
};

Object.extend = function(obj, extension) {
    for( var p in extension ) {
        if( extension.hasOwnProperty( p ) ) {
            obj.prototype[ p ] = extension[ p ];
        }
    }
}

// Extend atv.ProxyDocument to load errors from a message and description.
if( atv.ProxyDocument ) {
	atv.ProxyDocument.prototype.loadError = function(message, description) {
		var doc = atvutils.makeErrorDocument(message, description);
		this.loadXML(doc);
	}
}


// atv.Document extensions
if( atv.Document ) {
	atv.Document.prototype.getElementById = function(id) {
		var elements = this.evaluateXPath("//*[@id='" + id + "']", this);
		if ( elements && elements.length > 0 ) {
			return elements[0];
		}
		return undefined;
	}
}


// atv.Element extensions
if( atv.Element ) {
	atv.Element.prototype.getElementsByTagName = function(tagName) {
		return this.ownerDocument.evaluateXPath("descendant::" + tagName, this);
	}

	atv.Element.prototype.getElementByTagName = function(tagName) {
		var elements = this.getElementsByTagName(tagName);
		if ( elements && elements.length > 0 ) {
			return elements[0];
		}
		return undefined;
	}
}

// Simple Array Sorting methods
Array.prototype.sortAsc = function() {
	this.sort(function( a, b ){
		return a - b;
	});
};

Array.prototype.sortDesc = function() {
	this.sort(function( a, b ){
		return b - a;
	});
};


// Date methods and properties
Date.lproj = {
	"DAYS": {
		"en": {
			"full": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			"abbrv": ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
		},
		"en_GB": {
			"full": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			"abbrv": ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
		}
	},
	"MONTHS": {
		"en": {
			"full": ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			"abbrv": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		},
		"en_GB": {
			"full": ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			"abbrv": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		}
	}
}

Date.prototype.getLocaleMonthName = function( type ) {
	var language = atv.device.language,
	type = ( type === true ) ? "abbrv" : "full",
	MONTHS = Date.lproj.MONTHS[ language ] || Date.lproj.MONTHS[ "en" ];

	return MONTHS[ type ][ this.getMonth() ];
};

Date.prototype.getLocaleDayName = function( type ) {
	var language = atv.device.language,
	type = ( type === true ) ? "abbrv" : "full",
	DAYS = Date.lproj.DAYS[ language ] || Date.lproj.DAYS[ "en" ];

	return DAYS[ type ][ this.getDay() ];
};

Date.prototype.nextDay = function( days ) {
	var oneDay = 86400000,
	days = days || 1;
	this.setTime( new Date( this.valueOf() + ( oneDay * days ) ) );
};

Date.prototype.prevDay = function( days ) {
	var oneDay = 86400000,
	days = days || 1;
	this.setTime( new Date( this.valueOf() - ( oneDay * days ) ) );
};


// String Trim methods
String.prototype.trim = function ( ch )
{
	var ch = ch || '\\s',
	s = new RegExp( '^['+ch+']+|['+ch+']+$','g');
	return this.replace(s,'');
};

String.prototype.trimLeft = function ( ch )
{
	var ch = ch || '\\s',
	s = new RegExp( '^['+ch+']+','g');
	return this.replace(s,'');
};

String.prototype.trimRight = function ( ch )
{
	var ch = ch || '\\s',
	s = new RegExp( '['+ch+']+$','g');
	return this.replace(s,'');
};

String.prototype.xmlEncode = function()
{
    var string = unescape( this );

    string = string
            .replace( /&(?![a-z#]+;)/ig, '&amp;' )
            .replace( /\</g, '&lt;' )
            .replace( /\>/g, '&gt;' );

    return string;
};

String.prototype.capitalize = function()
{
	console.log( typeof this );
	var firstLetter = this.match(/^[a-z]/i);
	if ( firstLetter )
	{
		firstLetter = firstLetter[0];
		return firstLetter.toUpperCase() + this.slice( 1 );
	}
};

// End ATVUtils
// ***************************************************
/**
 * This is an XHR handler. It handles most of tediousness of the XHR request
 * and keeps track of onRefresh XHR calls so that we don't end up with multiple
 * page refresh calls.
 *
 * You can see how I call it on the handleRefresh function below.
 *
 *
 * @params object (hash) $options
 * @params string $options.url - url to be loaded
 * @params string $options.method - "GET", "POST", "PUT", "DELTE"
 * @params bool $options.type - false = "Sync" or true = "Async" (You should always use true)
 * @params func $options.success - Gets called on readyState 4 & status 200
 * @params func $options.failure - Gets called on readyState 4 & status != 200
 * @params func $options.callback - Gets called after the success and failure on readyState 4
 * @params string $options.data - data to be sent to the server
 * @params bool $options.refresh - Is this a call from the onRefresh event.
 */
 ATVUtils.Ajax = function($options) {
	var me = this;
	$options = $options || {}

	/* Setup properties */
	this.url = $options.url || false;
	this.method = $options.method || "GET";
	this.type = ($options.type === false) ? false : true;
	this.success = $options.success || null;
	this.failure = $options.failure || null;
	this.data = $options.data || null;
	this.complete = $options.complete || null;
	this.refresh = $options.refresh || false;

	if(!this.url) {
		console.error('\nAjax Object requires a url to be passed in: e.g. { "url": "some string" }\n')
		return undefined;
	};

	this.id = Date.now();

	this.createRequest();

	this.req.onreadystatechange = this.stateChange;

	this.req.object = this;

	this.open();

	this.send();

};

ATVUtils.Ajax.currentlyRefreshing = false;
ATVUtils.Ajax.activeRequests = {};

ATVUtils.Ajax.onPageUnload = function() {
	ATVUtils.Ajax._cancelAllRequests();
};

ATVUtils.Ajax._cancelAllRequests = function() {
	for ( var p in ATVUtils.Ajax.activeRequests ) {
		if( ATVUtils.Ajax.activeRequests.hasOwnProperty( p ) ) {
			var obj = ATVUtils.Ajax.activeRequests[ p ];
			if( obj.hasOwnProperty( "abort" ) && typeof obj.abort == "function"  ) {
				obj.req.abort();
			};
			delete ATVUtils.Ajax.activeRequests[ p ];
		};
	};
	ATVUtils.Ajax.activeRequests = {};
};

ATVUtils.Ajax.prototype = {
	stateChange: function() {
		var me = this.object;
		switch(this.readyState) {
			case 1:
				if(typeof(me.connection) === "function") me.connection(this, me);
				break;
			case 2:
				if(typeof(me.received) === "function") me.received(this, me);
				break;
			case 3:
				if(typeof(me.processing) === "function") me.processing(this, me);
				break;
			case 4:
				if(this.status == "200") {
					if(typeof(me.success) === "function") me.success(this, me);
				} else {
					if(typeof(me.failure) === "function") me.failure(this.status, this, me);
				}
				if(typeof(me.complete) === "function") me.complete(this, me);
				if(me.refresh) Ajax.currentlyRefreshing = false;
				break;
			default:
				console.log("I don't think I should be here.");
				break;
		}
	},
	cancelRequest: function() {
		this.req.abort();
		delete ATVUtils.Ajax.activeRequests[ this.id ];
	},
	cancelAllActiveRequests: function() {
		ATVUtils.Ajax._cancelAllRequests();
	},
	createRequest: function() {
		try {
			this.req = new XMLHttpRequest();
			ATVUtils.Ajax.activeRequests[ this.id ] = this;
			if(this.refresh) ATVUtils.Ajax.currentlyRefreshing = true;
		} catch (error) {
			alert("The request could not be created: </br>" + error);
			console.error("failed to create request: " +error);
		}
	},
	open: function() {
		try {
			this.req.open(this.method, this.url, this.type);
		} catch(error) {
			console.log("failed to open request: " + error);
		}
	},
	send: function() {
		var data = this.data || null;
		try {
			this.req.send(data);
		} catch(error) {
			console.log("failed to send request: " + error);
		}
	}
};
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
                title.textContent = title.textContent; //+": Appended by Javascript";

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
