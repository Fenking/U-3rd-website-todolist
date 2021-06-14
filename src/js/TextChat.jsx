import React, {useState, useRef, useEffect} from 'react';

export const TextChat = (props) => {
  // socketを保持する．
  const socketRef = useRef();
  // 接続状態が変わった時に画面を再描画する．
  const [, setConnected] = useState(false);
  // ユーザ名を作成する．
  const usernameRef = useRef(props.username ||
      `User${new Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 3}).format(Math.floor(Math.random() * 1000))}`);
  // エラーメッセージ
  const [errorMessage, setErrorMessage] = useState('');

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

  // 受信したメッセージの処理
  const handleMessage = (data) => {
    const msg = JSON.parse(data.data);
    // body と fromがある時のみ追加することにする．
    if (msg.body && msg.from) {
      setMessages((prevMessages) => prevMessages.concat(msg));
    }
  };

  // メッセージの送信
  const sendMessage = (data) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      setErrorMessage('socket is not open.');
    }
  };

  // 受信したテキストメッセージのリスト
  const [messages, setMessages] = useState([]);
  // 送信するテキストメッセージの入力
  const [messageBody, setMessageBody] = useState('');

  // テキストチャットのメッセージを送る．
  const sendTextMessage = () => {
    sendMessage({from: usernameRef.current, body: messageBody});
    setMessageBody('');
  };

  // input要素を更新する．
  const messageBodyChanged = (event) => {
    setMessageBody(event.target.value);
  };

  // メッセージのログをクリアする．
  const clearMessages = () => {
    setMessages([]);
  };

  return (
      <div className="text_chat">
        {/* WebSocketの接続・切断 */}
        <div>
          [{usernameRef.current}] {socketRef.current ? '--接続中--' : ''}
          {props.url}
          <button onClick={connectOrDisconnect}>{socketRef.current ? '切断' : '接続'}</button>
        </div>
        {/* メッセージの送信 */}
        <div className="control_box">
          <input type="text" onChange={messageBodyChanged} value={messageBody}/>
          <button onClick={sendTextMessage} disabled={!socketRef.current || messageBody.length === 0}>送信</button>
          <button onClick={clearMessages}>ログ消去</button>
        </div>
        {/* 受信メッセージのリスト */}
        <div className="message_list">
          {// 自分が送ったメッセージは右に寄せる．
            messages.map((message, index) => (
                <div key={message.timestamp}
                     className={message.from === usernameRef.current ? 'from-me' : 'from-them'}>
                  {message.from === usernameRef.current ?
                      <div>{message.body}</div> :
                      <div>{message.from} &gt; {message.body}</div>
                  }
                </div>
                )
            )}
        </div>
        {/* エラーメッセージ */}
        {errorMessage === '' ? null :
            <div className="error-message"
                 onClick={() => setErrorMessage('')}>{errorMessage}</div> }
      </div>
  );
};

TextChat.defaultProps = {
  url: 'ws://localhost:3000/ws',
};
