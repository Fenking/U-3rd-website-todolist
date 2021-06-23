import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const ToDoList = (props) => {
  /* ここから */
  const [items,setItems]=useState([]);//定义新useState,可以根据状态直接从[0]->[1],一般为定义一个items,及其更新用函数setItems
  const [errorMessage,setErrorMessage]=useState('');//定义错误 对照上一行
  const [itemInput,setItemInput]=useState('');
  const [itemLevel,setItemLevel]=useState(1);
  const [itemTime,setItemTime]=useState(new Date().toISOString().slice(0,10));
  const [itemDetails,setItemDetails]=useState('');

  const getItems=async()=>{//async引入await等待系统
  	try {
  		setErrorMessage('');//错误更改为空
      	const response=await axios({
      		method:'get',
      		url:props.url
      	});
      	setItems(response.data);//一般更改,setItems执行
    	} catch (error) {
    		setErrorMessage(error.message);//错误更改,setErrorMessage执行
    	}
    };

  const addItem=async()=>{
	  try {
		  setErrorMessage('');
		  await axios({
			  method:'post',
			  url:props.url,
			  data:{
				  task:itemInput,
				  completed:false,
				  level:itemLevel,
				  time:itemTime,
				  details:itemDetails,
				  display:false
			  }
		  });
		  setItemInput('');//刷新输入框
		  setItemDetails('');//刷新详细内容输入框
		  await getItems();//刷新用
	  } catch (error) {
		  setErrorMessage(error.message);
	  }
  };

  const deleteItem=async(id)=>{
	  try {
		  setErrorMessage('');
		  await axios({
			  method:'delete',
			  url:props.url+'/'+id,
		  });
		  await getItems();
	  } catch (error) {
		  setErrorMessage(error.message);
	  }
  };

  const markItem=async(id)=>{
	  const item=items.find((item)=>item.id===id);//寻找对应id
	  if(item){
		  item.completed=!item.completed;//改变completed形态
		  try {
			  setErrorMessage('');
			  await axios({
				  method:'put',
				  url:props.url+'/'+id,
				  data:item
			  });
			  await getItems();
		  } catch (error) {
			  setErrorMessage(error.message);
		  }
	  }
  };

  //网页最初加载时启用第一次 第二参数为空
  useEffect(()=>{
  	getItems();
  },[]);
  //(item['completed']?"done":"")
  const handleItemInput=(event)=>{
  	setItemInput(event.target.value);
  };

  const handleItemLevel=(event)=>{
	  setItemLevel(event.target.value);
  }

  const handleItemTime=(event)=>{
	  setItemTime(event.target.value);
  }

  const handleItemDetails=(event)=>{
	  setItemDetails(event.target.value);
  }

  const updateLevel=async(id,event)=>{
	const item=items.find((item)=>item.id===id);
	if(item){
		item.level=event.target.value;
		try {
			setErrorMessage('');
			await axios({
				method:'put',
				url:props.url+'/'+id,
				data:item
			});
			await getItems();
		} catch (error) {
			setErrorMessage(error.message);
		}
	}
  }

  const updateDetailsDisplay=async(id,event)=>{
	  const item=items.find((item)=>item.id===id);
	  if(item){
		item.display=!item.display;
		  try {
			setErrorMessage('');
			await axios({
				method:'put',
				url:props.url+'/'+id,
				data:item
			});
			await getItems();
		  } catch (error) {
			setErrorMessage(error.message);
		  }
	  }
  }

  const updateDetails=async(id,event)=>{
	const item=items.find((item)=>item.id===id);
	if(item){
	  const text=prompt("変更可能",item.details);
	  if(text!=null) item.details=text;
		try {
		  setErrorMessage('');
		  await axios({
			  method:'put',
			  url:props.url+'/'+id,
			  data:item
		  });
		  await getItems();
		} catch (error) {
		  setErrorMessage(error.message);
		}
	}
}


  	return (
    	<div className="todo_app">
    		<div className="title" onClick={getItems}>TODO リスト[{props.url}]</div>
			{/*追加创立内容*/}
    		{items.length>0?
				<div className="task_list">
					{items.map((item)=>(
						<div className={"task "+(!item['completed'] && item['time'] && 
							(new Date(item['time'])<new Date()) ? "overdue" : "")} key={item['id']}>
							<div className="task1">
								<span className="completed">
									<input type="checkbox" checked={item['completed']} onChange={markItem.bind(null,item['id'])} />
								</span>
								{/*空格的重要性 "A B"才是双classname*/}
								<span className={"description "+(item['completed']?"done":"")}>
									{item['task']}
								</span>
								<span>
									{item['time']?item['time']:item['time']='2021-06-01'}
								</span>
								<span>
									<select value={item['level']} onChange={updateLevel.bind(null,item['id'])}>
										<option value="0">Easy</option>
										<option value="1">Normal</option>
										<option value="2">Hard</option>
										<option value="3">Lunatic</option>
									</select>
								</span>
								<span>
									<button onClick={updateDetailsDisplay.bind(null,item['id'])}>詳細</button>
									<button onClick={updateDetails.bind(null,item['id'])}>変更</button>
									<button onClick={deleteItem.bind(null,item['id'])}>削除</button>
								</span>
							</div>
							<div className="task2">
								{item['display']?item['details']:""}
							</div>
							
						</div>
					))}
				</div>
				:null}


			{/*追加用*/}
			<div className="task_input">
				<div className="task_input2">
					<input type="text" placeholder="タスク" value={itemInput} onChange={handleItemInput}/>
					<span>締切
						<input type="date" onChange={handleItemTime}　value={itemTime}/>
					</span>
					<span>難易度
						<select onChange={handleItemLevel}  value={itemLevel}>
							<option value="0">Easy</option>
							<option value="1">Normal</option>
							<option value="2">Hard</option>
							<option value="3">Lunatic</option>
						</select>
					</span>
				</div>
				<div className="task_input3">
					<textarea type="text" placeholder="詳細情報" value={itemDetails} onChange={handleItemDetails}/>
				</div>
			</div >
			<button className="task_button" onClick={addItem} disabled={itemInput.length===0}>追加</button>

      		{/* <pre> */}
      			{/*放下items位置*/}
        		{/* {JSON.stringify(items,null,4)} */}
      		{/* </pre> */}
			  
      		{/*errormessage位置,单独呼出*/}
      		{errorMessage===''?null:
        		<div className="error-message" onClick={()=>setErrorMessage('')}>
          			{errorMessage}
        		</div>}
    	</div>
  	);

  /* ここまで */
};

ToDoList.defaultProps = {
  url: '/todo'
}
