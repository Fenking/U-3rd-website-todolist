import React from 'react';
import ReactDOM from 'react-dom';

import {PaintChat} from './PaintChat.jsx';

ReactDOM.render(
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <PaintChat />
      <PaintChat />
    </div>,
    document.getElementById('root')
);
