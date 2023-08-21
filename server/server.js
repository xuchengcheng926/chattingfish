
const express = require('express')
const app = express()
const port = 3000

var messageList = [
    {
        username: 'user1',
        password: 'pass1',
        messageBuff: []
    },
    {
        username: 'user2',
        password: 'pass2',
        messageBuff: []
    },
]

app.get('/request', (req, res) => {
    let username = req.query.username || '';
    let password = req.query.password || '';

    var User = null;
    messageList.forEach(element => {
        if(element.username == username && element.password == password)
        {
            User = element;
        }
    });

    if(User == null)
    {
        res.send('')
        return
    }

    res.send(User.messageBuff.pop())
})

app.get('/send', (req, res) => {
    let username = req.query.username || '';
    let password = req.query.password || '';
    let text = req.query.text || '';
    if(text == '')
    {
        res.send('fail')
        return
    }

    var isTrueUser = false;
    messageList.forEach(element => {
        if(element.username == username && element.password == password)
        {
            isTrueUser = true;
        }
    });

    if(isTrueUser == false)
    {
        res.send('fail')
        return
    }

    let time = new Date().getTime()
    var date = new Date(time + 3600 * 1000 * 8);
    var word = '[' + date.getHours() + ':' + date.getMinutes() + ' ' + username + '] ' + text;
    console.log(word)

    // 认证成功
    messageList.forEach(element => {
        if(element.username == username)
        {
            return;
        }

        if(element.messageBuff.length < 1024)
        {
            element.messageBuff.unshift(word)
            
        }
    }); 

    res.send('ok')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
