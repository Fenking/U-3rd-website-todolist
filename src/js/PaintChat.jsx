import React, {useState, useRef, useEffect} from 'react';

export const PaintChat = (props) => {
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
        clearCanvas();
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

  // データの送信．
  const sendMessage = (data) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      setErrorMessage('socket does not exist.');
    }
  };

  // Canvas support
  const canvasRef = useRef(null);
  // 色の選択
  const [color, setColor] = useState(props.color);
  // ペンのサイズ
  const [penSize, setPenSize] = useState(props.penSize);
  // マウスの最後の位置を記録しておく
  const lastPosRef = useRef(null);

  // マウスイベントの座標をCanvas内の座標に変換する．
  const getCoords = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const pl = parseFloat(getComputedStyle(canvas).paddingLeft);
    const pt = parseFloat(getComputedStyle(canvas).paddingRight);
    const offsetX = rect.left + canvas.clientLeft + pl;
    const offsetY = rect.top + canvas.clientTop + pt;
    const posx = event.clientX - offsetX;
    const posy = event.clientY - offsetY;
    return {x: posx, y: posy};
  };

  // メッセージの受信
  const handleMessage = (data) => {
    const msg = JSON.parse(data.data);
    if (msg.type === 'pen') {
      drawPenFromTo(msg.x0, msg.y0, msg.x1, msg.y1, msg.color, msg.size);
    } else if (msg.type === 'clear') {
      clearCanvas();
    }
  };

  // Canvasに線を描く．
  const drawPenFromTo = (x0, y0, x1, y1, color, size) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.save();
    ctx.lineCap = props.lineCap;
    ctx.lineJoin = props.lineJoin;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.restore();
  };

  // mousedownのイベントリスナー
  const mousedown = (event) => {
    if (socketRef.current) {
      // 描画モードに入る．
      // canvas要素外にマウスが動くことも想定し，documentに対して，mousemoveとmouseupのイベントリスナーを設定する．
      document.addEventListener('mousemove', mousemove, false);
      document.addEventListener('mouseup', mouseup, false);
      // ブラウザによってはテキスト選択が始まるのを防ぐ．
      event.preventDefault();
      // マウスが押された座標を記録しておく．
      const pos = getCoords(event);
      lastPosRef.current = pos;
    }
  };

  // mousemoveのイベントリスナー
  const mousemove = (event) => {
    const pos = getCoords(event);
    // 線を描く代わりにメッセージを送る．
    //drawPenFromTo = (lastPosRef.current.x, lastPosRef.current.y, pos.x, pos.y, color, penSize);
    sendMessage({
      from: usernameRef.current,
      type: 'pen',
      x0: lastPosRef.current.x,
      y0: lastPosRef.current.y,
      x1: pos.x,
      y1: pos.y,
      color: color,
      size: penSize
    });
    lastPosRef.current = pos;
  }

  // mouseupのイベントリスナー
  const mouseup = (event) => {
    // mousemoveとmouseupのイベントリスナーを削除し，描画モードを抜ける．
    document.removeEventListener('mousemove', mousemove, false);
    document.removeEventListener('mouseup', mouseup, false);
  };

  // 色の設定
  const changeColor = (event) => {
    setColor(event.target.value);
  };

  // ペンサイズの設定
  const changePenSize = (event) => {
    setPenSize(event.target.value);
  };

  // Canvasのクリア
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Canvasクリアのメッセージを送る．
  const sendClearCanvas = () => {
    sendMessage({from: usernameRef.current, type: 'clear'});
  };

  return (
      <div>
        <div>
          [{usernameRef.current}] {socketRef.current ? '--接続中--' : ''}
          {props.url}
          <button onClick={connectOrDisconnect}>{socketRef.current ? '切断' : '接続'}</button>
        </div>
        <div className="paint_chat">
          <canvas ref={canvasRef} onMouseDown={mousedown}
                  width={props.width} height={props.height} />
          <div className="control_box">
            <button onClick={sendClearCanvas}>クリア</button>
            <div className="control_input">
              <label>色<input type="color" value={color} onChange={changeColor}/></label>
              <label>サイズ
                <select onChange={changePenSize} value={penSize}>
                  <option value={2}>2</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select></label>
            </div>
          </div>
        </div>
        {errorMessage === '' ? null :
            <div className="error-message"
                 onClick={() => setErrorMessage('')}>{errorMessage}</div> }
      </div>
  );
};

PaintChat.defaultProps = {
  url: 'ws://localhost:3000/ws',
  width: 400,
  height: 300,
  color: '#000000',
  lineCap: 'round',
  lineJoin: 'round',
  penSize: 5,
};
