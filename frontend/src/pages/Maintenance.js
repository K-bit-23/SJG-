import React from 'react';

const Maintenance = () => {
    const css = `
    .maintenance-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      width: 100vw;
      position: absolute;
      top: 0;
      left: 0;
    }

    .maintenance-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 3rem 4rem;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      max-width: 500px;
      width: 90%;
      animation: fadeIn 1s ease-out;
    }

    .maintenance-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      letter-spacing: 1px;
    }

    .maintenance-text {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      line-height: 1.5;
      opacity: 0.9;
    }

    .maintenance-loader {
      margin: 2rem 0;
      display: flex;
      justify-content: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      animation: spin 1s linear infinite;
    }

    .maintenance-subtext {
      font-size: 1rem;
      opacity: 0.8;
      margin-top: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="maintenance-container">
                <div className="maintenance-card">
                    <h1 className="maintenance-title">SJG Stationery</h1>
                    <p className="maintenance-text">
                        We're updating our website with amazing new features!
                    </p>
                    <div className="maintenance-loader">
                        <div className="spinner"></div>
                    </div>
                    <p className="maintenance-subtext">Site will be live soon!</p>
                </div>
            </div>
        </>
    );
};

export default Maintenance;
