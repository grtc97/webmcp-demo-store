/** A list of messages. Props: items = [{ id, title, message, time, read, icon }], onOpen(item), empty (text). */
export function NotificationList({ items, onOpen, empty = 'Nothing new.' }) {
    if (!items.length) {
        return <p className="w-notif-empty">{empty}</p>
    }
    return (
        <ul className="w-notifs">
            {items.map((item) => (
                <li key={item.id}>
                    <button className={'w-notif' + (item.read ? '' : ' unread')} onClick={() => onOpen?.(item)}>
                        {item.icon && <span className="w-notif-icon">{item.icon}</span>}
                        <span className="w-notif-text">
                            <strong>{item.title}</strong>
                            <span>{item.message}</span>
                            {item.time && <small>{item.time}</small>}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    )
}
