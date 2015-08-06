//
// date.js
// Demonstrates use of Date object. Use this with logs/HTTPLogCollector.rb to view JavaScript logs.
// Examples taken from: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date
//

console.log("Running date.js ----------------------------");

//
// Several ways to assign dates
//
today = new Date();
date1 = new Date("December 17, 1995 03:24:00");
date2 = new Date(1995,11,17);
date3 = new Date(1995,11,17,3,24,0);
console.log( "Dates: " + [today, date1, date2, date3].join(", ") );

console.log( "Milliseconds since the UNIX epoch (): " + Date.now());

//
// ISO 8601 formatted dates
//
function ISODateString(d)
{
	function pad(n) { return (n < 10) ? ('0' + n) : n; }
	
	return d.getUTCFullYear()+'-'
		+ pad(d.getUTCMonth()+1)+'-'
		+ pad(d.getUTCDate())+'T'
		+ pad(d.getUTCHours())+':'
		+ pad(d.getUTCMinutes())+':'
		+ pad(d.getUTCSeconds())+'Z';
}

var d = new Date();
console.log( "Current date: " + d);
console.log( "Current date (ISO8601 formatted): " + ISODateString(d) );


//
// Calculating elapsed time using static methods
//

function longOperation_DO_NOT_USE_IN_REAL_LIFE(seconds)
{		
	// NOTE: Never use any spin code like longOperation_DO_NOT_USE_IN_REAL_LIFE in Apple TV.
	// This is only used to demonstrate the use of the Date object to calculate elapsed times.
	var end = Date.now() + (seconds * 1000);
	while ( end > Date.now() );
}

var start = Date.now();
longOperation_DO_NOT_USE_IN_REAL_LIFE(0.765);
var end = Date.now();
var elapsedMilliseconds = end - start;
console.log("longOperation took " + elapsedMilliseconds + " milliseconds");


//
// Calculating elapsed time using Date objects
//
start = new Date();
longOperation_DO_NOT_USE_IN_REAL_LIFE(0.43);
end = new Date();
elapsedMilliseconds = end.getTime() - start.getTime();
console.log("longOperation took " + elapsedMilliseconds + " milliseconds");

//
// Use of atv.localTime
//
function localTimeTest() {
	console.log( "In this function we will be printing out various versions of local time.");
	console.log( "\n\n == Start Local Time Examples == \n\n" );
	var now = new Date(),
		standardFormats = {
			"era": 'GGG GGGG GGGGG',
			"year": 'y yy yyy yyyy Y YY YYY YYYY u uu uuu uuuu U UU UUU UUUU',
			"quarter": 'qq qqq qqqq QQ QQQ QQQQ',
			"month": 'MM MMM MMMM MMMMM LL LLL LLLL LLLLL',
			"week": 'w ww W',
			"day": 'd D F gggggg',
			"weekDay": 'EEE EEEE EEEEE ee eee eeee eeeee c ccc cccc ccccc',
			"period": 'a',
			"hour": 'hh HH kk KK',
			"minute": 'mm',
			"second": 'ss SSSSS AAAAAAAAAA',
			"zone": 'zzz zzzz ZZZ ZZZZ ZZZZZ v vvvv V VVVV'

		},
		examples = [
			"MMddYYYY",
			"hhmmss",
			"HHmmss",
			"EEE MMMM dd YYYY",
			"EEEMMMMddYYYY"
		];

	console.log( " == Local Time Examples == " );
	for( var p in standardFormats )
	{
		if( standardFormats.hasOwnProperty( p ) )
		{
			var format = standardFormats[ p ];
			console.log( " - "+ p +" formats for pattern '"+ format +"' - ");
			format.split( ' ' ).forEach( function( f ) {
				console.log( " ----> '"+ f +"': "+ atv.localtime( now, f ) +" <----- " );
			});
			console.log( "\n" );
		}
	}

	console.log( " - EXAMPLES - \n\n" );
	examples.forEach( function( example ) {
		console.log( " ----> '"+ example +"': "+ atv.localtime( now, example ) +" <----- " );
	});
	console.log( "\n\n == End Local Time Examples == \n\n" );

}

localTimeTest();