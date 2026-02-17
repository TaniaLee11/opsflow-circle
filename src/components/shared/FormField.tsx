import { C } from "./theme";

interface FormFieldProps {
  label: string;
  type?: "text" | "email" | "number" | "date" | "datetime-local" | "textarea" | "select";
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
}

export function FormField({ label, type = "text", value, onChange, placeholder, options, rows = 4 }: FormFieldProps) {
  const inputStyle = {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.text1,
    padding: "8px 12px",
    fontSize: 13,
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", color: C.text2, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : type === "select" && options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );
}
