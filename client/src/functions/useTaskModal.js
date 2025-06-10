import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const useTaskModal = () => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // 👈 her hentes tenantId

  useEffect(() => {
    if (user === null) {
      navigate(`/login`);
    }
  }, [user, navigate]);

  const handleTaskModal = (taskId, handle) => {
    console.log({ handle });
    setShowModal(true);
    setSelectedTaskId(taskId);

    if (!user) {
        return;
    }
  

    if (user?.tenant_id && handle && taskId) {
      navigate(`/${user.tenant_id}/workflow/task/${handle}-${taskId}`);
    }
  };

  const onCloseModal = () => {
    setShowModal(false);
    setSelectedTaskId(null);

    if (user?.tenant_id) {
      navigate(`/${user.tenant_id}/workflow`);
    } else {
      navigate(`/workflow`);
    }
  };

  return {
    selectedTaskId,
    showModal,
    setShowModal,
    handleTaskModal,
    onCloseModal,
  };
};

export default useTaskModal;
