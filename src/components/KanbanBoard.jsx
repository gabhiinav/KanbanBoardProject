import React, { useState, useEffect } from "react";
import "./styles.css";

import menuIcon from "../assets/menu.svg";
import addIcon from "../assets/add.svg";
import backlogIcon from "../assets/Backlog.svg";
import cancelledIcon from "../assets/Cancelled.svg";
import displayIcon from "../assets/Display.svg";
import doneIcon from "../assets/Done.svg";
import downIcon from "../assets/down.svg";
import highPriorityIcon from "../assets/Img - High Priority.svg";
import lowPriorityIcon from "../assets/Img - Low Priority.svg";
import mediumPriorityIcon from "../assets/Img - Medium Priority.svg";
import inProgressIcon from "../assets/in-progress.svg";
import noPriorityIcon from "../assets/No-priority.svg";
import urgentPriorityColorIcon from "../assets/SVG - Urgent Priority colour.svg";
import urgentPriorityGreyIcon from "../assets/SVG - Urgent Priority grey.svg";
import todoIcon from "../assets/To-do.svg";

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState(
    () => localStorage.getItem("grouping") || "status"
  );
  const [sorting, setSorting] = useState(
    () => localStorage.getItem("sorting") || "priority"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.quicksell.co/v1/internal/frontend-assignment"
        );
        const data = await response.json();
        setTickets(data.tickets);
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Save view state
  useEffect(() => {
    localStorage.setItem("grouping", grouping);
    localStorage.setItem("sorting", sorting);
  }, [grouping, sorting]);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 4:
        return (
          <img src={urgentPriorityColorIcon} alt="Urgent" className="icon" />
        );
      case 3:
        return <img src={highPriorityIcon} alt="High" className="icon" />;
      case 2:
        return <img src={mediumPriorityIcon} alt="Medium" className="icon" />;
      case 1:
        return <img src={lowPriorityIcon} alt="Low" className="icon" />;
      default:
        return <img src={noPriorityIcon} alt="No Priority" className="icon" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "backlog":
        return <img src={backlogIcon} alt="Backlog" className="icon" />;
      case "todo":
        return <img src={todoIcon} alt="Todo" className="icon" />;
      case "in progress":
        return <img src={inProgressIcon} alt="In Progress" className="icon" />;
      case "done":
        return <img src={doneIcon} alt="Done" className="icon" />;
      case "cancelled":
        return <img src={cancelledIcon} alt="Cancelled" className="icon" />;
      default:
        return <img src={todoIcon} alt="Default" className="icon" />;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 4:
        return "Urgent";
      case 3:
        return "High";
      case 2:
        return "Medium";
      case 1:
        return "Low";
      default:
        return "No Priority";
    }
  };

  const sortTickets = (tickets) => {
    return [...tickets].sort((a, b) => {
      if (sorting === "priority") {
        return b.priority - a.priority;
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  };

  const groupTickets = () => {
    let groupedTickets = {};

    if (grouping === "status") {
      groupedTickets = tickets.reduce((acc, ticket) => {
        const status = ticket.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(ticket);
        return acc;
      }, {});
    } else if (grouping === "user") {
      groupedTickets = tickets.reduce((acc, ticket) => {
        const user = users.find((u) => u.id === ticket.userId);
        const userName = user ? user.name : "Unassigned";
        if (!acc[userName]) acc[userName] = [];
        acc[userName].push(ticket);
        return acc;
      }, {});
    } else if (grouping === "priority") {
      groupedTickets = tickets.reduce((acc, ticket) => {
        const priority = getPriorityLabel(ticket.priority);
        if (!acc[priority]) acc[priority] = [];
        acc[priority].push(ticket);
        return acc;
      }, {});
    }

    // Sort tickets within each group
    Object.keys(groupedTickets).forEach((key) => {
      groupedTickets[key] = sortTickets(groupedTickets[key]);
    });

    return groupedTickets;
  };

    return (
      <div className="kanban-container">
        {/* Header */}
        <div className="header">
          <div className="dropdown-container">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="display-button"
            >
              <img src={displayIcon} alt="Display" className="icon" />
              <span>Display</span>
              <img src={downIcon} alt="Down" className="icon" />
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <div className="dropdown-section">
                    <label className="dropdown-label">Grouping</label>
                    <select
                      value={grouping}
                      onChange={(e) => setGrouping(e.target.value)}
                      className="dropdown-select"
                    >
                      <option value="status">Status</option>
                      <option value="user">User</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                  <div className="dropdown-section">
                    <label className="dropdown-label">Ordering</label>
                    <select
                      value={sorting}
                      onChange={(e) => setSorting(e.target.value)}
                      className="dropdown-select"
                    >
                      <option value="priority">Priority</option>
                      <option value="title">Title</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="board-container">
          <div className="board-grid">
            {Object.entries(groupTickets()).map(([groupName, groupTickets]) => (
              <div key={groupName} className="group-column">
                <div className="group-header">
                  <div className="group-header-left">
                    {grouping === "status" && getStatusIcon(groupName)}
                    {grouping === "user" && (
                      <div className="user-avatar">{groupName[0]}</div>
                    )}
                    {grouping === "priority" &&
                      getPriorityIcon(
                        Object.keys(getPriorityLabel).find(
                          (key) => getPriorityLabel(Number(key)) === groupName
                        )
                      )}
                    <span className="group-title">{groupName}</span>
                    <span className="group-count">{groupTickets.length}</span>
                  </div>
                  <div className="group-header-right">
                    <img src={addIcon} alt="Add" className="icon clickable" />
                    <img src={menuIcon} alt="Menu" className="icon clickable" />
                  </div>
                </div>

                <div className="tickets-container">
                  {groupTickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-card">
                      <div className="ticket-header">
                        <span className="ticket-id">{ticket.id}</span>
                        {ticket.userId && (
                          <div className="user-avatar">
                            {users.find((u) => u.id === ticket.userId)
                              ?.name[0] || "?"}
                          </div>
                        )}
                      </div>
                      <div className="ticket-content">
                        {grouping !== "status" && getStatusIcon(ticket.status)}
                        <p className="ticket-title">{ticket.title}</p>
                      </div>
                      <div className="ticket-tags">
                        {grouping !== "priority" && (
                          <div className="priority-icon">
                            {getPriorityIcon(ticket.priority)}
                          </div>
                        )}
                        {ticket.tag.map((tag, index) => (
                          <span key={index} className="tag">
                            <img
                              src={
                                tag.toLowerCase() === "feature request"
                                  ? urgentPriorityGreyIcon
                                  : noPriorityIcon
                              }
                              alt={tag}
                              className="tag-icon"
                            />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
};

export default KanbanBoard;

            