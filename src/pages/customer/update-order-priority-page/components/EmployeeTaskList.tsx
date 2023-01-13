import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useState } from "react";
import Alert from "../../../../components/Alert";
import api from "../../../../stores/api";

export default function EmployeeTaskList({ employeeTasks }) {
  const [employees, setEmployees] = useState(employeeTasks);
  const [errorMessage, setErrorMessage] = useState("");

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sEmployee = source.droppableId;
    const dEmployee = destination.droppableId;

    let newEmployees = [...employees];
    if (sEmployee === dEmployee) {
      const index = employees.findIndex(em => em.nickname === sEmployee);
      const items = reorder(employees[index].customerOrders, source.index, destination.index);
      newEmployees[index].customerOrders = items;
    } else {
      const sIndex = employees.findIndex(em => em.nickname === sEmployee);
      const dIndex = employees.findIndex(em => em.nickname === dEmployee);
      const result = move(employees[sIndex].customerOrders, employees[dIndex].customerOrders, source, destination);
      newEmployees[sIndex].customerOrders = result[sEmployee];
      newEmployees[dIndex].customerOrders = result[dEmployee];
    }
    setEmployees(newEmployees);
    const reqData = newEmployees.map(em => ({
      nickname: em.nickname,
      customerOrders: em.customerOrders.map(o => ({code: o.code, customerName: o.customer_name}))
    }));
    try {
      const res = await api.put(`/customer-orders/tasks/priority/all`, reqData);
    } catch (e) {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setErrorMessage(error);
    }
  }

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  /**
  * Moves an item from one list to another list.
  */
  const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  }

  return (
    <div>
      {errorMessage ? (<Alert message={errorMessage} type="error"></Alert>) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        <DragDropContext onDragEnd={onDragEnd}>
          {employees.map((employee) => (
            <Droppable key={employee.nickname} droppableId={employee.nickname}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                className={`rounded-box p-2 w-full shadow-md border-2 bg-base-100 self-start ${snapshot.isDraggingOver ? "border-primary" : "border-base-100"}`}>
                  <p className="m-2 font-medium">{employee.nickname}</p>
                  {employee.customerOrders.map((order, index) => (
                    <Draggable key={order.code} draggableId={order.code} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                        className={`rounded-box p-3 my-3 mx-2 ${snapshot.isDragging ? "bg-primary text-primary-content" : "bg-base-200"}`}>
                          <div className="flex flex-col">
                            <p>#{order.code}</p>
                            <p>{order.customer_name}</p>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}