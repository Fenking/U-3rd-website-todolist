import React from 'react';
import ReactDOM from 'react-dom';

/* Hello World */
const Hello = (props) => (
    <h1>{props.title}</h1>
);

Hello.defaultProps = {
  title: 'Hello'
};

/* おみくじ */
/* ここから */
const Omikuji=(props)=>{
  const index=Math.floor(Math.random()*props.names.length);

  return (
    <div className="omikuji">
      <span>{props.title}</span>
      <span>{props.names[index]}</span>
      <span>{props.texts[index]}</span>
    </div>
    )
};
Omikuji.defaultProps={
  title:'おみくじ',
  names:['大吉','中吉','小吉','吉','末','凶','大凶'],
  texts:['傘なしで雨に濡れない程度','アラーム1回だけ鳴る程度','電車バス混んでいない程度','昼ご飯おいしい程度','今のようにする程度','1限寝坊すぎ程度','水に噎せる程度'],
};


/* ここまで */

/* コンポーネントの配置 */
ReactDOM.render(
  <div>
    {/* 提出する解答から削除する：ここから */}
{/*    <Hello />
    <Hello />
    <Hello title="こんにちは" />*/}
    {/* 提出する解答から削除する：ここまで */}
    {/* 上記で定義したReactコンポーネントを複数回使用せよ．*/}
    {/* ここから */}
    <Omikuji />
    <Omikuji title='サイコロ' names={[1,2,3,4,5,6]} texts={[]} />


    {/* ここまで */}
  </div>,
  document.getElementById('root')
);
