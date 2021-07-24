import React from 'react';
import ReactDOM from 'react-dom';

/* Reactのコンポーネントを定義する．
   別ファイルに定義してインポートしても構わない．*/
/* ここから */
import {ChatBotAdapter} from './ChatBotAdapter.jsx';
/* ここまで */

ReactDOM.render(
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
      {/* ここから */}
      <div style={{flex:'0 0 100%'}}>
        <ChatBotAdapter />
      </div>
      {/* ここまで */}
    </div>,
    document.getElementById('root')
);
