import React from 'react';
import ReactDOM from 'react-dom';

/* ここでは第６～８週で作成したReactコンポーネントをそのまま使用することを想定している． */
import {ToDoList} from './ToDoList.jsx';

ReactDOM.render(
    <div>
      {/* URLをPythonサーバに設定する */}
      <ToDoList url="http://localhost:8000/todo" />
    </div>,
    document.getElementById('root')
);
