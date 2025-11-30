import { PageLayout } from '../components/PageLayout';
import { StatCard } from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { Bus, Calendar, Ticket, DollarSign, AlertTriangle, Wrench } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { dashboardStats, buses, trips, incidents, loading } = useApp();

  if (loading) {
    return (
      <PageLayout title="Dashboard" description="Overview of your bus management system">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  const busStatusData = [
    { name: 'Available', value: (buses || []).filter((b) => (b.status || b.STATUS) === 'available').length, color: '#10b981' },
    { name: 'In Service', value: (buses || []).filter((b) => (b.status || b.STATUS) === 'in_service').length, color: '#3b82f6' },
    { name: 'Maintenance', value: (buses || []).filter((b) => (b.status || b.STATUS) === 'maintenance').length, color: '#f59e0b' },
    { name: 'Retired', value: (buses || []).filter((b) => (b.status || b.STATUS) === 'retired').length, color: '#6b7280' },
  ];

  const tripStatusData = [
    { name: 'Scheduled', value: (trips || []).filter((t) => (t.status || t.STATUS) === 'scheduled').length },
    { name: 'In Progress', value: (trips || []).filter((t) => (t.status || t.STATUS) === 'in_progress').length },
    { name: 'Completed', value: (trips || []).filter((t) => (t.status || t.STATUS) === 'completed').length },
    { name: 'Cancelled', value: (trips || []).filter((t) => (t.status || t.STATUS) === 'cancelled').length },
  ];

  const incidentSeverityData = [
    { name: 'Low', value: (incidents || []).filter((i) => (i.severity || i.SEVERITY) === 'low').length, color: '#3b82f6' },
    { name: 'Medium', value: (incidents || []).filter((i) => (i.severity || i.SEVERITY) === 'medium').length, color: '#f59e0b' },
    { name: 'High', value: (incidents || []).filter((i) => (i.severity || i.SEVERITY) === 'high').length, color: '#ef4444' },
    { name: 'Critical', value: (incidents || []).filter((i) => (i.severity || i.SEVERITY) === 'critical').length, color: '#991b1b' },
  ];

  const recentIncidents = (incidents || []).slice(0, 5);

  return (
    <PageLayout title="Dashboard" description="Overview of your bus management system">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Buses"
            value={dashboardStats?.totalBuses || 0}
            icon={Bus}
            color="blue"
          />
          <StatCard
            title="Active Buses"
            value={dashboardStats?.activeBuses || 0}
            icon={Bus}
            color="green"
          />
          <StatCard
            title="Today's Trips"
            value={dashboardStats?.todayTrips || 0}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Total Tickets"
            value={dashboardStats?.totalTickets || 0}
            icon={Ticket}
            color="purple"
          />
          <StatCard
            title="Today's Revenue"
            value={`$${(dashboardStats?.todayRevenue || 0).toFixed(2)}`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Open Incidents"
            value={dashboardStats?.openIncidents || 0}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bus Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={busStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {busStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Status Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tripStatusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Incident Severity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incidentSeverityData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incidentSeverityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Incidents</h3>
            <div className="space-y-3">
              {recentIncidents.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent incidents</p>
              ) : (
                recentIncidents.map((incident) => {
                  try {
                    const incidentId = incident.id || incident.id_incident || incident.ID_INCIDENT || Math.random();
                    const incidentType = incident.type || incident.TYPE || 'Unknown';
                    const incidentDescription = incident.description || incident.DESCRIPTION || 'No description';
                    const incidentSeverity = incident.severity || incident.SEVERITY || 'low';
                    
                    return (
                      <div
                        key={incidentId}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                          incidentSeverity === 'critical' ? 'text-red-600 dark:text-red-400' :
                          incidentSeverity === 'high' ? 'text-orange-600 dark:text-orange-400' :
                          incidentSeverity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{String(incidentType)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{String(incidentDescription)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          incidentSeverity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                          incidentSeverity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                          incidentSeverity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        }`}>
                          {String(incidentSeverity)}
                        </span>
                      </div>
                    );
                  } catch (error) {
                    console.error('Error rendering incident:', error, incident);
                    return (
                      <div key={Math.random()} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Error loading incident</p>
                      </div>
                    );
                  }
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
