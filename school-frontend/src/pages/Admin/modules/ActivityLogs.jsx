import React, { useState, useEffect } from "react";
import { ShieldAlert, RefreshCw, FileText, Calendar, User } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { activityLogService } from "../../../services/activityLogService";

export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await activityLogService.getActivityLogs();
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Error loading activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">System Audit Trail</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
            Auditing admissions, teacher changes, website edits, and fee operations
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchLogs} className="gap-1.5 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Reload logs
        </Button>
      </div>

      <Card className="p-6 border-slate-200/60 bg-white">
        {loading ? (
          <p className="text-center py-10 text-slate-400 text-xs animate-pulse">Syncing audit logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-center py-10 text-slate-400 text-xs">No audited actions registered.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="p-4 font-bold flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Operator</th>
                  <th className="p-4 font-bold"><FileText className="w-3.5 h-3.5 inline mr-1.5" /> Action / Log Description</th>
                  <th className="p-4 font-bold">Resource</th>
                  <th className="p-4 font-bold text-right flex-row-reverse flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/40">
                    <td className="p-4 font-bold text-slate-900">{log.user}</td>
                    <td className="p-4 font-semibold text-slate-800">{log.action}</td>
                    <td className="p-4">
                      <span className="text-[8px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold uppercase text-slate-600">
                        {log.affectedResource}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-400 font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
export default ActivityLogs;
