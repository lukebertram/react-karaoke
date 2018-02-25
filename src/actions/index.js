import * as types from './../constants/ActionTypes';
import v4 from 'uuid/v4';
import * as apiKeys from './../constants/apiKey';
// const API_KEY = '547c4b0aa2732f45f8d597cd68d2b8ac';

export const nextLyric = currentSongId => ({
  type: types.NEXT_LYRIC,
  currentSongId
});

export const restartSong = currentSongId => ({
  type: types.RESTART_SONG,
  currentSongId
});

export const changeSong = newSelectedSongId => ({
  type: types.CHANGE_SONG,
  newSelectedSongId
});

export const requestSong = (title, localSongId) => ({
  type: types.REQUEST_SONG,
  title,
  songId: localSongId
});

export const receiveSong = (title, artist, songId, songArray) => ({
  type: types.RECEIVE_SONG,
  songId,
  title,
  artist,
  songArray,
  receivedAt: Date.now()
});

export function fetchLyrics(
  title,
  artist,
  musixMatchId,
  localSongId,
  dispatch
) {
  return fetch(
    'http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=' +
      musixMatchId +
      '&apikey=' +
      apiKeys.MUSIXMATCH_API_KEY
  )
    .then(
      response => response.json(),
      error => console.log('An error occurred.', error)
    )
    .then(function(json) {
      // console.log('HEY WOW, A SECOND API RESPONSE, WOW! WOOOOW!', json);
      if (json.message.body.lyrics) {
        let lyrics = json.message.body.lyrics.lyrics_body;
        lyrics = lyrics.split('"').join('');
        const songArray = lyrics.split(/\n/g).filter(entry => entry != '');
        dispatch(receiveSong(title, artist, localSongId, songArray));
        dispatch(changeSong(localSongId));
      } else {
        console.log('We couldn\'t locate lyrics for this song.');
      }
    });
}

// Takes the 'title' from our form as argument
export function fetchSongId(title) {
  console.log('FORMATTED TITLE: ');
  console.log(title.split(' ').join('_'));
  title = title.split(' ').join('_');
  console.log(
    'API ADDRESS: ' +
      'http://api.musixmatch.com/ws/1.1/track.search?&q_track=' +
      title +
      '&page_size=1&s_track-rating=desc&apikey=' +
      apiKeys.MUSIXMATCH_API_KEY
  );

  // The entire method returns a function
  return function(dispatch) {
    // Creates a local ID with UUID:
    const localSongId = v4();
    dispatch(requestSong(title, localSongId));
    // Replaces spaces in the user-provided song title with underscores
    // because the API URL cannot contain spaces
    title = title.split(' ').join('_');

    // Returns the result of the fetch() function contacting the API endpoint
    return (
      fetch(
        'http://api.musixmatch.com/ws/1.1/track.search?&q_track=' +
          title +
          '&page_size=1&s_track-rating=desc&apikey=' +
          apiKeys.MUSIXMATCH_API_KEY
      )
        // .then() waits until fetch() returns data from the API
        .then(
          // Retrieves JSON response from API:
          response => response.json(),
          // Prints any errors to the console IF call is unsuccessful:
          error => console.log('An error done happened.', error)
        )
        // Waits until the preceding code finishes before running
        // The return value from first then() block (API response) is passed to
        // second .then() block as parameter 'json':
        .then(function(json) {
          if (json.message.body.track_list.length > 0) {
            const musixMatchId = json.message.body.track_list[0].track.track_id;
            const artist = json.message.body.track_list[0].track.artist_name;
            const title = json.message.body.track_list[0].track.track_name;
            fetchLyrics(title, artist, musixMatchId, localSongId, dispatch);
          } else {
            console.log('We couldn\'t locate a song under that ID.');
          }
        })
    );
  };
}
