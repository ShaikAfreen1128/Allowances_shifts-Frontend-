import React, { useState, useEffect } from "react";
import { updateEmployeeShift } from "../utils/helper";
import { useEmployeeData } from "../hooks/useEmployeeData";

const getDaysInMonth = (monthStr) => {
  if (!monthStr) return 31;
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month, 0).getDate();
};

const SHIFT_KEYS = ["A", "B", "C", "PRIME"];
const UI_LABEL = { A: "Shift A", B: "Shift B", C: "Shift C", PRIME: "Prime" };

const EmployeeModal = ({ employee, onClose, loading, setPopupMessage, setPopupType }) => {
  const { setOnSave } = useEmployeeData();

  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  
  useEffect(() => {
    if (employee) setData(employee);
  }, [employee]);

  if ((!employee && !loading) || !data) return null;

  

const updateShift = (key, value) => {
 
  if (!/^\d*$/.test(value)) {
   
    setPopupMessage("Only numeric values are allowed for shift days");
    setPopupType("error");

    const cleanedValue = value.replace(/\D/g, "");

    setData(prev => ({
      ...prev,
      [key]: cleanedValue === "" ? "" : Number(cleanedValue),
    }));

    return;
  }


  setData(prev => {
    const updated = {
      ...prev,
      [key]: value === "" ? "" : Number(value),
    };

    const totalShifts = SHIFT_KEYS.reduce(
      (sum, k) => sum + (Number(updated[k]) || 0),
      0
    );

    const monthDays = getDaysInMonth(updated.duration_month);

    if (totalShifts > monthDays) {
      setError(
        `Total shift days (${totalShifts}) exceed days in month (${monthDays})`
      );
    } else {
      setError("");
    }

    return updated;
  });
};


  const resetChanges = () => {
    setData(employee);
    setIsEditing(false);
    setError("");
   
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      ;

      const token = localStorage.getItem("access_token");

      const payload = {
        shift_a: String(data.A || 0),
        shift_b: String(data.B || 0),
        shift_c: String(data.C || 0),
        prime: String(data.PRIME || 0),
      };

      await updateEmployeeShift(
        data.emp_id,
        data.duration_month,
        data.payroll_month,
        payload
      );

      const successMessage = `EMP ID: ${data.emp_id} updated successfully`;

      
      setPopupMessage(successMessage);
      setPopupType("success");

      setOnSave(true);

      onClose(); 
      setIsEditing(false);
    
      } catch (err) {
  const backendMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.response?.data?.detail ||
    err?.message ||
    "Something went wrong";

  const errorMessage = `EMP ID: ${data.emp_id} update failed: ${backendMessage}`;

  
 
  setPopupMessage(errorMessage);
  setPopupType("error");

  


    } finally {
      setSaving(false);
    }
  };

  const fieldsToShow = { ...data };
  ["A", "B", "C", "PRIME", "emp_id", "emp_name", "total_allowance"].forEach(
    (key) => delete fieldsToShow[key]
  );

  const formatDateDisplay = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3"
      onClick={() => {
        resetChanges();
        onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[760px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <div className="flex justify-end p-3">
          <button
            className="text-gray-500 hover:text-red-600 text-xl"
            onClick={() => {
              resetChanges();
              onClose();
            }}
          >
            ✖
          </button>
        </div>

        <div className="px-4 space-y-6">
          {/* Employee Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info
              label="Duration Month"
              value={formatDateDisplay(
                data.duration_month ? data.duration_month + "-01" : null
              )}
            />
            <Info label="Total Allowance" value={data.total_allowance ?? "-"} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Info label="Employee ID" value={data.emp_id} />
            <Info label="Employee Name" value={data.emp_name} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(fieldsToShow)
              .filter(([key]) => key !== "id" && key !== "duration_month" && key !== "total_allowances")
              .map(([key, value]) => {
                const isDateField = ["payroll_month", "created_at", "updated_at"].includes(key);
                return <Info key={key} label={formatLabel(key)} value={isDateField ? formatDateDisplay(value) : value || "-"} />;
              })}
          </div>

          {/* Shift inputs */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            {SHIFT_KEYS.map((key) => (
              <div key={key} className="p-3 border rounded-lg bg-gray-50">
                <p className="text-xs font-semibold text-gray-700">{UI_LABEL[key]}</p>
                {isEditing ? (
                  <input
                    // type="number"
                    // min="0"
                    type="text"
  inputMode="numeric"
  pattern="[0-9]*"
                    value={data[key] ?? ""}
                    onChange={(e) => updateShift(key, e.target.value)}
                    className="mt-2 border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="mt-2">{data[key] === "" ? "-" : data[key]}</p>
                )}
              </div>
            ))}
          </div>

        

          {/* Shift total error */}
          {error && (
            <p className="text-red-600 text-sm font-medium mt-2">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 m-4">
            {isEditing ? (
              <>
                <button className="px-5 py-2 border rounded-lg" onClick={resetChanges}>Cancel</button>
                <button
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300"
                  disabled={saving || Boolean(error)}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button className="px-5 py-2 bg-yellow-500 text-white rounded-lg" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatLabel = (str) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Info = ({ label, value }) => (
  <div className="flex items-center gap-1 text-sm">
    <span className="font-medium text-[16px]">{label}:</span>
    <span>{value}</span>
  </div>
);

export default EmployeeModal;
