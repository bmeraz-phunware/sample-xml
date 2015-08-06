/**
 * This suite of tools is meant to test the XHR functionality and ensure that it does not break based
 * as a result of updates we make to this area of Apple TV.
 *
 * 1. Run through a series of GET, POST, PUT, and DELETE requests.
 * 2. Display the returned response on Screen via textViews.
 *
 */

function testSuiteCompletionHandler( xhr, ajaxObject )
{
	switch ( ajaxObject.method )
	{
		case "GET":
			break;
		case "POST":
			break;
		case "PUT":
			break;
		case "DELETE":
			break;
		default:
			console.log( " == Unknown XHR method == " );
	}
}

// METHODS: POST, GET, PUT, DELETE
// SET HEADERS: Accepts,
// CONTENT-TYPE: XML, JSON, TEXT
// RESPONSE: 200, 201, 302, 301, 400, 404, 500

var Tests = {
	"baseURL": "http://cbs-staging.phunware.com:3010/user",
	"request": {},

	"setURL": function( options )
	{

	},

	"setHeaders": function(headers)
	{

	},

	"setData": function( data )
	{
		var formattedData ="";
		data.forEach( function( item )
		{
			formattedData += item.name=item.value +"&";
		});
		return formattedData;
	},

	"setCompletionHandler": function( callback )
	{

	},

	"createRequest": function( options )
	{
		this.setURL( options );
		this.setHeaders( options.headers );
		this.setData( options.data );
		this.setCompletionHandler( options.callback );

	}
}



var Tests = [
	{
		"url": "http://cbs-staging.phunware.com:3010/user?id=",
		"method": "GET",
		"type": true,
		"data": "",
		"complete": testSuiteCompletionHandler
	},
	{
		"url": "http://cbs-staging.phunware.com/sample-xml/xhrTestSuiteServer.php",
		"method": "POST",
		"type": true,
		"data": "name=Tester1&category=postmaster",
		"complete": testSuiteCompletionHandler
	},
	{
		"url": "http://cbs-staging.phunware.com/sample-xml/xhrTestSuiteServer.php",
		"method": "PUT",
		"type": true,
		"data": "id=10&name=TesterWLast&category=slidemaster",
		"complete": testSuiteCompletionHandler
	},
	{
		"url": "http://cbs-staging.phunware.com/sample-xml/xhrTestSuiteServer.php?id=",
		"method": "DELETE",
		"type": true,
		"data": "id=10",
		"complete": testSuiteCompletionHandler
	}
];

function runAjaxTestSuite( testSuiteArray )
{
	testSuiteArray.forEach( function( requestDetails )
	{
		var ajax = new ATVUtils.Ajax( requestDetails );
	});
}