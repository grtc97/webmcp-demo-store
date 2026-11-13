/** Table for any rows. Props: columns = [{ key, header, render(row), align }], rows, rowKey (field or fn), empty (node). */
export function DataTable({ columns, rows, rowKey = 'id', empty = 'Nothing here.' }) {
    if (!rows.length) {
        return <p className="w-empty">{empty}</p>
    }

    const getRowKey = (row) => (typeof rowKey === 'function' ? rowKey(row) : row[rowKey])

    return (
        <div className="w-tablewrap">
            <table className="w-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} style={{ textAlign: column.align }}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={getRowKey(row)}>
                            {columns.map((column) => (
                                <td key={column.key} style={{ textAlign: column.align }}>
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
