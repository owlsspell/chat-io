import dayjs from "dayjs"
import { MessageType } from './ChatContainer';

const Message = ({ item, username }: { item: MessageType, username: string | null }) => {

    return (<>
        {item ?
            item?.color === 'info' ?
                <div key={item.date} className='w-full flex justify-center'> <div className="badge badge-ghost my-1 p-3">{item.username} {item.type} </div>

                </div>
                :
                <div key={item.date} className={`chat ${item.username === username ? "chat-end" : "chat-start"}`}>

                    <div className="chat-bubble break-words">

                        <div className="chat-header mb-0.5 flex justify-between items-start">
                            <span className='font-serif	 italic'>{item.username}</span>
                            <time className="text-[11px] opacity-50 ml-1">{dayjs.unix(Number(item.date)).format('HH:mm')} </time>

                        </div>
                        {item.message}
                    </div>

                </div>

            : null
        }
    </>
    )
}

export default Message