const express = require('express')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');
const { log } = require('console')
const { finished } = require('stream')

const PORT = process.env.PORT || 1234
const SECRET = 'mykey'
const app = express()

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Fake users

const extractBearerToken = headerValue => {
    if (typeof headerValue !== 'string') {
        return false
    }

    const matches = headerValue.match(/(bearer)\s+(\S+)/i)
    return matches && matches[2]
}

// The middleware
const checkTokenMiddleware = (req, res, next) => {
    const token = req.headers.authorization && extractBearerToken(req.headers.authorization)

    if (!token) {
        return res.status(401).json({ message: 'need a token' })
    }

    jwt.verify(token, SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'bad token' })
        }
    })

    next()
}

app.post('/login', (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'enter the correct username and password' })
    }
    fs.readFile('data.json', function (err, data) {


        const users = JSON.parse(data).users;

        const user = users.find(u => u.username === req.body.username && u.password === req.body.password)

        if (!user) {
            return res.status(400).json({ message: 'wrong login or password' })
        }

        const token = jwt.sign({
            sub: user.id,
            username: user.username
        }, SECRET, { expiresIn: '3 hours' })

        res.json({ token: user.id })
    });
})

app.post('/register', (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'please enter username and password' })
    }
    fs.readFile('data.json', function (err, data) {
        const jsonData = JSON.parse(data);
        const users = jsonData.users;
        const userExisting = users.find(u => u.username === req.body.username)

        if (userExisting) {
            return res.status(400).json({ message: `user ${req.body.username} already existing` })
        }

        const id = users[users.length - 1].id + 1
        const newUser = {
            id: id,
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            phone: req.body.phone
        }

        users.push(newUser);

        const updatedData = JSON.stringify({ ...jsonData, users }
        )

        fs.writeFile('data.json', updatedData, function (errWrite) {
            if (err) throw err;
            res.status(201).json({ message: `user ${id} created`, token: id })
        });

    });
})

// app.post('/meeting/:id', (req, res) => {
//     fs.readFile('data.json', function (err, data) {
//         const jsonData = JSON.parse(data);
//         console.log(req.body.date);

//         const meetingId = uuidv4()
//         const meetings = jsonData.meetings;
//         if (!meetings[req.params.id]) {
//             meetings[req.params.id] = [];
//         }
//         const sumOfMeetingss = req.body.sumOfMeetingss;
//         console.log(sumOfMeetingss);
        
//         if(sumOfMeetingss=== 1) {
//             const newmeeting = {
//                 "name": req.body.name,
//                 "date": meetingDate,
//                 "time": req.body.time,
//                 "number": index + 1,
//                 "sumOfMeetingss": req.body.sumOfMeetingss,
//                 "description": req.body.description,
//                 "id": meetingId
//             };   
          
//             meetings[req.params.id].push(newmeeting);  }
//             else
//         for (let index = 0; index < sumOfMeetingss; index++) {
//             const meetingDate = new Date(req.body.date);
//             meetingDate.setDate(meetingDate.getDate() + index * 7);
//             const newmeeting = {
//                 "name": req.body.name,
//                 "date": meetingDate,
//                 "time": req.body.time,
//                 "number": index + 1,
//                 "sumOfMeetingss": req.body.sumOfMeetingss,
//                 "description": req.body.description,
//                 "id": meetingId
//             };   
          
//             meetings[req.params.id].push(newmeeting);  
//         }

       

//         const updatedData = JSON.stringify({ ...jsonData, meetings }
//         )

//         fs.writeFile('data.json', updatedData, function (errWrite) {
//             if (err) throw err;
//             res.status(201).json({ message: `meeting ${meetingId} created`, meetingId: meetingId })
//         });

//     });
// });
app.post('/meeting/:id', (req, res) => {
    fs.readFile('data.json', function (err, data) {
        const jsonData = JSON.parse(data);
        console.log(req.body.date);

        const meetingId = uuidv4();
        const meetings = jsonData.meetings;
        if (!meetings[req.params.id]) {
            meetings[req.params.id] = [];
        }
        const sumOfMeetingss = req.body.sumOfMeetingss;
        console.log(sumOfMeetingss);

        if (sumOfMeetingss === 1) {
            const meetingDate = new Date(req.body.date);
            const newmeeting = {
                "name": req.body.name,
                "date": meetingDate,
                "time": req.body.time,
                "number": 1,
                "sumOfMeetingss": req.body.sumOfMeetingss,
                "description": req.body.description,
                "id": meetingId,
            "paid": 0,
            "reception": false
        
            };

            meetings[req.params.id].push(newmeeting);
        } else {
            for (let index = 0; index < sumOfMeetingss; index++) {
                const meetingDate = new Date(req.body.date);
                meetingDate.setDate(meetingDate.getDate() + index * 7);
                const newmeeting = {
                    "name": req.body.name,
                    "date": meetingDate,
                    "time": req.body.time,
                    "number": index + 1,
                    "sumOfMeetingss": req.body.sumOfMeetingss,
                    "description": req.body.description,
                    "id": meetingId,
                    "paid": 0,
                    "reception": false
                };

                meetings[req.params.id].push(newmeeting);
            }
        }

        const updatedData = JSON.stringify({ ...jsonData, meetings });

        fs.writeFile('data.json', updatedData, function (errWrite) {
            if (errWrite) throw errWrite;
            res.status(201).json({ message: `meeting ${meetingId} created`, meetingId: meetingId });
        });
    });
});

app.put('/meeting/:id/:meetingId', (req, res) => {
    try{
    fs.readFile('data.json', function (err, data) {
        const jsonData = JSON.parse(data);

        const newmeeting = {
            "name": req.body.name,
            "date": req.body.date,
            "time": req.body.time,
            "number": req.body.number,
            "sumOfMeetings": req.body.sumOfMeetings,
            "description": req.body.description,
            "id": req.params.meetingId,
            "paid": req.body.paid,
            "reception": req.body.reception
        };
console.log(newmeeting);

        const meetings = jsonData.meetings;
       if(meetings[req.params.id]){
        const meetingInd = meetings[req.params.id].findIndex(meeting => meeting.id === req.params.meetingId );

        meetings[req.params.id][meetingInd] = newmeeting;
       }
        

        const updatedData = JSON.stringify({ ...jsonData, meetings }
        )

        fs.writeFile('data.json', updatedData, function (errWrite) {
            if (err) throw err;
            res.status(200).json({ message: `meeting ${req.params.meetingId} updated`, meetingId: req.params.meetingId })
        });

    });
}
catch(e) {
    res.status(500).json({ error: `meeting update ${req.params.meetingId}` })

}
});

app.delete('/meeting/:id/:meetingId', (req, res) => {
    try{
    fs.readFile('data.json', function (err, data) {
        const jsonData = JSON.parse(data);

        const meeting = jsonData.meetings;
       
        const filtermeetings = meeting[req.params.id].filter(meeting => meeting.id !== req.params.meetingId );

        meeting[req.params.id] = filtermeetings;

        const updatedData = JSON.stringify({ ...jsonData, meeting }
        )

        fs.writeFile('data.json', updatedData, function (errWrite) {
            if (err) throw err;
            res.status(204).json({ message: `meeting ${req.params.meetingId} deleted` })
        });

    });
}
catch(e) {
    res.status(500).json({ error: `meeting update ${req.params.meetingId}` })

}
});
app.get('/', (req, res) => {
    res.json({ 
        message: 'Calendar Backend is running!',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});
app.get('/meetings/:id', (req, res) => {
    fs.readFile('data.json', function (err, data) {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data file' });
        }

        const jsonData = JSON.parse(data);

        if (!jsonData.meetings || !jsonData.meetings[req.params.id]) { console.log(!jsonData.meetings[req.params.id]);
            return res.status(404).json({ error: 'meetings not found' });
        }

        const meetings = jsonData.meetings[req.params.id];
console.log(meetings);
        res.status(200).json({ meetings });
        
       
        
    });
});

app.get('/meeting/:id/search', (req, res) => {
    var text = req.query.text;
    var date = req.query.date;

    fs.readFile('data.json', function (err, data) {
        const jsonData = JSON.parse(data);

        const meetings = jsonData.meetings[req.params.id];

        const filtermeetings = meetings.filter(meeting => {
            if( text && !meeting.name.includes(text) && !meeting.description.includes(text)) {
                return false;
            }

            if( date!="null" && !meeting.date.includes(date) ) {
                return false;
            }
            return true;
        })

        res.status(200).json({ meetings: filtermeetings })


    });
})

//tasks function
app.get('/tasks/:id', (req, res) => {
    fs.readFile('data.json', function (err, data) {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data file' });
        }

        const jsonData = JSON.parse(data);

        if (!jsonData.tasks || !jsonData.tasks[req.params.id]) { 
            return res.status(404).json({ error: 'tasks not found' });
        }

        const tasks = jsonData.tasks[req.params.id];
console.log(tasks);
        res.status(200).json({ tasks });
        
       
        
    });
});

app.post('/task/:id', (req, res) => {
    fs.readFile('data.json', function (err, data) {
        const jsonData = JSON.parse(data);
        console.log("add start");

        const taskId = uuidv4();
        const tasks = jsonData.tasks;
        if (!tasks[req.params.id]) {
            tasks[req.params.id] = [];
        }
        const sumOftaskss = req.body.sumOftaskss;
       // if (sumOftaskss === 1) {
            const taskDate = new Date(req.body.date);
            const newtask = {
                "name": req.body.name,
                "taskName": req.body.taskName,
                "date": taskDate,
                "time": req.body.time,
                "finished": false,
                "description": req.body.description,
                "id":taskId,

        
            };

            tasks[req.params.id].push(newtask);
        // } else {
        //     for (let index = 0; index < sumOftaskss; index++) {
        //         const taskDate = new Date(req.body.date);
        //         taskDate.setDate(taskDate.getDate() + index * 7);
        //         const newtask = {
        //             "name": req.body.name,
        //             "date": meetingDate,
        //             "time": req.body.time,
        //             "finished": false,
        //             "description": req.body.description,
        //             "id":taskId,
     //         };

            //     tasks[req.params.id].push(newtask);
            // }
        // }

        const updatedData = JSON.stringify({ ...jsonData, tasks });

        fs.writeFile('data.json', updatedData, function (errWrite) {
            if (errWrite) throw errWrite;
            res.status(201).json({ message: `task ${taskId} created`, taskId: taskId });
        });
    });
});

app.put('/task/:id/:taskId', (req, res) => {
    try{
    fs.readFile('data.json', function (err, data) {
        const jsonData = JSON.parse(data);

        const newtask = {
            "name": req.body.name,
            "taskName": req.body.taskName,
            "date": req.body.date,
            "time": req.body.time,
            "finished": req.body.finished,
            "description": req.body.description,
            "id": req.params.taskId,
           
        };
console.log(newtask);

        const tasks = jsonData.tasks;
       if(tasks[req.params.id]){
        const taskInd = tasks[req.params.id].findIndex(task =>task.id === req.params.taskId );

        tasks[req.params.id][taskInd] = newtask;
       }
        

        const updatedData = JSON.stringify({ ...jsonData, tasks }
        )

        fs.writeFile('data.json', updatedData, function (errWrite) {
            if (err) throw err;
            res.status(200).json({ message: `task ${req.params.taskId} updated`, taskId: req.params.taskId })
        });

    });
}
catch(e) {
    res.status(500).json({ error: `task update ${req.params.taskId}` })

}
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}.`)
})