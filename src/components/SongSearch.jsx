import React from 'react';
import PropTypes from 'prop-types';
import { fetchSongId } from './../actions';
import { connect } from 'react-redux';

function SongSearch({ dispatch }) {
  let input;
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.value.trim()) {
            return;
          }
          dispatch(fetchSongId(input.value.trim()));
          //temporary console.logs
          console.log('SEARCHED TITLE: ');
          console.log(input.value.trim());
          input.value = '';
        }}
      >
        <input
          placeholder="Song Title"
          ref={node => {
            input = node;
          }}
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
}

SongSearch.propTypes = {
  dispatch: PropTypes.func
};

export default connect()(SongSearch);
