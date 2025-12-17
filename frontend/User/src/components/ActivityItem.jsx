import React from "react";

const ActivityItem = ({ title, detail, time, credits }) => {
  return (
    <div className="activity-item">
      <div className="activity-header">
        <strong>{title}</strong>
        
      </div>
      <div className="activity-detail">
        {detail}
      </div>
      <div className="activity-time">{time}</div>
    </div>
  );
};

export default ActivityItem;
