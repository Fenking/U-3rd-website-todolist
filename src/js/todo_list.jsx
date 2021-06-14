import React from 'react';
import ReactDOM from 'react-dom';

import {ToDoList} from './ToDoList.jsx';

ReactDOM.render(
    <div>
      <ToDoList url="/todo" />
    </div>,
    document.getElementById('root')
);
