import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios';
import { Virtuoso } from 'react-virtuoso';
import Message from './Message';
import { MessageType } from './ChatContainer';


type ChatWindow = {
    countMessages: number,
    messages: MessageType[],
    setMessages: Dispatch<SetStateAction<MessageType[] | []>>,
    username: string | null
}

export default function ChatWindow({ countMessages, messages, setMessages, username }: ChatWindow) {
    const START_INDEX = countMessages
    const windowHeight = useRef(window.innerHeight);

    const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX)

    const fetchData = async () => {
        if (messages.length === countMessages) return

        const response = await axios.get(
            'http://localhost:6001/loadMessages',
            { params: { startDate: messages.length > 0 ? messages[messages.length - 1].date : null } }
        )
        const data = response.data.reverse()
        setMessages([...data, ...messages])
    };
    const prependItems = useCallback(async () => {
        const usersToPrepend = 10
        const nextFirstItemIndex = firstItemIndex - usersToPrepend
        if (messages.length === countMessages) return
        setFirstItemIndex(() => nextFirstItemIndex)
        await fetchData()
        return false
    }, [firstItemIndex, messages, setMessages])


    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className='h-auto max-h-[calc(100vh-280px)]'>
            {countMessages > 0 &&
                <Virtuoso
                    style={{ height: windowHeight.current - 280 }}
                    firstItemIndex={firstItemIndex}
                    initialTopMostItemIndex={10}
                    className='scrollbar scrollbar-thumb-gray-500 scrollbar-thin scrollbar-track-gray-100'
                    data={messages}
                    itemContent={(index, item) => <Message item={item} username={username} />}
                    startReached={prependItems}
                    followOutput="smooth"
                    alignToBottom
                />}

        </div >
    )
}
