'use strict';

/**
 * Express Web Server
 */
const express = require('express');
const { ServerResponse } = require('http');
const app = express();
const path = require('path');
const debug = require('debug')('webapp');

// データ形式としてJSON, urlencodedをサポートする．大きなデータも送信できるようにlimitを設定する．
app.use(express.json({ extended: true, limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// faviconのサポート
const favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname, 'favicon.ico')));

// 課題提出用のZipファイルの作成
const createZip = require('./createZip.js');
app.get('/createZip/', createZip);

// 動作確認用
app.get('/test', (req, res) => {
  res.send('Template Web App');
});

/**
 * ToDoアプリ用のWeb API
 */
const todoUrl = '/todo';

// ToDoアプリのタスクのidを作成する．
function* generateTodoItemId(id) {
  while (true) {
    yield id.toString();
    id = id + 1;
  }
}

const todoListId = generateTodoItemId(0);

// 例として初期タスクを設定しておく．
const todoList = [
  {
    id: todoListId.next().value,
    task: "実行済のタスク",
    completed: true
  },
  {
    id: todoListId.next().value,
    task: "これから実行するタスク",
    completed: false
  }
];

// タスクの一覧を返す．
app.get(todoUrl, (req, res) => {
  res.json(todoList);
});

// :idのタスクを返す．存在しない場合はNot Found (404)を返す．
app.get(todoUrl + '/:id', (req, res) => {
  const id = req.params.id;
  const item = todoList.find(item => item.id === id);
  if (item === undefined) {
    res.sendStatus(404);
  } else {
    res.json(item);
  }
});

// 新しいタスクを追加する．
app.post(todoUrl, (req, res) => {
  const item = req.body;
  item.id = todoListId.next().value;
  todoList.push(item);
  // 追加されたアスクのURLを返す．ここでは，requestのURLに対するrelative URLを返すことにする．
  res.status(201).location(`${todoUrl}/${item.id}`).send();
});

// idで指定されたタスクを更新する．存在しない場合はNot Found (404)を返す．
app.put(todoUrl + '/:id', (req, res) => {
  const newItem = req.body;
  const id = req.params.id;
  // id で指定されたタスクを探す．
  const currentItem = todoList.find((item) => item.id === id);
  if (currentItem === undefined) {
    // タスクがない場合
    res.sendStatus(404);
  } else {
    // newItemのidが存在し，かつパラメータのIDが異なればクライアントエラー(400)とする．
    if (newItem.id && newItem.id !== currentItem.id) {
      res.sendStatus(400);
    } else {
      // タスクの属性を置き換える．
      Object.keys(newItem).forEach((key) => currentItem[key] = newItem[key]);
      // 204 (No Content)を返す．
      res.sendStatus(204);
    }
  }
});

// idで指定されたタスクを削除する．そのようなタスクが存在しない場合はNot Found (404)を返す．
app.delete(todoUrl + '/:id', (req, res) => {
  const id = req.params.id;
  const index = todoList.findIndex(item => item.id === id);
  if (index < 0) {
    // アイテムがない場合は Not Found (404)を返す．
    res.sendStatus(404);
  } else {
    // アイテムを削除する．
    todoList.splice(index, 1);
    // 204 (No Content)を返す．
    res.sendStatus(204);
  }
});
/* 簡易TODOアプリ 終わり */


// ブラウザに提供するファイルの格納場所．
app.use(express.static(path.join(__dirname, 'dist')));

// リクエストの処理がここまで達したら，404エラーを返す．
app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

// ポート番号
const port = process.env.PORT || '3000';

// サーバを起動する．
const server = app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

/**
 * WebSocketサーバ
 */
// 単純なチャットサーバの実装
const WebSocketServer = require('websocket').server;
const wsServer = new WebSocketServer({
  httpServer: server
});

const connections = [];

wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);
  connections.push(connection);
  debug('Connected: ' + connection.remoteAddress + ' (' + connections.length + ')');

  const broadcast = (data) => {
    connections.forEach((dest) => {
      dest.sendUTF(JSON.stringify(data));
    });
  }

  connection.on('message', (message) => {
    // messageのフォーマット {type: 'utf8', utf8Data: '{....}'}
    const jsonMsg = JSON.parse(message.utf8Data);
    debug('Received from ' + connection.remoteAddress + ' ' + message.utf8Data);
    // タイムスタンプを追加する．
    jsonMsg.timestamp = Date.now();
    broadcast(jsonMsg);
  });

  connection.on('close', () => {
    debug('disconnected: ' + connection.remoteAddress);
    let index = connections.indexOf(connection);
    if (index !== -1) {
      connections.splice(index, 1);
    }
  });
});
