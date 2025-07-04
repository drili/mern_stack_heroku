import React, { useContext, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import axios from "axios";
import { FaInfoCircle } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

import { UserContext } from "../context/UserContext";

import PageHeading from "../components/PageHeading";
import TaskModal from "../components/task/TaskModal";
import TaskCard from "../components/task/TaskCard";
import useTaskModal from "../functions/useTaskModal";
import getCurrentSprint from "../functions/getCurrentSprint";
import WorkflowFilters from "../components/workflow/WorkflowFilters";
import TaskCardSmall from "../components/task/TaskCardSmall";
import { ConfigContext } from "../context/ConfigContext";

const workflowColumnsData = {
  col0: [{ id: "col0", col: "0", name: "Tasks this month" }],
  col1: [{ id: "col1", col: "1", name: "Doing today" }],
  col2: [{ id: "col2", col: "2", name: "Doing this week" }],
  col3: [{ id: "col3", col: "3", name: "Done" }],
};

const Workflow = () => {
  const [workflowColumns, setWorkflowColumns] = useState(workflowColumnsData);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const { user } = useContext(UserContext);
  const [filteredTasksByColumn, setFilteredTasksByColumn] = useState({});
  const { selectedTaskId, showModal, handleTaskModal, onCloseModal } = useTaskModal();
  const activeSprint = getCurrentSprint();
  const [newSprintArray, setNewSprintArray] = useState(null);
  const [deadlineTasks, setDeadlineTasks] = useState({ overdue: [], upcoming: [] });
  const [activeFilterUser, setActiveFilterUser] = useState("");
  const [toggleSmallCards, setToggleSmallCards] = useState(
    JSON.parse(localStorage.getItem("toggleSmallCards")) || false
  );

  const { baseURL } = useContext(ConfigContext);
  const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

  const { taskHandle } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (taskHandle) {
      const id = taskHandle.split("-").pop();
      handleTaskModal(id);
    }
  }, [taskHandle]);

  const fetchDeadlineTasks = async (userId) => {
    const activeUserId = userId ? userId : user.id;
    try {
      const response = await axios.get(
        tenantBaseURL + "/tasks/fetch-deadlines",
        {
          params: {
            userId: activeUserId,
          },
        }
      );

      setDeadlineTasks({
        overdue: response.data.overdueTasks || [],
        upcoming: response.data.upcomingTasks || [],
      });
    } catch (error) {
      console.error("Error fetching deadline tasks:", error);
    }
  };

  const fetchTasksByUserAndSprint = async (activeSprintArray, userId) => {
    try {
      const activeSprintCheck = activeSprintArray ? activeSprintArray : newSprintArray;
      const activeUserId = userId ? userId : user.id;

      if (
        activeSprintCheck &&
        activeSprintCheck.sprintMonth &&
        activeSprintCheck.sprintYear
      ) {
        const response = await axios.get(
          `${tenantBaseURL}/tasks/fetch-by-user-sprint/${activeUserId}?month=${activeSprintCheck.sprintMonth}&year=${activeSprintCheck.sprintYear}&time_reg=true`
        );

        if (response.data.length == 0) {
          setTasks([]);
          setFilteredTasks([]);
          return;
        }
        setTasks(response.data);
        setFilteredTasks(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  const updateTaskWorkflow = async (taskId, workflowStatus) => {
    try {
      const response = await axios.put(
        `${tenantBaseURL}/tasks/update-taskworkflow/${taskId}`,
        { workflowStatus }
      );

      if (response.status === 200) {
        fetchDeadlineTasks(activeFilterUser);

        if (!newSprintArray) {
          fetchTasksByUserAndSprint(activeSprint, activeFilterUser);
        } else {
          fetchTasksByUserAndSprint(newSprintArray, activeFilterUser);
        }
      }
    } catch (error) {
      console.error("Failed to update task workflowStatus", error);
    }
  };

  const updateFilteredTasks = async (searchTerm) => {
    const filtered = tasks.filter(
      (task) =>
        task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.taskDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.taskCustomer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredTasks(filtered);
  };

  const updatedFilteredTasksCustomer = async (customerName) => {
    const filtered = tasks.filter((task) =>
      task.taskCustomer.customerName.toLowerCase().includes(customerName.toLowerCase())
    );

    setFilteredTasks(filtered);
  };

  const fetchWorkflow = () => {
    if (!newSprintArray) {
      fetchTasksByUserAndSprint(activeSprint);
    } else {
      fetchTasksByUserAndSprint(newSprintArray);
    }
  };

  useEffect(() => {
    fetchTasksByUserAndSprint(activeSprint);
    setActiveFilterUser(user.id);
  }, [user, activeSprint]);

  useEffect(() => {
    if (filteredTasks.length > 0) {
      const filteredTasksObj = {};
      Object.entries(workflowColumnsData).forEach(([columnId, columnItems]) => {
        const columnNum = parseInt(columnItems[0].col, 10);
        filteredTasksObj[columnNum] = filteredTasks.filter(
          (task) => task.workflowStatus === columnNum
        );
      });
      setFilteredTasksByColumn(filteredTasksObj);
    } else {
      setFilteredTasksByColumn([]);
    }
  }, [tasks, filteredTasks]);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumnId = source.droppableId;
    const sourceColumnTasks = [...filteredTasksByColumn[sourceColumnId]];
    const taskIndexToRemove = source.index;
    sourceColumnTasks.splice(taskIndexToRemove, 1);

    const destinationColumnId = destination.droppableId;
    const destinationColumnTasks = [...filteredTasksByColumn[destinationColumnId]];
    const taskToMove = filteredTasksByColumn[sourceColumnId].find(
      (task) => task._id === draggableId
    );
    destinationColumnTasks.splice(destination.index, 0, taskToMove);

    setFilteredTasksByColumn((prevFilteredTasks) => ({
      ...prevFilteredTasks,
      [sourceColumnId]: sourceColumnTasks,
      [destinationColumnId]: destinationColumnTasks,
    }));

    updateTaskWorkflow(draggableId, destination.droppableId);
  };

  useEffect(() => {
    fetchDeadlineTasks(user.id);
  }, [user, activeSprint]);

  return (
    <div id="workflowPage">
      <PageHeading
        heading="Workflow"
        subHeading={`Welcome to the workflow area`}
        suffix="Drag-n-drop the tasks to move them."
      />

      <WorkflowFilters
        activeSprint={activeSprint}
        fetchTasksByUserAndSprint={fetchTasksByUserAndSprint}
        updateFilteredTasks={updateFilteredTasks}
        updatedFilteredTasksCustomer={updatedFilteredTasksCustomer}
        setNewSprintArray={setNewSprintArray}
        fetchDeadlineTasks={fetchDeadlineTasks}
        activeFilterUser={activeFilterUser}
        setActiveFilterUser={setActiveFilterUser}
        toggleSmallCards={toggleSmallCards}
        setToggleSmallCards={setToggleSmallCards}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <section className="grid grid-cols-5 gap-3 md:flex-row">
          {Object.entries(workflowColumnsData).map(([key, value]) => (
            <span className="" key={key}>
              <h3 className="font-bold mb-5 border-b pb-2">{value[0].name}</h3>
              <Droppable droppableId={value[0].col}>
                {(provided) => (
                  <span
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-1 bg-stone-100 rounded-md py-2 px-2 h-full"
                  >
                    {filteredTasksByColumn[value[0]?.col]?.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <span
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              navigate(`/${user.tenant_id}/workflow/task/${task.taskHandle}`);
                              handleTaskModal(task._id);
                            }}
                          >
                            <TaskCard
                              key={task._id}
                              taskId={task._id}
                              taskName={task.taskName}
                              taskDescription={task.taskDescription}
                              taskPersons={task.taskPersons}
                              customerName={task.taskCustomer.customerName}
                              customerColor={task.taskCustomer.customerColor}
                              taskLow={task.taskTimeLow}
                              taskHigh={task.taskTimeHigh}
                              taskSprintId={task.taskSprints[0]._id}
                              taskSprintName={task.taskSprints[0].sprintName}
                              taskType={task.taskType}
                              estimatedTime={task?.estimatedTime}
                              taskDeadline={task?.taskDeadline}
                              toggleSmallCards={toggleSmallCards}
                              timeRegisteredTotal={task?.timeRegistrations.reduce(
                                (total, { timeRegistered }) => total + timeRegistered,
                                0
                              )}
                            />
                          </span>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </span>
                )}
              </Droppable>
            </span>
          ))}

          <span className=" border-l pl-3" id="taskDeadlines">
            <h3
              className={`flex items-center gap-1 font-bold mb-5 border-b pb-2 ${
                deadlineTasks.length > 0 ? "text-pink-700" : ""
              }`}
            >
              Deadlines next 7 days <FaInfoCircle className="text-xs" />
            </h3>

            {deadlineTasks.upcoming.length > 0 && (
              <>
                {deadlineTasks.upcoming.map((task) => (
                  <span onClick={() => {
                      navigate(`/${user.tenant_id}/workflow/task/${task.taskHandle}`);
                      handleTaskModal(task._id);
                    }} key={task._id}>
                    <TaskCardSmall
                      taskId={task._id}
                      taskName={task.taskName}
                      taskDeadline={task.taskDeadline}
                      toggleSmallCards={toggleSmallCards}
                    />
                  </span>
                ))}
              </>
            )}

            {deadlineTasks.overdue.length > 0 && (
              <>
                <p className="text-red-700 font-semibold mb-1">Missed deadlines.</p>
                {deadlineTasks.overdue.map((task) => (
                  <span 
                    onClick={() => {
                      navigate(`/${user.tenant_id}/workflow/task/${task.taskHandle}`);
                      handleTaskModal(task._id);
                    }}
                    key={task._id}>
                    <TaskCardSmall
                      taskId={task._id}
                      taskName={task.taskName}
                      taskDeadline={task.taskDeadline}
                      toggleSmallCards={toggleSmallCards}
                    />
                  </span>
                ))}
              </>
            )}

            {deadlineTasks.overdue.length === 0 &&
              deadlineTasks.upcoming.length === 0 && (
                <p className="font-bold text-sm text-slate-500">No deadlines</p>
              )}
          </span>
        </section>
      </DragDropContext>

      {selectedTaskId && (
        <TaskModal
          taskID={selectedTaskId}
          showModalState={showModal}
          onCloseModal={onCloseModal}
          fetchTasks={fetchTasksByUserAndSprint}
          updateFunc={fetchWorkflow}
          fetchDeadlineTasks={fetchDeadlineTasks}
          activeSprint={activeSprint}
          activeFilterUser={activeFilterUser}
          newSprintArray={newSprintArray}
        />
      )}
    </div>
  );
};

export default Workflow;