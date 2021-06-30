import React, {useState,useRef} from 'react'

export const ChatApp=(props)=>{
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
        setSocket(null);
        setReceivedMessage({});//清空接受信息区/聊天记录
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
        setReceivedMessage(JSON.parse(event.data));//JSON-->JS
    };

    //button for connect or disconnect
    const connectOrDisconnect=()=>{
        if(socket){
            socket.close();//非socketClosed，不清空不刷新
        }else{
            openSocket();//刷新新的socket
        }
    };

    const [inputMessage,setInputMessage]=useState('');
    const [receivedMessage,setReceivedMessage]=useState({});//聊天记录

    //send text chat message
    const sendTextMessage=()=>{
        sendMessage({from:usernameRef.current, body:inputMessage});
        setInputMessage('');//send后清空输入栏
    };

    //renew(change) input
    const inputMessageChanged=(event)=>{
        setInputMessage(event.target.value)
    };

    // useEffect(()=>{
    //     openSocket();
    // },[]);

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
            <div className="chat_client">
                {/*メッセージの送信*/}
                <div className="chat_input">
                    <input type="text" onChange={inputMessageChanged} value={inputMessage}/>
                    <button onClick={sendTextMessage} disabled={!socket||inputMessage.length===0}>
                        送信
                    </button>
                </div>

                {/*受信メッセージ*/}
                <div className="chat_output">
                    {Object.keys(receivedMessage).map((key)=>(
                        <div key={key}>
                            {key}:{receivedMessage[key]}
                        </div>
                        )
                    )}
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

ChatApp.defaultProps={
    url:'ws://localhost:3000/',
};