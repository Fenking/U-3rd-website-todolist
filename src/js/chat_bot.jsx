import React from 'react';
import ReactDOM from 'react-dom';

import {TextChat} from './TextChat';
import {ChatBot} from './ChatBot';

ReactDOM.render(
    <div>
      <ChatBot />
      <hr />
      <TextChat />
    </div>,
    document.getElementById('root')
);
