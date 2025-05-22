import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'
import { BsCalendarFill } from "react-icons/bs"
import { UserContext } from '../../context/UserContext'
import { ConfigContext } from '../../context/ConfigContext'

const CustomerExportTasksToExcel = ({ customerId, tenantBaseURL, customerName }) => {
    const { user } = useContext(UserContext)
    const [sprints, setSprints] = useState([])
    const [selectedSprintId, setSelectedSprintId] = useState("")
    const [loading, setLoading] = useState(false)    
    const { baseURL } = useContext(ConfigContext)
    
    const inputClasses = "rounded text-slate-800 text-sm min-h-[45px] w-full border border-zinc-400 cursor-pointer "

    const fetchSprints = async () => {
        try {
            const response = await axios.get(`${baseURL}/sprints/fetch?activeYear=${user.active_year}`)
            setSprints(response.data);
        } catch (error) {
            console.error('Failed to fetch sprints', error);
            
        }
    }

    const handleExport = async () => {
        if (!selectedSprintId) {
            toast.error("Please select a sprint first");
            return;
        }
    
        setLoading(true);
    
        try {
            const response = await axios.get(`${tenantBaseURL}/tasks/export-customer-sprints-to-excel`, {
                params: {
                    customerId,
                    sprintId: selectedSprintId,
                },
            });
    
            const { groupedTasks } = response.data;
            const currentDate = new Date().toISOString().split("T")[0];
    
            const sheetRows = [];
    
            for (const [vertical, tasks] of Object.entries(groupedTasks)) {
                sheetRows.push({ "Vertical": vertical }); // Group header
    
                tasks.forEach(task => {
                    sheetRows.push(task);
                });
    
                sheetRows.push({});
            }
    
            if (sheetRows.length === 0) {
                toast("No tasks found in selected sprint", {
                    duration: 4000,
                    position: 'top-center',
                    style: { background: '#fbbf24', color: '#000' }
                });
                setLoading(false);
                return;
            }
    
            const worksheet = XLSX.utils.json_to_sheet(sheetRows, { skipHeader: false });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Tasks");
    
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, `${customerName}_tasks_oversigt_${currentDate}.xlsx`);
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Failed to export data");
        }
    
        setLoading(false);
    };        

    useEffect(() => {
        fetchSprints()
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2 items-center">
                <select
                    className={`${inputClasses} min-w-[200px]`}
                    value={selectedSprintId}
                    onChange={(e) => setSelectedSprintId(e.target.value)}
                >
                    <option value="" disabled>Select sprint</option>
                    {sprints.map((sprint) => (
                        <option key={sprint._id} value={sprint._id}>
                            {sprint.sprintName}
                        </option>
                    ))}
                </select>
                <BsCalendarFill size={20} />
            </div>

            <button
                onClick={handleExport}
                disabled={loading || !selectedSprintId}
                className="bg-pink-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {loading ? "Exporting..." : "Export tasks for sprint"}
            </button>
        </div>
    )
}

export default CustomerExportTasksToExcel