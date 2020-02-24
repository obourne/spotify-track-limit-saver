# Spotify 10,000 track limit saver

Spotify has an arbitrary limit of 10,000 to the number of tracks you can save. It used to be that when you saved an album that meant saving every track inside that album. Recently they added the ability to save an album without saving the tracks inside but saving an album still seems to count towards the 10,000 limit. If you've reached the limit it's most likely that the majority of it is albums where every track is saved.

This script will remove the saved tracks from albums where every track of the album is saved. It seems that Spotify has already marked these as "saved albums" so I don't try to save them again as that would reverse the order your albums were saved. Partially saved albums will be skipped.

In case you need to reverse any changes at the end the script prints out all album ids that were updated.

## Warning

I've run this on my own Spotify account and am assuming that the saved album behaviour is the same for other users. I can't find an documentation on them adding this feature so I'm relying on what I've observed from my account. I would recommend starting with caution and running with `BATCH_LIMIT=1` and `DRY_RUN=true` env vars before doing a full run.

## Running the script

You will need to create a OAuth token with `user-library-modify` permissions. [You can generate the token here](https://developer.spotify.com/console/delete-current-user-saved-tracks/).

```
npm install
SPOTIFY_TOKEN=your-token node spotify-track-limit-saver.js
```

### Dry and limited runs

If you want to do a dry run first then you can set `DRY_RUN=true` as an env var and it will skip removing the tracks and just log out instead.

If you just want to run on a small set of albums rather than your full collection you can use the `BATCH_LIMIT=1` env var. This will fetch and update 1 batch of 5 albums and then stop. The data for one album is quite large which is why the batching exists.
