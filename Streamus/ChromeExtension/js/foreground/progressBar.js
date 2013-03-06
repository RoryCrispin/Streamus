﻿//  A progress bar which shows the elapsed time as compared to the total time of the current video.
//  Changes colors based on player state -- yellow when paused, green when playing.
define(['playlistManager', 'player', 'helpers'], function (playlistManager, player, helpers) {
    'use strict';
    
    var progressBar = $('#VideoTimeProgressBar');
    var currentTimeLabel = $('#CurrentTimeLabel');
    var totalTimeLabel = $('#TotalTimeLabel');
    var isSeeking = false;

    //  Repaints the progress bar's filled-in amount based on the % of time elapsed for current video.
    progressBar.change(function () {
        var currentTime = $(this).val();
        var totalTime = parseInt($(this).prop('max'), 10);

        //  Don't divide by 0.
        var fill = totalTime !== 0 ? currentTime / totalTime : 0;

        window && console.log("fills is:", fill);
        
        var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop(' + fill + ',#ccc), color-stop(' + fill + ',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';
        $(this).css('background-image', backgroundImage);
        
        currentTimeLabel.text(helpers.prettyPrintTime(currentTime));
        totalTimeLabel.text(helpers.prettyPrintTime(totalTime));
    });
    
    //  Allow the user to manual time change by click or scroll.
    var mousewheelTimeout = null;
    progressBar.mousewheel(function(event, delta){
        clearTimeout(mousewheelTimeout);
        
        setCurrentTime(progressBar.val() + delta);

        mousewheelTimeout = setTimeout(function(){
            player.seekTo(progressBar.val());
        }, 250);
    });

    progressBar.mousedown(function(event) {
        //  1 is primary mouse button, usually left
        if (event.which === 1) {
            isSeeking = true;
        }

    }).mouseup(function(event) {
        if (event.which === 1) {
            //  Bind to progressBar mouse-up to support dragging as well as clicking.
            //  I don't want to send a message until drag ends, so mouseup works nicely. 
            player.seekTo($(this).val());
            isSeeking = false;
        }
    });

    var stream = playlistManager.getStream();
    var selectedPlaylist = stream.getSelectedPlaylist();

    selectedPlaylist.get('items').on('change:selected', function () {
        setCurrentTime(0);
        setTotalTime(getCurrentVideoDuration());
    });
    
    selectedPlaylist.get('items').on('remove', function (model, collection) {
        if (collection.length === 0) {
            setCurrentTime(0);
            setTotalTime(0);
        }
    });

    stream.get('playlists').on('change:selected', function (playlist, isSelected) {
        
        if (isSelected) {
            playlist.get('items').on('change:selected', function() {
                setCurrentTime(0);
                setTotalTime(getCurrentVideoDuration());
            });
            
            playlist.get('items').on('remove', function (model, collection) {
                if (collection.length === 0) {
                    setCurrentTime(0);
                    setTotalTime(0);
                }
            });

        } else {
            playlist.get('items').off('remove change:selected');
        }

    });

    //  If a video is currently playing when the GUI opens then initialize with those values.
    //  Set total time before current time because it affects the range's max.
    setTotalTime(getCurrentVideoDuration());
    setCurrentTime(player.get('currentTime'));
    
    //  Keep the progress bar up to date. 
    player.on('change:currentTime', function (model, currentTime) {
        if (!isSeeking) {
            setCurrentTime(currentTime);
        }
    });
    
    function setCurrentTime(currentTime) {
        if (currentTime > progressBar.prop('max')) {
            window && console.error("CurrentTime and TotalTime:", currentTime, progressBar.prop('max'));
            throw "Need to update max time before setting current time!";
        }

        progressBar.val(currentTime).trigger('change');
    }
    
    function setTotalTime(totalTime) {
        progressBar.prop('max', totalTime).trigger('change');
    }
    
    //  Return 0 or currently selected video's duration.
    function getCurrentVideoDuration() {
        var duration = 0;
        var selectedItem = playlistManager.getStream().getSelectedPlaylist().getSelectedItem();

        if (selectedItem != null) {
            duration = selectedItem.get('video').get('duration');
        }

        return duration;
    }
});