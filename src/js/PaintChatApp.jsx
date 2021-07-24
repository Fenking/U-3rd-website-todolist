import React, {useState,useRef,useEffect} from 'react'

export const PaintChatApp=(props)=>{
    const [socket, setSocket]=useState(null);
    const usernameRef=useRef(props.username||
        `User${new Intl.NumberFormat(undefined,{minimumIntegerDigits:3}).format(Math.floor(Math.random()*1000))}`);
    const [errorMessage,setErrorMessage]=useState('');

    //WebSocket open
    const openSocket=()=>{
        if(!socket){//不存在时创建新的socket结构
            const newSocket=new WebSocket(props.url);
            newSocket.addEventListener('open',(event)=>{
                socketOpened(newSocket);//开socket
            });
            newSocket.addEventListener('message',(event)=>{
                handleMessage(event);//处理文本
            });
            newSocket.addEventListener('error',(event)=>{
                setErrorMessage('WebSocket Error');//输出错误
            });
            newSocket.addEventListener('close',(event)=>{
                socketClosed();//关socket
            })
        }else{
            setErrorMessage('openSocket:socket already exists')//早tm开了
        }
    };

    //Socket is open
    const socketOpened=(socket)=>{
        setSocket(socket);
        setErrorMessage('');
    };

    //Socket is close
    const socketClosed=()=>{
        setSocket(null);//清空接受
    };

    //send message
    const sendMessage=(data)=>{
        if(socket){
            socket.send(JSON.stringify(data));//JS-->JSON
        }else{
            setErrorMessage('socket is not open');
        }
    };
    
    //handle message
    const handleMessage=(event)=>{
        const msg=JSON.parse(event.data);
        if(msg.type==='pen'){
            drawPenFromTo(msg.x0,msg.y0,msg.x1,msg.y1,msg.color,msg.size);
        }else if(msg.type==='clear'){
            clearCanvas();
        }
    };

    //button for connect or disconnect
    const connectOrDisconnect=()=>{
        if(socket){
            socket.close();//非socketClosed，不清空不刷新
        }else{
            openSocket();//刷新新的socket
        }
    };


    //Canvas support
    const canvasRef=useRef(null);
    //色の選択
    const [color,setColor]=useState(props.color);
    //ペンのサイズ
    const [penSize,setPenSize]=useState(props.penSize);
    //マウスの最後の位置を記録しておく
    const lastPosRef=useRef(null);

    //ページ表示時オープン
    useEffect(()=>{
        openSocket();
    },[]);

    //マウスイベントの座標をCanvas内の座標へ変換
    const getCoords=(event)=>{
        const canvas=canvasRef.current;
        const rect=canvas.getBoundingClientRect();
        const pl=parseFloat(getComputedStyle(canvas).paddingLeft);
        const pt=parseFloat(getComputedStyle(canvas).paddingRight);
        const offsetX=rect.left+canvas.clientLeft+pl;
        const offsetY=rect.top+canvas.clientTop+pt;
        const posx=event.clientX-offsetX;
        const posy=event.clientY-offsetY;
        return {x:posx,y:posy};
    };

    //Canvasに線を描く
    const drawPenFromTo=(x0,y0,x1,y1,color,size)=>{
        const ctx=canvasRef.current.getContext('2d');
        ctx.save();
        ctx.lineCap=props.lineCap;
        ctx.lineJoin=props.lineJoin;
        ctx.strokeStyle=color;
        ctx.lineWidth=size;
        ctx.beginPath();
        ctx.moveTo(x0,y0);
        ctx.lineTo(x1,y1);
        ctx.stroke();
        ctx.restore();
    };

    //mousedownのイベントリスナー
    const mousedown=(event)=>{
        if(socket){
            //描画モードに入る
            //canvas要素外にマウスが動くことも想定し、documentに対して
            //mousemoveとmouseupのイベントリスナーを設定する
            document.addEventListener('mousemove',mousemove,false);
            document.addEventListener('mouseup',mouseup,false);
            // ブラウザによってはテキスト選択が始まるのを防ぐ．
            event.preventDefault();
            //マウスが押された座標を記録しておく
            const pos=getCoords(event);
            lastPosRef.current=pos;
        }
    };

    //mousemoveのイベントリスナー
    const mousemove=(event)=>{
        const pos=getCoords(event);
        //線を描く代わりにメッセージを送る
        sendMessage({
            from:usernameRef.current,
            type:'pen',
            x0:lastPosRef.current.x,
            y0:lastPosRef.current.y,
            x1:pos.x,
            y1:pos.y,
            color:color,
            size:penSize
        });
        lastPosRef.current=pos;
    };

    //mouseupのイベントリスナー
    const mouseup=(event)=>{
        // mousemoveとmouseupのイベントリスナーを削除し，描画モードを抜ける．
        document.removeEventListener('mousemove',mousemove,false);
        document.removeEventListener('mouseup',mouseup,false);
    };

    //色の設定
    const changeColor=(event)=>{
        setColor(event.target.value);
    };

    //ペンサイズの設定
    const changePenSize=(event)=>{
        setPenSize(event.target.value);
    };

    //Canvasのクリア
    const clearCanvas=()=>{
        const canvas=canvasRef.current;
        const ctx=canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
    };

    //Canvasクリアのメッセージを送る
    const sendClearCanvas=()=>{
        sendMessage({from:usernameRef.current,type:'clear'});
    };


    return (
        <div>
            {/* WebSocketの接続・切断*/}
            <div className={"chat_control"+(socket?' connected':'')}>
                <span>[{usernameRef.current}]</span>
                <span>{socket?'[接続中]':''}</span>
                <span>
                    {props.url}
                    <button onClick={connectOrDisconnect}>{socket?'切断':'接続'}</button>
                </span>
            </div>
            {/*Paint*/}
            <div className="paint_chat">
                <canvas ref={canvasRef} onMouseDown={mousedown}
                    width={props.width} height={props.height} />
                <div className="control_box">
                    <button onClick={sendClearCanvas}>クリア</button>
                    <span>
                        <label>サイズ
                            <select onChange={changePenSize} value={penSize}>
                                <option value={2}>2</option>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                            </select>
                        </label>
                        <label>色
                            <input type="color" value={color} onChange={changeColor} />
                        </label>
                    </span>
                </div>
            </div>
            {/*エラーメッセージ*/}
            {errorMessage===''?null:
            <div className="error-message" onClick={()=>setErrorMessage('')}>
                {errorMessage}
            </div>}
        </div>
    );
};

PaintChatApp.defaultProps={
    url:'ws://localhost:3000/',
    width:500,
    height:350,
    color:'#000000',
    lineCap:'round',
    lineJoin:'round',
    penSize:5,
};