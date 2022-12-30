
import Task from "./Task";
export default function TaskList({orders, reload}) {
  return (
  <>
    {orders.map((order) => <Task key={order.code} order={order} reload={reload} />)}
  </>
  )
}