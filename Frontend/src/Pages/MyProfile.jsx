import React, { useEffect, useMemo, useState } from "react";

import { getUser } from "../utils/auth";

const shimmer = "animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800";

const MyProfile = () => {
  const url = import.meta.env.VITE_API_URL;
  const me = getUser();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const isAdmin = me?.role === "admin";
  const isManager = me?.role === "manager";
  const [filter, setFilter] = useState("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editContext, setEditContext] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
        const mineRes = await fetch(`${url}/api/attendance/me`, { headers });
        const mine = await mineRes.json();
        setItems(Array.isArray(mine) ? mine : []);
        if (isAdmin) {
          const allRes = await fetch(`${url}/api/attendance/all`, { headers });
          const all = await allRes.json();
          setAllDocs(Array.isArray(all) ? all : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  const filteredAll = useMemo(() => {
    if (!isAdmin) return [];
    if (filter === "all") return allDocs;
    if (filter === "submitted") return allDocs.filter((d) => d.count > 0);
    if (filter === "empty") return allDocs.filter((d) => d.count === 0);
    return allDocs;
  }, [filter, allDocs, isAdmin]);

  const openEdit = async (row) => {
    try {
      const params = new URLSearchParams();
      params.set("date", row.date);
      params.set("session", row.session);
      const res = await fetch(`${url}/api/attendance/${row.categoryId}/events/${row.eventId}/attendance?${params.toString()}` + (row.subcategoryId ? `&subcategoryId=${row.subcategoryId}` : ""), {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const doc = await res.json();
      const entries = Array.isArray(doc?.entries) ? doc.entries : [];
      setEditContext({
        ...row,
        entries: entries.map((e) => ({ user: e.user?._id || e.user, fullName: e.user?.fullName, email: e.user?.email, status: e.status })),
      });
      setEditOpen(true);
    } catch (e) {
      console.error(e);
      alert("Failed to load attendance");
    }
  };

  const saveEdit = async () => {
    if (!editContext) return;
    try {
      setEditSaving(true);
      const payload = {
        date: editContext.date,
        session: editContext.session,
        entries: editContext.entries.map((e) => ({ user: e.user, status: e.status })),
      };
      const qs = editContext.subcategoryId ? `?subcategoryId=${editContext.subcategoryId}` : "";
      const res = await fetch(`${url}/api/attendance/${editContext.categoryId}/events/${editContext.eventId}/attendance${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      // refresh list
      const allRes = await fetch(`${url}/api/attendance/all`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      const all = await allRes.json();
      setAllDocs(Array.isArray(all) ? all : []);
      setEditOpen(false);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to save");
    } finally {
      setEditSaving(false);
    }
  };

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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold">My Profile</h2>
          <div className="text-sm text-gray-300">Role: {me?.role || "user"}</div>
        </div>

        {/* My Attendance */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">My Attendance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it, idx) => (
              <div
                key={`${it.eventId}|${it.date}|${it.session}|${idx}`}
                className={`rounded-xl border border-white/10 p-4 relative overflow-hidden ${it.status === "present" ? "bg-green-600/10" : "bg-red-600/10"}`}
              >
                <div className={`absolute inset-0 opacity-20 ${shimmer}`} style={{ animationDuration: "2s" }} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold">{it.eventTitle || "Event"}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${it.status === "present" ? "bg-green-600" : "bg-red-600"}`}>{it.status}</span>
                  </div>
                  <div className="mt-2 text-sm text-white/80">
                    <div>Date: {it.date}</div>
                    <div>Session: {it.session}</div>
                  </div>
                  <div className="mt-2 text-xs text-white/60">Marked at: {it.markedAt ? new Date(it.markedAt).toLocaleString() : "-"}</div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center text-white/60">No attendance records yet.</div>
            )}
          </div>
        </div>

        {/* Admin Overview */}
        {isAdmin && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Attendance Submissions</h3>
              <div className="flex gap-2">
                <select className="bg-gray-800 border border-white/10 rounded p-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="submitted">Submitted</option>
                  <option value="empty">Empty</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto border border-white/10 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-800 text-gray-300 text-sm">
                  <tr>
                    <th className="px-4 py-2">Event</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Session</th>
                    <th className="px-4 py-2">Present</th>
                    <th className="px-4 py-2">Absent</th>
                    <th className="px-4 py-2">Count</th>
                    <th className="px-4 py-2">Updated</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAll.map((d, i) => (
                    <tr key={`${d.eventId}|${d.date}|${d.session}|${i}`} className="border-t border-white/10">
                      <td className="px-4 py-2">{d.eventTitle || "Event"}</td>
                      <td className="px-4 py-2">{d.date}</td>
                      <td className="px-4 py-2">{d.session}</td>
                      <td className="px-4 py-2 text-green-400">{d.present}</td>
                      <td className="px-4 py-2 text-red-400">{d.absent}</td>
                      <td className="px-4 py-2">{d.count}</td>
                      <td className="px-4 py-2 text-white/70">{d.updatedAt ? new Date(d.updatedAt).toLocaleString() : "-"}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => openEdit(d)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs">👁 View/Edit</button>
                      </td>
                    </tr>
                  ))}
                  {filteredAll.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-white/60" colSpan={7}>No submissions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manager note */}
        {isManager && !isAdmin && (
          <div className="p-3 border border-white/10 rounded-lg text-sm text-white/70">
            You can view your own attendance above. Editing submissions is disabled for managers.
          </div>
        )}
      </div>
      {editOpen && editContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-black border border-white/10 p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">Edit Attendance - {editContext.eventTitle}</h4>
              <button onClick={() => setEditOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="overflow-x-auto border border-white/10 rounded-lg mb-4">
              <table className="w-full text-left">
                <thead className="bg-gray-800 text-gray-300 text-sm">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {editContext.entries.map((e, idx) => (
                    <tr key={`${e.user}|${idx}`} className="border-t border-white/10">
                      <td className="px-4 py-2">{e.fullName || e.user}</td>
                      <td className="px-4 py-2">{e.email || ""}</td>
                      <td className="px-4 py-2">
                        <select
                          className="bg-gray-900 border border-gray-700 rounded p-1"
                          value={e.status}
                          onChange={(ev) => setEditContext((ctx) => {
                            const copy = { ...ctx, entries: ctx.entries.slice() };
                            copy.entries[idx] = { ...copy.entries[idx], status: ev.target.value };
                            return copy;
                          })}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {editContext.entries.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-white/60" colSpan={3}>No entries.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button disabled={editSaving} onClick={saveEdit} className={`flex-1 rounded-lg ${editSaving ? "bg-gray-700" : "bg-purple-600 hover:bg-purple-500"} py-2 text-white`}>{editSaving ? "Saving..." : "Save Changes"}</button>
              <button onClick={() => setEditOpen(false)} className="flex-1 rounded-lg bg-white py-2 text-black hover:bg-white/80">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;


