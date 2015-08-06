console.log( " -- __Start TextViewController.js -- ")
// ===== Here is the textview information =======
var TextViewController = ( function() {
    var __config = {},
    __views = {};
    
    function SetConfig(property, value) {
        if(property) {
            __config[ property ] = value;
        }
    }
    
    function GetConfig(property) {
        if(property) {
            return __config[ property ];
        } else {
            return false;
        }
    }
    
    function SaveView( name, value ) {
        if( name ) {
            __views[ name ] = value;
        }
    }
    
    function GetView( name ) {
        if(name) {
            return __views[ name ];
        } else {
            return false;
        }
    }
    
    function RemoveView( name ) {
        if( GetView( name ) ) {
            delete __views[ name ];
        }
    }
    
    function HideView( name, timeIntervalSec ) {
        var animation = {
            "type": "BasicAnimation",
            "keyPath": "opacity",
            "fromValue": 1,
            "toValue": 0,
            "duration": timeIntervalSec,
            "removedOnCompletion": false,
            "fillMode": "forwards",
            "animationDidStop": function(finished) { console.log("Animation did finish? " + finished); }
        },
        viewContainer = GetView( name );
                          
        console.log("Hiding view "+ name +" : "+ typeof(viewContainer) +" <--- ");
        if( viewContainer ) {
            viewContainer.addAnimation( animation, name );
        }
    }
    
    function ShowView( name, timeIntervalSec ) {
        var animation = {
            "type": "BasicAnimation",
            "keyPath": "opacity",
            "fromValue": 0,
            "toValue": 1,
            "duration": timeIntervalSec,
            "removedOnCompletion": false,
            "fillMode": "forwards",
            "animationDidStop": function(finished) { console.log("Animation did finish? " + finished); }
        },
        viewContainer = GetView( name );
                          
        console.log("Showing view "+ name +" : "+ typeof(viewContainer) +" <--- ");
        if( viewContainer ) {
            viewContainer.addAnimation( animation, name );
        }
    }
    
    function __updateMessage() {
        var messageView = GetConfig( "messageView" ),
            seconds = GetConfig( "numberOfSeconds" );
        
        if(messageView){
            messageView.attributedString = {
                "string": "We have been playing for "+ seconds +" seconds.",
                "attributes": {
                    "pointSize": 22.0,
                    "color": {
                        "red": 1,
                        "blue": 1,
                        "green": 1
                    }
                }
            }
            SetConfig("numberOfSeconds", seconds + 1 );
        }
    }
    
    function InitiateView( name ) {
        var viewContainer = new atv.View(),
            message = new atv.TextView(),
            screenFrame = atv.device.screenFrame
            width = screenFrame.width,
            height = screenFrame.height * 0.07;
        
        console.log("\nwidth: "+ width +"\nheight: "+ height +"\nscreenFrame: "+ JSON.stringify( screenFrame ) );
                          
                          
        // Setup the View container.
        viewContainer.frame = {
            "x": screenFrame.x,
            "y": screenFrame.y + screenFrame.height - height,
            "width": width,
            "height": height
        }
        
        viewContainer.backgroundColor = {
            "red": 0.188,
            "blue": 0.188,
            "green": 0.188,
            "alpha": 0.7
        }
        
        viewContainer.alpha = 1;
        
        var topPadding = viewContainer.frame.height * 0.35,
            horizontalPadding = viewContainer.frame.width * 0.05;
        
        // Setup the message frame
        message.frame = {
            "x": horizontalPadding,
            "y": 0,
            "width": viewContainer.frame.width - (2 * horizontalPadding),
            "height": viewContainer.frame.height - topPadding
        };
        
        // Save the initial number of seconds as 0
        SetConfig( "numberOfSeconds", 0 );
        
        // Update the overlay message
        var messageTimer = atv.setInterval( __updateMessage, 1000 );
        SetConfig( "messageTimer", messageTimer )
        
          // Save the message to config
          SetConfig( "messageView", message )
                          
        __updateMessage();
        
        
        // Add the sub view
        viewContainer.subviews = [ message ];
        
        // Paint the view on Screen.
                          console.log("pushing the image view to screen: ");
        atv.player.overlay = viewContainer;
        
        console.log("Saving view to "+ name +" : "+ typeof(viewContainer) +" <--- ");
        SaveView( name, viewContainer );
    }
    
    return {
        "initiateView": InitiateView,
        "hideView": HideView,
        "showView": ShowView,
        "saveView": SaveView,
        "getView": GetView,
        "removeView": RemoveView,
        "setConfig": SetConfig,
        "getConfig": GetConfig
    }
} )();

console.log( " -- End _TextViewController.js -- " );