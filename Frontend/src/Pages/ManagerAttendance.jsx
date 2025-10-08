import React, { useEffect, useMemo, useState } from "react";

import { getUser } from "../utils/auth";

const ManagerAttendance = () => {
  const url = import.meta.env.VITE_API_URL;
  const me = getUser();
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState({ key: "", date: "", session: "full" });
  const [registered, setRegistered] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, eRes] = await Promise.all([
          fetch(`${url}/api/attendance/assignments?managerId=me`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
          fetch(`${url}/api/events`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        ]);
        const [aJson, eJson] = await Promise.all([aRes.json(), eRes.json()]);
        setAssignments(Array.isArray(aJson) ? aJson : []);
        setEvents(Array.isArray(eJson) ? eJson : []);
      } catch (e) {
        console.error(e);
        setNotice("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const options = useMemo(() => {
    const byId = new Map(events.map((c) => [c._id, c]));
    return assignments.map((a) => {
      const cat = byId.get(a.categoryId) || {};
      let label = "";
      let reg = [];
      if (a.subcategoryId) {
        const sub = (cat.subcategories || []).find((s) => s._id === a.subcategoryId || String(s._id) === String(a.subcategoryId));
        const ev = sub ? (sub.Events || []).find((e) => e._id === a.eventId || String(e._id) === String(a.eventId)) : null;
        label = `${cat.categoryName || ""} / ${sub?.subcategoryName || ""} / ${ev?.title || ""}`;
        reg = ev?.registeredStudents || [];
      } else {
        const ev = (cat.Events || []).find((e) => e._id === a.eventId || String(e._id) === String(a.eventId));
        label = `${cat.categoryName || ""} / ${ev?.title || ""}`;
        reg = ev?.registeredStudents || [];
      }
      return { key: `${a.categoryId}|${a.subcategoryId || ""}|${a.eventId}`, label, registered: reg };
    });
  }, [assignments, events]);

  const onSelectEvent = (v) => {
    setSelected((s) => ({ ...s, key: v }));
    const opt = options.find((o) => o.key === v);
    const regs = (opt?.registered || []).map((id) => ({ _id: id._id || id, fullName: id.fullName, email: id.email, college: id.college, collegeId: id.collegeId }));
    setRegistered(regs);
    const initial = {};
    for (const r of regs) initial[r._id] = "present";
    setMarks(initial);
    setNotice("");
    setLocked(false);
  };

  const checkExisting = async () => {
    if (!selected.key || !selected.date) return false;
    const [categoryId, subcategoryId, eventId] = selected.key.split("|");
    const params = new URLSearchParams();
    params.set("date", selected.date);
    params.set("session", selected.session);
    if (subcategoryId) params.set("subcategoryId", subcategoryId);
    const res = await fetch(`${url}/api/attendance/${categoryId}/events/${eventId}/attendance?${params.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    // If entries exist, consider it locked
    const already = Array.isArray(data?.entries) && data.entries.length > 0;
    setLocked(already);
    return already;
  };

  const submit = async () => {
    if (!selected.key || !selected.date) return;
    const already = await checkExisting();
    if (already) {
      setNotice("Attendance already submitted for this date/session");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    setConfirmOpen(false);
    try {
      const [categoryId, subcategoryId, eventId] = selected.key.split("|");
      const payload = {
        date: selected.date,
        session: selected.session,
        entries: Object.entries(marks).map(([user, status]) => ({ user, status })),
      };
      const res = await fetch(`${url}/api/attendance/${categoryId}/events/${eventId}/attendance${subcategoryId ? `?subcategoryId=${subcategoryId}` : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit attendance");
      setNotice("Attendance submitted and locked");
      setLocked(true);
    } catch (e) {
      console.error(e);
      setNotice(e.message || "Failed to submit attendance");
    }
  };

  if (!me || (me.role !== "manager" && me.role !== "admin")) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Access denied</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="pt-16 sm:pt-20"></div>
      <div className="max-w-5xl mx-auto space-y-4">
        <h2 className="text-3xl font-extrabold">Take Attendance</h2>
        {options.length === 0 && (
          <div className="p-4 border border-yellow-600/40 rounded-lg bg-yellow-600/10 text-yellow-200 text-sm">
            No events have been assigned to you yet. Please ask an admin to assign events
            {me?.role === "admin" && (
              <>
                . Go to <a href="/attendance-assign" className="underline">Assignments</a> to assign a manager.
              </>
            )}
          </div>
        )}
        <div className="grid md:grid-cols-4 gap-3">
          <select className="bg-gray-800 border border-gray-700 rounded-lg p-2" value={selected.key} onChange={(e) => onSelectEvent(e.target.value)}>
            <option value="" disabled>Select assigned event</option>
            {options.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
          <input className="bg-gray-800 border border-gray-700 rounded-lg p-2" type="date" value={selected.date} onChange={(e) => setSelected({ ...selected, date: e.target.value })} />
          <select className="bg-gray-800 border border-gray-700 rounded-lg p-2" value={selected.session} onChange={(e) => setSelected({ ...selected, session: e.target.value })}>
            <option value="full">Full</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
          <button onClick={submit} disabled={!selected.key || !selected.date || locked} className={`rounded-lg p-2 ${locked ? "bg-gray-700" : "bg-purple-600 hover:bg-purple-500"}`}>{locked ? "Completed" : "Submit"}</button>
        </div>
        {notice && <div className="text-sm text-gray-300">{notice}</div>}
        {selected.key && (
        <div className="overflow-x-auto border border-gray-800 rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-gray-300 text-sm">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">College ID</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {registered.map((r) => (
                <tr key={r._id} className="border-t border-gray-800">
                  <td className="px-4 py-2">{r.fullName}</td>
                  <td className="px-4 py-2">{r.email}</td>
                  <td className="px-4 py-2">{r.collegeId}</td>
                  <td className="px-4 py-2">
                    <select className="bg-gray-900 border border-gray-700 rounded p-1" disabled={locked} value={marks[r._id] || "present"} onChange={(e) => setMarks((m) => ({ ...m, [r._id]: e.target.value }))}>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </td>
                </tr>
              ))}
              {registered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-400" colSpan={4}>No registered students for this event</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-xl bg-black border border-white/10 p-6">
              <h4 className="text-lg font-semibold text-white mb-2">Confirm Submission</h4>
              <p className="text-white/80 text-sm mb-4">Are you sure you want to submit attendance? You cannot edit after submitting.</p>
              <div className="flex gap-3">
                <button onClick={confirmSubmit} className="flex-1 rounded-lg bg-purple-600 py-2 text-white hover:bg-purple-500">Yes, Submit</button>
                <button onClick={() => setConfirmOpen(false)} className="flex-1 rounded-lg bg-white py-2 text-black hover:bg-white/80">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerAttendance;


