import "./index.css";

const CustomAlert = ({ message, onClose }) => {
  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CustomAlert;
