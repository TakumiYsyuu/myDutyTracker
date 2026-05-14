import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [isOpen, setOpen] = useState(false);
  const [duties, setDuties] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const emptyForm = {
    dutyIn: "",
    dutyOut: "",
    overtime: "",
    hourlyRate: "",
    dayRate: "",
    otRate: "",
    payType: "hourly",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const saved = localStorage.getItem("duties");
    if (saved) setDuties(JSON.parse(saved));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const calculateHours = (dutyIn, dutyOut) => {
    if (!dutyIn || !dutyOut) return 0;
    const diff = new Date(dutyOut) - new Date(dutyIn);
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 ? hours : 0;
  };

  const computeEntry = (f) => {
    const hoursWorked = calculateHours(f.dutyIn, f.dutyOut);
    const overtimeHours = Number(f.overtime) || 0;
    const otRate = Number(f.otRate) || 0;
    const otEarnings = overtimeHours * otRate;
    const regularHours = Math.max(hoursWorked - overtimeHours, 0);

    let baseEarnings = 0;
    if (f.payType === "hourly")
      baseEarnings = regularHours * (Number(f.hourlyRate) || 0);
    else if (f.payType === "daily") baseEarnings = Number(f.dayRate) || 0;
    else if (f.payType === "fixed")
      baseEarnings = Number(f.dayRate || f.hourlyRate) || 0;

    return {
      dutyIn: f.dutyIn,
      dutyOut: f.dutyOut,
      overtime: overtimeHours,
      hourlyRate: Number(f.hourlyRate) || 0,
      dayRate: Number(f.dayRate) || 0,
      otRate,
      payType: f.payType,
      hoursWorked: Number((hoursWorked + overtimeHours).toFixed(2)),
      regularHours: Number(regularHours.toFixed(2)),
      baseEarnings: Number(baseEarnings.toFixed(2)),
      otEarnings: Number(otEarnings.toFixed(2)),
      earnings: Number((baseEarnings + otEarnings).toFixed(2)),
    };
  };

  const saveDuty = () => {
    const entry = computeEntry(form);
    let updated;
    if (editingIndex !== null) {
      updated = duties.map((d, i) => (i === editingIndex ? entry : d));
      setEditingIndex(null);
    } else {
      updated = [...duties, entry];
    }
    setDuties(updated);
    localStorage.setItem("duties", JSON.stringify(updated));
    setOpen(false);
    setForm(emptyForm);
  };

  const startEdit = (i) => {
    const d = duties[i];
    setForm({
      dutyIn: d.dutyIn || "",
      dutyOut: d.dutyOut || "",
      overtime: d.overtime?.toString() || "",
      hourlyRate: d.hourlyRate?.toString() || "",
      dayRate: d.dayRate?.toString() || "",
      otRate: d.otRate?.toString() || "",
      payType: d.payType || "hourly",
    });
    setEditingIndex(i);
    setOpen(true);
    setExpandedIndex(null);
  };

  const deleteDuty = (i) => {
    const updated = duties.filter((_, idx) => idx !== i);
    setDuties(updated);
    localStorage.setItem("duties", JSON.stringify(updated));
    setDeleteConfirm(null);
    if (expandedIndex === i) setExpandedIndex(null);
  };

  const cancelForm = () => {
    setOpen(false);
    setEditingIndex(null);
    setForm(emptyForm);
  };

  const preview = computeEntry(form);
  const totalHours = duties
    .reduce((s, d) => s + Number(d.hoursWorked || 0), 0)
    .toFixed(2);
  const totalPay = duties
    .reduce((s, d) => s + Number(d.earnings || 0), 0)
    .toFixed(2);
  const totalOT = duties
    .reduce((s, d) => s + Number(d.otEarnings || 0), 0)
    .toFixed(2);

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("en-PH", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const formatTime = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatDT = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D1B2A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 20px 60px",
        fontFamily: "'DM Mono', 'Courier New', monospace",
        position: "relative",
      }}
    >
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
          maxWidth: "440px",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: "28px" }}>
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
            marginBottom: "10px",
          }}
        >
          <StatCard label="LOGGED DUTY" value={duties.length} />
          <StatCard label="TOTAL HOURS" value={totalHours} unit="hrs" />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <StatCard label="OT PAY" value={`₱${totalOT}`} highlight />
          <StatCard label="TOTAL PAY" value={`₱${totalPay}`} highlight />
        </div>

        {/* ADD DUTY BUTTON */}
        <button
          onClick={isOpen ? cancelForm : () => setOpen(true)}
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
          {isOpen ?
            editingIndex !== null ?
              "Cancel Edit"
            : "Cancel"
          : "Log New Duty"}
        </button>

        {/* FORM */}
        {isOpen && (
          <div
            style={{
              marginTop: "12px",
              backgroundColor: "#1B263B",
              borderRadius: "14px",
              border: `1px solid ${editingIndex !== null ? "#778DA9" : "#415A77"}`,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {editingIndex !== null && (
              <div
                style={{
                  backgroundColor: "#0D1B2A",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "#778DA9",
                    letterSpacing: "0.1em",
                  }}
                >
                  ✏ EDITING ENTRY #{editingIndex + 1}
                </span>
              </div>
            )}

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
                  margin: "0 0 10px",
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
                <PreviewRow label="TOTAL" value={`₱${preview.earnings}`} bold />
              </div>
            </div>

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
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#E0E1DD")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#778DA9")}
            >
              {editingIndex !== null ? "Update Duty" : "Save Duty"}
            </button>
          </div>
        )}

        {/* DUTY LOG */}
        {duties.length > 0 && (
          <div style={{ marginTop: "28px" }}>
            <p
              style={{
                fontSize: "9px",
                letterSpacing: "0.15em",
                color: "#415A77",
                fontWeight: "700",
                textTransform: "uppercase",
                margin: "0 0 14px",
              }}
            >
              Duty Log — {duties.length}{" "}
              {duties.length === 1 ? "entry" : "entries"}
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {duties.map((d, i) => (
                <div key={i}>
                  {deleteConfirm === i ?
                    /* DELETE CONFIRM */
                    <div
                      style={{
                        backgroundColor: "#1B263B",
                        borderRadius: "12px",
                        border: "1px solid #778DA9",
                        padding: "18px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#E0E1DD",
                          fontWeight: "600",
                        }}
                      >
                        Delete this entry?
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          color: "#778DA9",
                        }}
                      >
                        {formatDate(d.dutyIn)} · {d.hoursWorked} hrs · ₱
                        {d.earnings}
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            padding: "10px",
                            backgroundColor: "transparent",
                            color: "#778DA9",
                            border: "1px solid #415A77",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: "700",
                            letterSpacing: "0.08em",
                            cursor: "pointer",
                            textTransform: "uppercase",
                          }}
                        >
                          Keep It
                        </button>
                        <button
                          onClick={() => deleteDuty(i)}
                          style={{
                            padding: "10px",
                            backgroundColor: "#415A77",
                            color: "#E0E1DD",
                            border: "1px solid #778DA9",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: "700",
                            letterSpacing: "0.08em",
                            cursor: "pointer",
                            textTransform: "uppercase",
                          }}
                        >
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  : /* DUTY CARD */
                    <div
                      style={{
                        backgroundColor: "#1B263B",
                        borderRadius: "12px",
                        border: `1px solid ${expandedIndex === i ? "#778DA9" : "#415A77"}`,
                        overflow: "hidden",
                      }}
                    >
                      {/* CARD TOP — clickable to expand */}
                      <div
                        onClick={() =>
                          setExpandedIndex(expandedIndex === i ? null : i)
                        }
                        style={{
                          padding: "14px 16px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "9px",
                                letterSpacing: "0.12em",
                                color: "#0D1B2A",
                                backgroundColor: "#415A77",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                              }}
                            >
                              {d.payType}
                            </span>
                            <span
                              style={{ fontSize: "10px", color: "#415A77" }}
                            >
                              #{i + 1}
                            </span>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              color: "#E0E1DD",
                              fontWeight: "600",
                            }}
                          >
                            {formatDate(d.dutyIn)}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              color: "#778DA9",
                            }}
                          >
                            {formatTime(d.dutyIn)} → {formatTime(d.dutyOut)}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              color: "#778DA9",
                            }}
                          >
                            {d.hoursWorked} hrs total ·{" "}
                            {d.regularHours ?? d.hoursWorked - d.overtime} reg +{" "}
                            {d.overtime} OT
                          </p>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "4px",
                            minWidth: "80px",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "20px",
                              fontWeight: "700",
                              color: "#E0E1DD",
                              fontFamily: "'DM Serif Display', Georgia, serif",
                            }}
                          >
                            ₱{d.earnings}
                          </p>
                          {d.otEarnings > 0 && (
                            <span
                              style={{ fontSize: "10px", color: "#778DA9" }}
                            >
                              +₱{d.otEarnings} OT
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "9px",
                              color: "#415A77",
                              marginTop: "6px",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {expandedIndex === i ? "▲ less" : "▼ details"}
                          </span>
                        </div>
                      </div>

                      {/* EXPANDED */}
                      {expandedIndex === i && (
                        <div style={{ borderTop: "1px solid #415A77" }}>
                          {/* FULL INFO GRID */}
                          <div
                            style={{
                              padding: "16px",
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "14px",
                            }}
                          >
                            <InfoCell
                              label="Duty In"
                              value={formatDT(d.dutyIn)}
                            />
                            <InfoCell
                              label="Duty Out"
                              value={formatDT(d.dutyOut)}
                            />
                            <InfoCell
                              label="Total Hours"
                              value={`${d.hoursWorked} hrs`}
                            />
                            <InfoCell
                              label="Regular Hours"
                              value={`${d.regularHours ?? d.hoursWorked - d.overtime} hrs`}
                            />
                            <InfoCell
                              label="Overtime Hours"
                              value={`${d.overtime} hrs`}
                            />
                            <InfoCell
                              label="OT Rate"
                              value={d.otRate > 0 ? `₱${d.otRate}/hr` : "—"}
                            />
                            {d.payType === "hourly" && (
                              <InfoCell
                                label="Hourly Rate"
                                value={`₱${d.hourlyRate}/hr`}
                              />
                            )}
                            {(d.payType === "daily" ||
                              d.payType === "fixed") && (
                              <InfoCell
                                label={
                                  d.payType === "daily" ?
                                    "Day Rate"
                                  : "Fixed Amount"
                                }
                                value={`₱${d.dayRate}`}
                              />
                            )}
                            <InfoCell
                              label="Base Pay"
                              value={`₱${d.baseEarnings}`}
                            />
                            <InfoCell
                              label="OT Pay"
                              value={`₱${d.otEarnings}`}
                            />
                          </div>

                          {/* TOTAL BAR */}
                          <div
                            style={{
                              margin: "0 16px 14px",
                              backgroundColor: "#0D1B2A",
                              borderRadius: "8px",
                              padding: "10px 14px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "10px",
                                letterSpacing: "0.12em",
                                color: "#415A77",
                                fontWeight: "700",
                                textTransform: "uppercase",
                              }}
                            >
                              Total Earned
                            </span>
                            <span
                              style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "#E0E1DD",
                                fontFamily:
                                  "'DM Serif Display', Georgia, serif",
                              }}
                            >
                              ₱{d.earnings}
                            </span>
                          </div>

                          {/* EDIT / DELETE */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "8px",
                              padding: "0 16px 16px",
                            }}
                          >
                            <button
                              onClick={() => startEdit(i)}
                              style={{
                                padding: "11px",
                                backgroundColor: "#415A77",
                                color: "#E0E1DD",
                                border: "1px solid #778DA9",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: "700",
                                letterSpacing: "0.1em",
                                cursor: "pointer",
                                textTransform: "uppercase",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                              }}
                            >
                              ✏ Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(i)}
                              style={{
                                padding: "11px",
                                backgroundColor: "transparent",
                                color: "#778DA9",
                                border: "1px solid #415A77",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: "700",
                                letterSpacing: "0.1em",
                                cursor: "pointer",
                                textTransform: "uppercase",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                              }}
                            >
                              ✕ Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

function InfoCell({ label, value }) {
  return (
    <div>
      <p
        style={{
          margin: "0 0 3px",
          fontSize: "9px",
          letterSpacing: "0.1em",
          color: "#415A77",
          fontWeight: "700",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          color: "#E0E1DD",
          fontWeight: "500",
        }}
      >
        {value}
      </p>
    </div>
  );
}

export default App;
