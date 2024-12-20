import React from 'react';
import '../../Login/CheckList/CheckList.css';
interface ChecklistProps {
  checks: {
    hasUpperCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    minLength: boolean;
  };
}

const Checklist: React.FC<ChecklistProps> = ({ checks }) => {
  return (
    <div className="checklist">
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>
        <input
          type="checkbox"
          value="1"
          id="01"
          readOnly
          checked={checks.hasUpperCase}
        />
        <label htmlFor="01">Contains Atleast 1 uppercase</label>
      </li>
      <li>
        <input
          type="checkbox"
          value="2"
          id="02"
          readOnly
          checked={checks.hasNumber}
        />
        <label htmlFor="02">Contains Atleast 1 number</label>
       </li>
       <li>

        <input
          type="checkbox"
          value="3"
          id="03"
          readOnly
          checked={checks.hasSpecialChar}
        />
        <label htmlFor="03">Atleast 1 special character</label>
        </li>
        <li>
        <input
          type="checkbox"
          value="4"
          id="04"
          readOnly
          checked={checks.minLength}
        />
        <label htmlFor="04">Atleast 12 letters long</label>
        </li>
        </ul>
      </div>
  );
};

export default Checklist;
