
import Task from "./Task";
export default function TaskList({ orders, reload, status }) {
  return (
  <>
    {orders.map(order => <Task key={order.code} order={order} reload={reload} status={status} />)}
  </>
  )
}