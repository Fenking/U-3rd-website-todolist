import React, {useState,useRef, useEffect} from 'react'
import axios from 'axios'

export const ChatBotAdapter=(props)=>{
    const [socket, setSocket]=useState(null);
    const usernameRef=useRef(props.botName);
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
        //socket clear
        setSocket(null);
        //InMessage clear
        setBotInMessage(null);
        setBotOutMessage(null);
        
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
        if(msg.from && msg.from!==props.botName && msg.body){
            makeCallback(msg)
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


    const [botInMessage,setBotInMessage]=useState(null);
    const [botOutMessage,setBotOutMessage]=useState(null);

    useEffect(()=>{
        openSocket();
    },[]);

    //callback of bot
    const makeCallback=async(msg)=>{
        try{
            setBotInMessage(msg);
            setErrorMessage('');
            const reply=await axios({
                method:'post',
                url:props.botCallback,
                data:msg
            });
            const data=reply.data;
            data.from=props.botName;
            setBotOutMessage(data);
        }catch(error){
            setErrorMessage(error.message);
        }
    };

    //send message for out from bot
    useEffect(()=>{
        if(botOutMessage){
            sendMessage(botOutMessage)
        }
    },[botOutMessage]);
    
//-----------------------


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
            {/*チャットボット・アダプタ*/}
            <div className="chatbot_monitor">
                <div>ChatBot Callback URL:{props.botCallback}</div>
                <span>{socket?'Opened':'Please wait for start'}</span>
                <div><b>If you want to ask ChatBot, You can also use '@bot'</b></div>
                <div>{botInMessage && botInMessage.body?botInMessage.from+':'+botInMessage.body:'--'}</div>
                <div>↓</div>
                <div>{botOutMessage && botOutMessage.body?'To '+botOutMessage.to+':'+botOutMessage.body:'--'}</div>
            </div>
            {/*エラーメッセージ*/}
            {errorMessage===''?null:
            <div className="error-message" onClick={()=>setErrorMessage('')}>
                {errorMessage}
            </div>}
        </div>
    );
};

ChatBotAdapter.defaultProps={
    url:'ws://localhost:3000/',
    botCallback:'http://localhost:8000/bot',
    botName:'bot'
};