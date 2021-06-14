import React from 'react';
import ReactDOM from 'react-dom';

import {TextChat} from './TextChat.jsx';

ReactDOM.render(
    <div style={{display: 'flex', alignItems: 'flex-start'}}>
      <TextChat />
      <div style={{width: '10%'}}></div>
      <TextChat />
    </div>,
    document.getElementById('root')
);
