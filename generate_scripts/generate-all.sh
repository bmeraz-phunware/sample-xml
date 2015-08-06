#!/bin/bash

processERB() {
	csv=csv/$1
	erb=erb/$2.erb
	xml=../$2.xml
	echo "$erb > $xml"
	./csv-erb-substitutor.rb $csv $erb | xmllint --format - > $xml || exit 1
}

processJS() {
	jsin=js/$1
	jsout=../js/$1
	NEWLINE_FILE="./newline"
	echo "" > "$NEWLINE_FILE" || exit 1
	echo "$jsin > $jsout (added atvutils.js at top of file)"
	if [ "$jsin" = "js/application.js" ]; then
		cat $jsin "$NEWLINE_FILE" js/atvutils.js "$NEWLINE_FILE" js/_Ajax.js "$NEWLINE_FILE" js/_TextViewController.js "$NEWLINE_FILE"  > $jsout || exit 1
	elif [ "$jsin" = "js/main.js" ]; then
		#statements
		cat js/atvutils.js "$NEWLINE_FILE" js/_Ajax.js "$NEWLINE_FILE" $jsin > $jsout || exit 1
	else
		cat js/atvutils.js "$NEWLINE_FILE" $jsin > $jsout || exit 1
	fi
	rm "$NEWLINE_FILE"
}

if [ ! -f ./csv-erb-substitutor.rb ]; then
    echo "You must run this script from the folder that contains csv-erb-substitutor.rb"
    exit 1
fi

processERB main.csv main
processERB main.csv movie-shelf
processERB main.csv tv-shelf
processERB main.csv movie-grid
processERB main.csv paged-grid
processERB main.csv tv-room
processERB main.csv calendar
processERB main.csv menu-items-with-sections
processERB main.csv tv-season
processERB main.csv tv-episode
processERB main.csv movie
processERB main.csv k66-stress-test
processERB movie-showcase-grid.csv movie-showcase-grid
processERB movie-shelf-grid.csv movie-shelf-grid
processERB tumbler.csv tumbler1
processERB tumbler.csv tumbler2
processERB video-clips.csv video-clips
processERB video-clips.csv movie-shelf-no-poster-outline

processJS application.js
processJS main.js

echo Success
