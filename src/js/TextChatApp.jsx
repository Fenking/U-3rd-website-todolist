import React, {useState,useRef, useEffect} from 'react'

export const TextChatApp=(props)=>{
    const [socket, setSocket]=useState(null);
    const usernameRef=useRef(props.username||
        `User${new Intl.NumberFormat(undefined,{minimumIntegerDigits:3}).format(Math.floor(Math.random()*1000))}`);
    const [errorMessage,setErrorMessage]=useState('');
    //位置移动到此
    const [inputMessage,setInputMessage]=useState('');
    // const [receivedMessage,setReceivedMessage]=useState({});//聊天记录,暂不使用
    const [messages,setMessages]=useState([]);//聊天记录列表
    const lastMessageRef=useRef(null);
    const newDate=new Date()
    const time=newDate.toLocaleString();



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
        setMessages([]);
        // setReceivedMessage({});//清空接受信息区/聊天记录
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
        // setReceivedMessage(JSON.parse(event.data));//JSON-->JS
        const msg=JSON.parse(event.data);
        if(msg.from && msg.body){
            setMessages((prevMessage)=>[...prevMessage,msg])//残留信息后追加
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

    //迁移至前
    // const [inputMessage,setInputMessage]=useState('');
    // const [receivedMessage,setReceivedMessage]=useState({});//聊天记录,暂不使用
    // const [messages,setMessages]=useState([]);//聊天记录列表
    // const lastMessageRef=useRef(unll);


    //send text chat message
    const sendTextMessage=()=>{
        sendMessage({from:usernameRef.current, body:inputMessage, time:time});
        setInputMessage('');//send后清空输入栏
    };

    //renew(change) input
    const inputMessageChanged=(event)=>{
        setInputMessage(event.target.value)
    };

    useEffect(()=>{
        openSocket();
    },[]);
    useEffect(()=>{
        if(lastMessageRef.current){
            lastMessageRef.current.scrollIntoView();
        }
    },[messages]);


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
                {/*受信メッセージ*/}
                <div className="text_chat">
                    {/*受信メッセージのリスト*/}
                    <div className="message_list_container">
                        <div className="message_list">
                            {//自分が送ったメッセージは右に寄せる
                            messages.map((message,index)=>(
                                <div key={message.timestamp}
                                className={message.from===usernameRef.current?'from-me':'from-them'}
                                {//最後の行をmessageRefに割り当てる
                                ...index===messages.length-1?{ref:lastMessageRef}:{}}>
                                    {message.from===usernameRef.current?
                                        <div title={message.time}>{message.body}<span class="bottom"></span></div>:
                                        <div title={message.time}><div className="Outside">{message.from}&gt;</div>
                                        <div className="Inside">{message.body}<span class="bottom"></span></div></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/*メッセージの送信*/}
                <div className="chat_input">
                    <textarea rows="3" cols="45" type="text" onChange={inputMessageChanged} value={inputMessage}/>
                    <button onClick={sendTextMessage} disabled={!socket||inputMessage.length===0}>
                        送信
                    </button>
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

TextChatApp.defaultProps={
    url:'ws://localhost:3000/',
};