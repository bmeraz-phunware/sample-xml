console.log( "Loading the testing code" );

function changeMyLabel( itemid ) {
	var ele = document.getElementById( itemid ),
		newLabel = "Updated: "+ Date.now();

	console.log( "the new label for : "+ ele.tagName +" is: "+ newLabel );

	ele.getElementByTagName( 'label' ).textContent = newLabel;
}

function changeTheTitle( ) {
	var title = document.evaluateXPath( '//header//title', document ),
		newTitle = Date.now();

	console.log( "the new label for : "+ title[0].tagName +" with current title : "+ title[0].textContent +" is: "+ newTitle );

	title[0].textContent = newTitle;

	console.log( "the label for : "+ title[0].tagName +" is now "+ title[0].textContent );
}

function changeMyTitle( itemid ) {
	var ele = document.getElementById( itemid ),
		newLabel = "Updated: "+ Date.now();

	console.log( "the new label for : "+ ele.tagName +" is: "+ newLabel );

	ele.getElementByTagName( 'title' ).textContent = newLabel;
}

function atvStressTest() {
	console.log( "Loading the stress test" );
	ATVUtils.loadURL({
		"url": "http://cbs-staging.phunware.com/sample-xml/k66-stress-test.xml",
		"processXML": function ( doc ) {
			console.log( "Stress test is loaded: --> " );
			var movies = doc.rootElement.getElementsByTagName( 'moviePoster' )
				i = 0;

			console.log( "Array of movie posters has been created: length: "+ movies.length +" : commence looping --> " );
			
			while( movies.length > 250 ) {
				var movie = movies.pop();

				movie.removeFromParent();

			};
			
			console.log( " <-- I have looped through the movie posters and limited the size to 250 " );
		}
	});
}
