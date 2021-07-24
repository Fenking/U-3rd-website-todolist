import React from 'react';
import ReactDOM from 'react-dom';

/* Reactのコンポーネントを定義する．
   別ファイルに定義してインポートしても構わない．*/
/* ここから */
import {TextChatApp} from './TextChatApp.jsx';
import {PaintChatApp} from './PaintChatApp.jsx';
/* ここまで */
ReactDOM.render(
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap'}}>
      {/* ここから */}
      <div style={{flex:'0 0 100%'}}>
        <a href="./final_bot.html" target="_blank">ここからチャットボットを起動します(一度だけ)</a>
        <div><b>If you want to ask ChatBot, You can also use '@bot'</b></div>
      </div>
      <div style={{flex:'0 0 45%'}}>
        <TextChatApp />
      </div>
      <div style={{flex:'0 0 45%'}}>
        <PaintChatApp />
      </div>
      {/* ここまで */}
    </div>,
    document.getElementById('root')
);
