# Spotify 10,000 track limit saver

Spotify has an arbitrary limit of 10,000 to the number of tracks you can save. It used to be that when you saved an album that meant saving every track inside that album. Recently they added the ability to save an album without saving the tracks inside but saving an album still seems to count towards the 10,000 limit. If you've reached the limit it's most likely that the majority of it is albums where every track is saved.

This script will remove the saved tracks from albums where every track of the album is saved. It seems that Spotify has already marked these as "saved albums" so I don't try to save them again as that would reverse the order your albums were saved. Partially saved albums will be skipped.

In case you need to reverse any changes at the end the script prints out all album ids that were updated.

## Running the script

You will need to create a OAuth token with `user-library-modify` permissions. [You can generate the token here](https://developer.spotify.com/console/delete-current-user-saved-tracks/).

```
npm install
SPOTIFY_TOKEN=your-token node spotify-track-limit-saver.js
```

If you want to do a dry run first then you can set `DRY_RUN=true` as an env var and it will skip removing the tracks and just log out instead.
