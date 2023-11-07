import { useEffect, useRef, useState } from 'react'
import { io } from "socket.io-client";
import ChatWindow from './ChatWindow';

const socket = io('http://localhost:6001/global', {
    autoConnect: false
});

export type MessageType = {
    color: string,
    date?: string,
    message?: string,
    type: string,
    username: string,
}

function CommentList() {
    const [input, setInput] = useState<string>("")
    const [messages, setMessages] = useState<MessageType[] | []>([])
    const [username, setUsername] = useState<string | null>(null)
    const [signed, toogleSigIn] = useState<boolean>(false)
    const [numUsers, setNumUsers] = useState<number>(0)
    const [typingUsers, setTypingUsers] = useState<string[]>([])
    const [countMessages, setCount] = useState<number>(0)

    const usernameRef = useRef<HTMLInputElement>(null)

    const handleClick = () => {
        socket.emit('new message', input)
        setInput("")
    }
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }

    const startTyping = () => socket.emit('typing')
    const stopTyping = () => socket.emit('stop typing')

    const joinToChat = () => {
        if (usernameRef.current === null) return
        if (usernameRef.current.value.trim().length === 0) return
        setUsername(usernameRef.current.value)
        toogleSigIn(true)
        socket.emit('add user', usernameRef.current.value);
    }

    const handleDisconect = () => {
        socket.disconnect();
        toogleSigIn(false)
        setMessages([])
    }

    useEffect(() => {
        socket.on('login', (info) => {
            setNumUsers(info.numUsers);
            setCount(info.count)
        })

        socket.on('typing', (data) => { setTypingUsers(data); console.log('data', data); })
        socket.on('stop typing', (data) => { setTypingUsers(data); console.log('data', data); })

        return () => {
            socket.off('login');
            socket.off('typing')
        };
    }, [username])

    useEffect(() => {

        socket.on('user joined', (info) => {
            setMessages([...messages, { username: info.username, color: "info", type: "joined" }])
        })

        return () => {
            socket.off('user joined');
        };
    }, [numUsers, messages])

    useEffect(() => {

        socket.on('user left', (info) => {
            console.log('user left,');
            setNumUsers(info.numUsers)
            setMessages([...messages, { username: info.username, color: "info", type: "left" }])
            console.log('history', info.history);
        })

        return () => {
            socket.off('user left');
        };
    }, [numUsers, messages])


    useEffect(() => {

        socket.on('new user message', (data) => {
            setMessages([...messages, data])
        })
        return () => {
            socket.off('new user message');
        };
    }, [messages])

    useEffect(() => {
        if (!username) return
        socket.connect();

        return () => {
            socket.disconnect();
        };
    }, [username]);

    return (
        <>
            {signed ?
                <>
                    <div className='py-2 px-4 absolute bg-white w-full z-10 flex justify-between'>
                        <p>Online: {numUsers}</p>
                        <div>
                            <span className='mr-4 font-bold'>{username}</span>
                            <button className="btn btn-outline btn-sm" onClick={handleDisconect}>Disconect</button>
                        </div>
                    </div>
                    <div className='h-full min-h-screen flex flex-col justify-end p-6'>
                        {countMessages > 0 &&
                            <ChatWindow countMessages={countMessages} username={username} messages={messages} setMessages={setMessages} />
                        }
                        <div className='h-[160px]'>
                            <div className='h-[5px] text-xs text-gray-500'>{typingUsers.length === 1 ? typingUsers.join(',') + ' is typing...' : typingUsers.length > 0 ? typingUsers.join(',') + ' are typing...' : ""}  </div>

                            <div className='flex items-center mt-6 justify-between'>

                                <textarea className="textarea textarea-bordered w-full h-[120px] mr-6 scrollbar scrollbar-thumb-gray-500 scrollbar-thin scrollbar-track-gray-100 leading-tight"
                                    name="textarea" placeholder="Write a message"
                                    onChange={handleInput} value={input}
                                    onKeyDown={startTyping}
                                    onKeyUp={stopTyping}
                                />
                                <button className='btn btn-neutral' disabled={!input} onClick={handleClick} >Send</button>
                            </div>
                        </div>
                    </div>

                </>
                : <div className='flex items-center justify-center h-screen'>
                    <input type="text" placeholder="Type name here" className="input input-bordered w-full max-w-xs mr-2"
                        // onChange={handleUsername} value={username} 
                        ref={usernameRef}
                    />
                    <button className='btn btn-primary' onClick={joinToChat} >Join</button>
                </div>
            }
        </>
    )
}


export default CommentList
