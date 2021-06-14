import React, {useState, useRef, useEffect} from 'react';
import axios from 'axios'

/* チャットボットのモニタ */
export const ChatBot = (props) => {
  // socketを保持する．
  const socketRef = useRef();
  // 接続状態が変わった時に画面を再描画する．
  const [, setConnected] = useState(false);
  // ボットの名前は props から取り出す．
  const usernameRef = useRef(props.botName);
  // エラーメッセージ
  const [errorMessage, setErrorMessage] = useState('');
  // ここでは，最後に送ったメッセージのみを表示することにする．
  const [lastMessage, setLastMessage] = useState('');

  // WebSocketをクローズする．
  const closeSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnected(false);
    console.log(`disconnected`);
  };

  // WebSocketをオープンする．
  const openSocket = () => {
    if (!socketRef.current) {
      const socket = new WebSocket(props.url);
      // WebSocketにイベントリスナーをつける．
      socket.addEventListener('message', (data) => {
        handleMessage(data);
      });
      socket.addEventListener('error', (data) => {
        console.log(data);
        setErrorMessage(data);
      });
      socket.addEventListener('close', () => {
        closeSocket();
      })
      socketRef.current = socket;
      setConnected(true);
      console.log(`connected to ${props.url}`);
    } else {
      setErrorMessage('openSocket: socket already exists.')
    }
  };

  // connect/disconnectボタン
  const connectOrDisconnect = () => {
    if (socketRef.current) {
      closeSocket();
    } else {
      openSocket();
    }
  };

  // ページが表示された時にソケットをオープンする．
  useEffect(() => {
    openSocket();
    // ソケットをクローズする関数を返す．（ページを閉じる時に呼ばれる）
    return () => {
      closeSocket();
    };
  }, []);

  // ボット本体のコールバックを呼び出す
  const makeCallback = async (msg) => {
    try {
      setLastMessage('');
      const reply = await axios({
        method: 'post',
        url: props.botCallback,
        data: msg,
      });
      const data = reply.data;
      data.from = props.botName;
      sendMessage({from: props.botName, body: data.body})
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // 受信したメッセージの処理
  const handleMessage = (data) => {
    const msg = JSON.parse(data.data);
    // bot自身からのメッセージでなく，かつbodyがある時のみチャットボットのcallbackを呼び出すことにする．
    if (msg.from && msg.from !== props.botName && msg.body) {
      makeCallback(msg)
    }
  };

  // メッセージの送信
  const sendMessage = (data) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(data));
      setLastMessage(data.body);
    } else {
      setErrorMessage('socket is not open.');
    }
  };

  return (
      <div>
        <div>チャットボット モニタ</div>
        <div>
            [{usernameRef.current}] {socketRef.current ? '--接続中--' : ''}
            {props.url}
            <button onClick={connectOrDisconnect}>{socketRef.current ? '切断' : '接続'}</button>
        </div>
        <div>
          Callback URL: {props.botCallback}
        </div>
        <div>
          Last Message: {lastMessage}
        </div>
        {errorMessage === '' ? null :
            <div className="error-message"
                 onClick={() => setErrorMessage('')}>{errorMessage}</div> }
      </div>
  );
};

ChatBot.defaultProps = {
  url: 'ws://localhost:3000/ws',
  botCallback: 'http://localhost:8000/bot',
  botName: 'bot'
};
