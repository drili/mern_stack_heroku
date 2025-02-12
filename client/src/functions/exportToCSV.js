const exportToCSV = (csvHeader, data, fileName) => {
    const csvRows = data.map(holiday => [
        holiday.userId.username,
        holiday.startTime,
        holiday.endTime,
        holiday.totalDays,
        holiday.status,
    ]);

    const csvContent = [csvHeader, ...csvRows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default exportToCSV