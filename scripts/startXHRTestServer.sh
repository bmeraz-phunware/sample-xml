#!/bin/bash

XHRSERVER=XHRTestSuiteLogger.rb
LOGSPATH=servers/XHRTestSuite

if [ ! -f "$LOGSPATH/$XHRSERVER" ]; then
	echo This script must be run from the root of the sample site
	exit 1
fi

scripts/installRequiredGems.sh || exit 1

cd $LOGSPATH || exit 1

ruby "$XHRSERVER"