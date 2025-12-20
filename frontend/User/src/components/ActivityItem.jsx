import React from 'react';
import '../styles/ActivityItem.css';

const ActivityItem = ({ titleIcon, title, detail, time, credits }) => {
  return (
    <div className="activity-item">
      <div className="activity-header">
        <div className="activity-title-wrapper">
          {titleIcon && <span className="activity-icon">{titleIcon}</span>}
          <h3 className="activity-title">{title}</h3>
        </div>
        {credits && <span className="activity-credits">{credits}</span>}
      </div>
      
      <div className="activity-details">
        {detail}
      </div>
      
      <div className="activity-footer">
        <span className="activity-time">{time}</span>
      </div>
    </div>
  );
};

export default ActivityItem;
