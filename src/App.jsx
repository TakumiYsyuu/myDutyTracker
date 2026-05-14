import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [isOpen, setOpen] = useState(false);
  const [duties, setDuties] = useState([]);

  const [form, setForm] = useState({
    dutyIn: "",
    dutyOut: "",
    overtime: "",
    hourlyRate: "",
    dayRate: "",
    otRate: "",
    payType: "hourly",
  });

  useEffect(() => {
    const saved = localStorage.getItem("duties");
    if (saved) {
      setDuties(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateHours = (dutyIn, dutyOut) => {
    if (!dutyIn || !dutyOut) return 0;
    const start = new Date(dutyIn);
    const end = new Date(dutyOut);
    const diff = end - start;
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 ? hours : 0;
  };

  const saveDuty = () => {
    const hoursWorked = calculateHours(form.dutyIn, form.dutyOut);
    const overtimeHours = Number(form.overtime) || 0;
    const otRate = Number(form.otRate) || 0;
    const otEarnings = overtimeHours * otRate;
    const regularHours = Math.max(hoursWorked - overtimeHours, 0);

    let baseEarnings = 0;
    if (form.payType === "hourly") {
      baseEarnings = regularHours * (Number(form.hourlyRate) || 0);
    } else if (form.payType === "daily") {
      baseEarnings = Number(form.dayRate) || 0;
    } else if (form.payType === "fixed") {
      baseEarnings = Number(form.dayRate || form.hourlyRate) || 0;
    }

    const totalEarnings = baseEarnings + otEarnings;

    const newEntry = {
      dutyIn: form.dutyIn,
      dutyOut: form.dutyOut,
      overtime: overtimeHours,
      hourlyRate: Number(form.hourlyRate) || 0,
      dayRate: Number(form.dayRate) || 0,
      otRate,
      payType: form.payType,
      hoursWorked: Number((hoursWorked + overtimeHours).toFixed(2)),
      baseEarnings: Number(baseEarnings.toFixed(2)),
      otEarnings: Number(otEarnings.toFixed(2)),
      earnings: Number(totalEarnings.toFixed(2)),
    };

    const updated = [...duties, newEntry];
    setDuties(updated);
    localStorage.setItem("duties", JSON.stringify(updated));
    setOpen(false);
    setForm({
      dutyIn: "",
      dutyOut: "",
      overtime: "",
      hourlyRate: "",
      dayRate: "",
      otRate: "",
      payType: "hourly",
    });
  };

  const getPreview = () => {
    const hoursWorked = calculateHours(form.dutyIn, form.dutyOut);
    const overtimeHours = Number(form.overtime) || 0;
    const otRate = Number(form.otRate) || 0;
    const otEarnings = overtimeHours * otRate;
    const regularHours = Math.max(hoursWorked - overtimeHours, 0);

    let baseEarnings = 0;
    if (form.payType === "hourly") {
      baseEarnings = regularHours * (Number(form.hourlyRate) || 0);
    } else if (form.payType === "daily") {
      baseEarnings = Number(form.dayRate) || 0;
    } else if (form.payType === "fixed") {
      baseEarnings = Number(form.dayRate || form.hourlyRate) || 0;
    }

    return {
      hoursWorked: hoursWorked.toFixed(2),
      regularHours: regularHours.toFixed(2),
      baseEarnings: baseEarnings.toFixed(2),
      otEarnings: otEarnings.toFixed(2),
      total: (baseEarnings + otEarnings).toFixed(2),
    };
  };

  const preview = getPreview();

  const totalHours = duties
    .reduce((sum, d) => sum + Number(d.hoursWorked || 0), 0)
    .toFixed(2);
  const totalPay = duties
    .reduce((sum, d) => sum + Number(d.earnings || 0), 0)
    .toFixed(2);
  const totalOT = duties
    .reduce((sum, d) => sum + Number(d.otEarnings || 0), 0)
    .toFixed(2);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D1B2A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 20px",
        fontFamily: "'DM Mono', 'Courier New', monospace",
        position: "relative",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(65,90,119,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(65,90,119,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#415A77",
              borderRadius: "6px",
              padding: "4px 12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#E0E1DD",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.15em",
                color: "#E0E1DD",
                textTransform: "uppercase",
              }}
            >
              Duty Tracker
            </span>
          </div>

          <h1
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "#E0E1DD",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              margin: 0,
              fontFamily: "'DM Serif Display', Georgia, serif",
            }}
          >
            KapitSaKinsenas
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "#778DA9",
              marginTop: "4px",
              letterSpacing: "0.05em",
            }}
          >
            Financial Tracker · by Victor
          </p>
        </div>

        {/* STAT CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <StatCard
            label="LOGGED DUTY"
            value={duties.length}
            unit=""
            accent="#415A77"
          />
          <StatCard
            label="TOTAL HOURS"
            value={totalHours}
            unit="hrs"
            accent="#415A77"
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          <StatCard
            label="OT PAY"
            value={`₱${totalOT}`}
            unit=""
            accent="#778DA9"
            highlight
          />
          <StatCard
            label="TOTAL PAY"
            value={`₱${totalPay}`}
            unit=""
            accent="#778DA9"
            highlight
          />
        </div>

        {/* ADD DUTY BUTTON */}
        <button
          onClick={() => setOpen(!isOpen)}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: isOpen ? "#1B263B" : "#415A77",
            color: "#E0E1DD",
            border: `1px solid ${isOpen ? "#415A77" : "#778DA9"}`,
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.12em",
            cursor: "pointer",
            textTransform: "uppercase",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: "300" }}>
            {isOpen ? "−" : "+"}
          </span>
          {isOpen ? "Cancel" : "Log New Duty"}
        </button>

        {/* MODAL FORM */}
        {isOpen && (
          <div
            style={{
              marginTop: "12px",
              backgroundColor: "#1B263B",
              borderRadius: "14px",
              border: "1px solid #415A77",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* PAY TYPE TOGGLE */}
            <div>
              <FieldLabel>Pay Type</FieldLabel>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "6px",
                  marginTop: "6px",
                }}
              >
                {["hourly", "daily", "fixed"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, payType: type })}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "8px",
                      border: `1px solid ${form.payType === type ? "#778DA9" : "#415A77"}`,
                      backgroundColor:
                        form.payType === type ? "#415A77" : "transparent",
                      color: form.payType === type ? "#E0E1DD" : "#778DA9",
                      fontSize: "11px",
                      fontWeight: "600",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* DUTY IN / OUT */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <FieldLabel>Duty In</FieldLabel>
                <StyledInput
                  type="datetime-local"
                  name="dutyIn"
                  value={form.dutyIn}
                  onChange={handleChange}
                />
              </div>
              <div>
                <FieldLabel>Duty Out</FieldLabel>
                <StyledInput
                  type="datetime-local"
                  name="dutyOut"
                  value={form.dutyOut}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* RATES */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {form.payType === "hourly" && (
                <div>
                  <FieldLabel>Hourly Rate (₱)</FieldLabel>
                  <StyledInput
                    type="number"
                    name="hourlyRate"
                    value={form.hourlyRate}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                  />
                </div>
              )}
              {(form.payType === "daily" || form.payType === "fixed") && (
                <div>
                  <FieldLabel>
                    {form.payType === "daily" ?
                      "Day Rate (₱)"
                    : "Fixed Amount (₱)"}
                  </FieldLabel>
                  <StyledInput
                    type="number"
                    name="dayRate"
                    value={form.dayRate}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                  />
                </div>
              )}
              <div>
                <FieldLabel>OT Rate/hr (₱)</FieldLabel>
                <StyledInput
                  type="number"
                  name="otRate"
                  value={form.otRate}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                />
              </div>
              <div>
                <FieldLabel>Overtime Hours</FieldLabel>
                <StyledInput
                  type="number"
                  name="overtime"
                  value={form.overtime}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div
              style={{
                backgroundColor: "#0D1B2A",
                borderRadius: "10px",
                border: "1px solid #415A77",
                padding: "14px",
              }}
            >
              <p
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                  color: "#415A77",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Live Preview
              </p>
              <PreviewRow
                label="Total clocked"
                value={`${preview.hoursWorked} hrs`}
              />
              <PreviewRow
                label="Regular hrs"
                value={`${preview.regularHours} hrs`}
                dim
              />
              <PreviewRow
                label="OT hrs"
                value={`${form.overtime || 0} hrs`}
                dim
              />
              <div
                style={{
                  borderTop: "1px solid #1B263B",
                  marginTop: "8px",
                  paddingTop: "8px",
                }}
              >
                <PreviewRow
                  label="Base pay"
                  value={`₱${preview.baseEarnings}`}
                />
                <PreviewRow
                  label={`OT (${form.overtime || 0}h × ₱${form.otRate || 0})`}
                  value={`₱${preview.otEarnings}`}
                />
              </div>
              <div
                style={{
                  borderTop: "1px solid #415A77",
                  marginTop: "8px",
                  paddingTop: "8px",
                }}
              >
                <PreviewRow label="TOTAL" value={`₱${preview.total}`} bold />
              </div>
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={saveDuty}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#778DA9",
                color: "#0D1B2A",
                border: "none",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "0.12em",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "background-color 0.15s ease",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#E0E1DD")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#778DA9")}
            >
              Save Duty
            </button>
          </div>
        )}

        {/* DUTY LOG LIST */}
        {duties.length > 0 && (
          <div style={{ marginTop: "28px" }}>
            <p
              style={{
                fontSize: "9px",
                letterSpacing: "0.15em",
                color: "#415A77",
                fontWeight: "700",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Duty Log — {duties.length}{" "}
              {duties.length === 1 ? "entry" : "entries"}
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {duties.map((d, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#1B263B",
                    borderRadius: "10px",
                    border: "1px solid #415A77",
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#778DA9",
                        letterSpacing: "0.05em",
                        margin: 0,
                      }}
                    >
                      {d.dutyIn ?
                        new Date(d.dutyIn).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                      {" · "}
                      <span
                        style={{
                          textTransform: "uppercase",
                          fontSize: "10px",
                          color: "#415A77",
                        }}
                      >
                        {d.payType}
                      </span>
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#E0E1DD",
                        fontWeight: "600",
                        margin: "2px 0 0",
                      }}
                    >
                      {d.hoursWorked} hrs
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#E0E1DD",
                        margin: 0,
                      }}
                    >
                      ₱{d.earnings}
                    </p>
                    {d.otEarnings > 0 && (
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#778DA9",
                          margin: "2px 0 0",
                        }}
                      >
                        +₱{d.otEarnings} OT
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, unit, highlight }) {
  return (
    <div
      style={{
        backgroundColor: "#1B263B",
        borderRadius: "12px",
        border: `1px solid ${highlight ? "#778DA9" : "#415A77"}`,
        padding: "16px",
      }}
    >
      <p
        style={{
          fontSize: "9px",
          letterSpacing: "0.15em",
          color: "#415A77",
          fontWeight: "700",
          textTransform: "uppercase",
          margin: "0 0 8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: highlight ? "20px" : "22px",
          fontWeight: "700",
          color: highlight ? "#E0E1DD" : "#778DA9",
          margin: 0,
          letterSpacing: "-0.02em",
          fontFamily: "'DM Serif Display', Georgia, serif",
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: "12px",
              marginLeft: "4px",
              fontWeight: "400",
              color: "#415A77",
            }}
          >
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "9px",
        letterSpacing: "0.12em",
        color: "#778DA9",
        fontWeight: "700",
        textTransform: "uppercase",
        marginBottom: "5px",
      }}
    >
      {children}
    </label>
  );
}

function StyledInput({ ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "9px 10px",
        backgroundColor: "#0D1B2A",
        border: "1px solid #415A77",
        borderRadius: "8px",
        color: "#E0E1DD",
        fontSize: "12px",
        fontFamily: "'DM Mono', 'Courier New', monospace",
        outline: "none",
        boxSizing: "border-box",
        colorScheme: "dark",
      }}
    />
  );
}

function PreviewRow({ label, value, dim, bold }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "4px",
      }}
    >
      <span style={{ fontSize: "11px", color: dim ? "#415A77" : "#778DA9" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: bold ? "13px" : "11px",
          fontWeight: bold ? "700" : "500",
          color:
            bold ? "#E0E1DD"
            : dim ? "#415A77"
            : "#778DA9",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default App;
