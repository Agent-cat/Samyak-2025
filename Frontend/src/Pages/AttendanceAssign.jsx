import React, { useEffect, useMemo, useState } from "react";

import { getUser } from "../utils/auth";

const AttendanceAssign = () => {
  const url = import.meta.env.VITE_API_URL;
  const me = getUser();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({ managerId: "", categoryId: "", subcategoryId: "", eventId: "" });
  const [assigning, setAssigning] = useState(false);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("assign");
  const [managerQuery, setManagerQuery] = useState("");
  const [eventQuery, setEventQuery] = useState("");
  const [managerQueryView, setManagerQueryView] = useState("");
  const [eventQueryView, setEventQueryView] = useState("");

  const managers = useMemo(() => users.filter((u) => u.role === "manager" || u.role === "hod"), [users]);

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, eRes, aRes] = await Promise.all([
          fetch(`${url}/api/users/all-users`),
          fetch(`${url}/api/events`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
          fetch(`${url}/api/attendance/assignments`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
        ]);
        const [uJson, eJson, aJson] = await Promise.all([uRes.json(), eRes.json(), aRes.json()]);
        setUsers(Array.isArray(uJson) ? uJson : []);
        setEvents(Array.isArray(eJson) ? eJson : []);
        setAssignments(Array.isArray(aJson) ? aJson : []);
      } catch (e) {
        console.error(e);
        setNotice("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categoriesFlat = useMemo(() => {
    const flat = [];
    for (const cat of events) {
      // direct events
      for (const ev of cat.Events || []) {
        flat.push({
          categoryId: cat._id,
          subcategoryId: null,
          eventId: ev._id,
          label: `${cat.categoryName} / ${ev.title}`,
        });
      }
      // subcategory events
      for (const sub of cat.subcategories || []) {
        for (const ev of sub.Events || []) {
          flat.push({
            categoryId: cat._id,
            subcategoryId: sub._id,
            eventId: ev._id,
            label: `${cat.categoryName} / ${sub.subcategoryName} / ${ev.title}`,
          });
        }
      }
    }
    return flat;
  }, [events]);

  const filteredManagers = useMemo(() => {
    const q = managerQuery.trim().toLowerCase();
    if (!q) return managers;
    return managers.filter((m) => [m.fullName, m.email, m.collegeId].some((t) => String(t || "").toLowerCase().includes(q)));
  }, [managers, managerQuery]);

  const filteredEvents = useMemo(() => {
    const q = eventQuery.trim().toLowerCase();
    if (!q) return categoriesFlat;
    return categoriesFlat.filter((c) => c.label.toLowerCase().includes(q));
  }, [categoriesFlat, eventQuery]);

  const usersById = useMemo(() => new Map(users.map((u) => [u._id, u])), [users]);
  const eventsLabelByKey = useMemo(() => {
    const m = new Map();
    for (const c of categoriesFlat) {
      const key = `${c.categoryId}|${c.subcategoryId || ""}|${c.eventId}`;
      m.set(key, c.label);
    }
    return m;
  }, [categoriesFlat]);

  const filteredAssignments = useMemo(() => {
    const mq = managerQueryView.trim().toLowerCase();
    const eq = eventQueryView.trim().toLowerCase();
    return assignments.filter((a) => {
      const mgr = usersById.get(a.manager);
      const mgrMatch = !mq || (mgr && ([mgr.fullName, mgr.email, mgr.collegeId].some((t) => String(t || "").toLowerCase().includes(mq))));
      const label = eventsLabelByKey.get(`${a.categoryId}|${a.subcategoryId || ""}|${a.eventId}`) || "";
      const evMatch = !eq || label.toLowerCase().includes(eq);
      return mgrMatch && evMatch;
    });
  }, [assignments, managerQueryView, eventQueryView, usersById, eventsLabelByKey]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selected.managerId || !selected.categoryId || !selected.eventId) return;
    try {
      setAssigning(true);
      setNotice("");
      const res = await fetch(`${url}/api/attendance/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          managerId: selected.managerId,
          categoryId: selected.categoryId,
          subcategoryId: selected.subcategoryId || null,
          eventId: selected.eventId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Assignment failed");
      setNotice("Assigned successfully");
      try {
        const aRes = await fetch(`${url}/api/attendance/assignments`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const aJson = await aRes.json();
        setAssignments(Array.isArray(aJson) ? aJson : []);
      } catch {}
    } catch (err) {
      console.error(err);
      setNotice(err.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  if (!me || (me.role !== "admin" && me.role !== "hod")) {
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
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-6">Attendance Assignments</h2>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setView("assign")} className={`px-4 py-2 rounded-lg ${view === "assign" ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}>Assign</button>
          <button onClick={() => setView("view")} className={`px-4 py-2 rounded-lg ${view === "view" ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}>View Assigned</button>
        </div>
        {view === "assign" && (
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Manager</label>
              <input
                list="managers-list"
                placeholder="Type to search, then pick"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                value={managerQuery}
                onChange={(e) => {
                  const v = e.target.value;
                  setManagerQuery(v);
                  const exact = managers.find((m) => `${m.fullName} (${m.email})` === v || m.email === v || m.collegeId === v);
                  setSelected((s) => ({ ...s, managerId: exact ? exact._id : "" }));
                }}
                required
              />
              <datalist id="managers-list">
                {managers.map((m) => (
                  <option key={m._id} value={`${m.fullName} (${m.email})`} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm mb-1">Event</label>
              <input
                list="events-list"
                placeholder="Type to search, then pick"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                value={eventQuery}
                onChange={(e) => {
                  const v = e.target.value;
                  setEventQuery(v);
                  const exact = categoriesFlat.find((c) => c.label === v);
                  if (exact) {
                    setSelected((s) => ({ ...s, categoryId: exact.categoryId, subcategoryId: exact.subcategoryId || "", eventId: exact.eventId }));
                  } else {
                    setSelected((s) => ({ ...s, categoryId: "", subcategoryId: "", eventId: "" }));
                  }
                }}
                required
              />
              <datalist id="events-list">
                {categoriesFlat.map((c) => (
                  <option key={`${c.categoryId}|${c.subcategoryId || ""}|${c.eventId}`} value={c.label} />
                ))}
              </datalist>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={assigning} className={`px-5 py-2 rounded-lg ${assigning ? "bg-gray-600" : "bg-purple-600 hover:bg-purple-500"}`}>
                {assigning ? "Assigning..." : "Assign"}
              </button>
              {notice && <span className="self-center text-sm text-gray-300">{notice}</span>}
            </div>
          </form>
        )}
        {view === "view" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                placeholder="Search manager"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                value={managerQueryView}
                onChange={(e) => setManagerQueryView(e.target.value)}
              />
              <input
                placeholder="Search event"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                value={eventQueryView}
                onChange={(e) => setEventQueryView(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto border border-gray-800 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-800 text-gray-300 text-sm">
                  <tr>
                    <th className="px-4 py-2">Manager</th>
                    <th className="px-4 py-2">Event</th>
                    <th className="px-4 py-2">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a, i) => {
                    const mgr = usersById.get(a.manager);
                    const label = eventsLabelByKey.get(`${a.categoryId}|${a.subcategoryId || ""}|${a.eventId}`) || "";
                    return (
                      <tr key={`${a.manager}|${a.eventId}|${i}`} className="border-t border-gray-800">
                        <td className="px-4 py-2">{mgr ? `${mgr.fullName} (${mgr.email})` : a.manager}</td>
                        <td className="px-4 py-2">{label}</td>
                        <td className="px-4 py-2 text-white/70">{new Date(a.createdAt || a.updatedAt || Date.now()).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {filteredAssignments.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-400" colSpan={3}>No assignments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAssign;


