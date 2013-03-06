//  When clicked -- skips to the next video. Skips from the end of the list to the front again.
define(['playlistManager'], function (playlistManager) {
    'use strict';
    var skipButton = $('#SkipButton');

    //  Prevent spamming by only allowing a next click once every 100ms.
    skipButton.click(_.debounce(function () {

        if (!$(this).hasClass('disabled')) {
            playlistManager.getStream().getSelectedPlaylist().skipItem('next');
        }

    }, 100, true));

    var stream = playlistManager.getStream();
    stream.getSelectedPlaylist().get('items').on('remove', function (model, collection) {
        if (collection.length === 0) {
            disableButton();
        }
    });
    stream.getSelectedPlaylist().get('items').on('add', enableButton);
    
    stream.get('playlists').on('change:selected', function (playlist, isSelected) {

        if (isSelected) {
            enableIfItemsInPlaylist(playlist);

            playlist.get('items').on('remove', function (model, collection) {
                if (collection.length === 0) {
                    disableButton();
                }
            });

            playlist.get('items').on('add', enableButton);

        } else {
            playlist.get('items').off('remove add');
        }

    });

    enableIfItemsInPlaylist(stream.getSelectedPlaylist());
    
    function enableIfItemsInPlaylist(playlist) {
        var itemCount = playlist.get('items').length;

        if (itemCount > 0) {
            enableButton();
        }
    }

    //  Paint the button's path black and bind its click event.
    function enableButton() {
        skipButton.prop('src', 'images/skip.png').removeClass('disabled');
        skipButton.find('.path').css('fill', 'black');
    }
    
    //  Paint the button's path gray and unbind its click event.
    function disableButton() {
        skipButton.prop('src', 'images/skip-disabled.png').addClass('disabled');
        $(skipButton).find('.path').css('fill', 'gray');
    }
});