import React from 'react';
import './Maintenance.css';

const Maintenance = () => {
    return (
        <div className="maintenanceContainer">
            <div className="maintenanceCard">
                <h1 className="maintenanceTitle">SJG Stationery</h1>
                <p className="maintenanceText">
                    We're updating our website with amazing new features!
                </p>
                <div className="maintenanceLoader">
                    <div className="spinner"></div>
                </div>
                <p className="maintenanceSubtext">Site will be live soon!</p>
            </div>
        </div>
    );
};

export default Maintenance;
