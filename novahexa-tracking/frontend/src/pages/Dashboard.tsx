import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Package,
  Truck,
  Plane,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Phone,
  MessageSquare,
  Route,
  DollarSign,
  Weight } from
'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { cn } from '../lib/utils';
// --- MOCK DATA ---
const chartData = [
{
  time: '4am',
  value1: 20,
  value2: 10
},
{
  time: '8am',
  value1: 60,
  value2: 30
},
{
  time: '12pm',
  value1: 40,
  value2: 50
},
{
  time: '4pm',
  value1: 80,
  value2: 40
},
{
  time: '8pm',
  value1: 30,
  value2: 20
},
{
  time: '12am',
  value1: 50,
  value2: 30
}];

const shipments = [
{
  id: 'NYP-234GA',
  type: 'plane',
  status: 'In transit',
  statusColor: 'text-blue-600 bg-blue-50',
  alert: '2 hours late to pickup',
  alertColor: 'text-red-600 bg-red-50',
  date: '03/26/2024 04:00 PM',
  origin: 'New York, NY',
  originDate: '03/12/2024 10:00 AM',
  destination: 'Atlanta, GA',
  destDate: '03/13/2024 02:00 PM',
  timeline: [
  {
    location: 'Port of NY and NJ',
    status1: 'Cargo ready - 03/18/2024 08:00 AM',
    status2: 'Departure - 03/18/2024 09:00 AM',
    state: 'completed'
  },
  {
    location: 'Port of Baltimore, MD',
    status1: 'Est. arrival - 03/20/2024 02:00 PM',
    status2: 'Est. pick-up - 03/20/2024 08:30 PM',
    state: 'completed'
  },
  {
    location: 'Port of Norfolk, VA',
    status1: 'Est. arrival - 03/23/2024 5:00 PM',
    status2: 'Est. pick-up - 03/23/2024 10:00 PM',
    state: 'warning',
    tooltip:
    "There may be a delay due to the unloading queue. It is recommended to register in the port's online queue"
  },
  {
    location: 'Port of Charleston, SC',
    status1: 'Est. delivery - 03/29/2024 04:00 PM',
    status2: '',
    state: 'pending'
  }]

},
{
  id: 'NDY-304CD',
  type: 'truck',
  status: 'In transit',
  statusColor: 'text-blue-600 bg-blue-50',
  alert: 'Weather delay',
  alertColor: 'text-red-600 bg-red-50',
  date: '03/20/2024 03:00 PM',
  origin: 'Albany, NY',
  originDate: '03/16/2024 05:00 AM',
  destination: 'Rochester, NY',
  destDate: '03/20/2024 03:00 PM',
  timeline: [
  {
    location: 'Albany, NY',
    status1: 'Cargo ready - 03/16/2024 05:00 AM',
    status2: 'Departure - 03/16/2024 08:00 AM',
    state: 'completed'
  },
  {
    location: 'Syracuse, NY',
    status1: 'Delivered - 03/17/2024 02:00 PM',
    status2: 'Departed - 03/18/2024 10:00 AM',
    state: 'completed'
  },
  {
    location: 'Rochester, NY',
    status1: 'Est. delivery - 03/20/2024 03:00 PM',
    status2: '',
    state: 'pending'
  }]

},
{
  id: 'NYI-708AG',
  type: 'plane',
  status: 'In transit',
  statusColor: 'text-blue-600 bg-blue-50',
  alert: 'On time to delivery',
  alertColor: 'text-green-600 bg-green-50',
  date: '03/17/2024 11:00 AM',
  origin: 'ALB, NY',
  originDate: '03/16/2024 11:00 AM',
  destination: 'ATL, GA',
  destDate: '03/17/2024 11:00 AM',
  timeline: [
  {
    location: 'ALB, NY',
    status1: 'Cargo ready - 03/16/2024 11:00 AM',
    status2: 'Departure - 03/16/2024 09:00 PM',
    state: 'completed'
  },
  {
    location: 'CLT, NC',
    status1: 'Est. arrival - 03/17/2024 01:00 AM',
    status2: 'Est. pick-up - 03/17/2024 07:00 AM',
    state: 'pending'
  },
  {
    location: 'ATL, GA',
    status1: 'Est. delivery - 03/17/2024 11:00 AM',
    status2: '',
    state: 'pending'
  }]

},
{
  id: 'XPA-456GD',
  type: 'truck',
  status: 'Stationary',
  statusColor: 'text-slate-600 bg-slate-100',
  alert: 'Preparing for departure',
  alertColor: 'text-blue-600 bg-blue-50',
  date: '03/17/2024 11:00 AM',
  origin: 'Lincoln, NE',
  originDate: '03/15/2024 08:00 AM',
  destination: 'Sioux Falls, SD',
  destDate: '03/16/2024 01:00 PM',
  timeline: [
  {
    location: 'Port of NY and NJ',
    status1: 'Cargo ready - 03/18/2024 08:00 AM',
    status2: 'Departure - 03/18/2024 09:00 AM',
    state: 'completed'
  },
  {
    location: 'Port of Baltimore, MD',
    status1: 'Est. arrival - 03/20/2024 02:00 PM',
    status2: 'Est. pick-up - 03/20/2024 08:30 PM',
    state: 'pending'
  },
  {
    location: 'Port of Norfolk, VA',
    status1: 'Est. arrival - 03/23/2024 5:00 PM',
    status2: 'Est. pick-up - 03/23/2024 10:00 PM',
    state: 'warning',
    tooltip: 'Delay expected'
  },
  {
    location: 'Port of Charleston, SC',
    status1: 'Est. delivery - 03/29/2024 04:00 PM',
    status2: '',
    state: 'pending'
  }]

}];

export function Dashboard() {
  const [activeView, setActiveView] = useState<'map' | 'list'>('map');
  const [selectedShipment, setSelectedShipment] = useState(shipments[0].id);
  const [activeTab, setActiveTab] = useState('General');
  return (
    <div className="min-h-screen bg-[#eef2f6] font-sans flex flex-col">
      {/* DARK HEADER BACKGROUND */}
      <div className="bg-[#060f24] text-white pb-32">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/5">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-[#060f24] font-bold text-xl leading-none -mt-1">
                  e
                </span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-300">
              <button className="px-4 py-2 rounded-lg hover:text-white transition-colors">
                Dashboard
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white">
                Shipments
              </button>
              <button className="px-4 py-2 rounded-lg hover:text-white transition-colors">
                Tracking
              </button>
              <button className="px-4 py-2 rounded-lg hover:text-white transition-colors">
                Invoices
              </button>
              <button className="px-4 py-2 rounded-lg hover:text-white transition-colors">
                Products
              </button>
              <button className="px-4 py-2 rounded-lg hover:text-white transition-colors">
                Notifications
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?img=47"
              alt="Donna Kendrik"
              className="w-9 h-9 rounded-full border-2 border-white/10" />
            
            <div className="hidden md:block text-sm">
              <div className="font-medium text-white">Donna Kendrik</div>
              <div className="text-slate-400 text-[11px]">
                Logistics manager
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between px-8 py-5">
          <div className="relative w-[340px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, status, departure, arrival..."
              className="w-full bg-[#0a1530] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
            
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0a1530] border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
              Status:{' '}
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                3
              </span>{' '}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0a1530] border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
              Vehicle:{' '}
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                2
              </span>{' '}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0a1530] border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
              Total value: &gt; $25k <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0a1530] border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
              Load:{' '}
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                5
              </span>{' '}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0a1530] border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
              Carrier{' '}
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                1
              </span>{' '}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between px-8 py-2">
          <h1 className="text-[28px] font-semibold tracking-tight">
            Shipment Tracking
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex bg-[#0a1530] rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setActiveView('map')}
                className={cn(
                  'px-5 py-1.5 rounded-md text-sm font-medium transition-colors',
                  activeView === 'map' ?
                  'bg-white/10 text-white' :
                  'text-slate-400 hover:text-white'
                )}>
                
                Map view
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={cn(
                  'px-5 py-1.5 rounded-md text-sm font-medium transition-colors',
                  activeView === 'list' ?
                  'bg-white/10 text-white' :
                  'text-slate-400 hover:text-white'
                )}>
                
                List view
              </button>
            </div>
            <button className="bg-yellow-400 text-[#060f24] px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-yellow-500 transition-colors shadow-sm">
              Add shipping
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA (Overlapping the dark header) */}
      <div className="flex-1 px-8 -mt-20 pb-8 w-full flex flex-col">
        {activeView === 'map' /* --- MAP VIEW --- */ ?
        <div className="flex gap-6 flex-1 min-h-0">
            {/* Left Column: Shipment List & Details */}
            <div className="w-[420px] flex flex-col gap-4 overflow-y-auto pb-4 hide-scrollbar">
              {shipments.map((shipment) => {
              const isSelected = selectedShipment === shipment.id;
              return (
                <div
                  key={shipment.id}
                  onClick={() => setSelectedShipment(shipment.id)}
                  className={cn(
                    'bg-white rounded-xl shadow-sm border transition-all cursor-pointer overflow-hidden',
                    isSelected ?
                    'border-transparent ring-2 ring-blue-500/20' :
                    'border-slate-200 hover:border-blue-300'
                  )}>
                  
                    {/* Card Header (Always visible) */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3">
                          <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            shipment.type === 'plane' ?
                            'bg-[#e0e7ff] text-[#4f46e5]' :
                            'bg-[#0f172a] text-white'
                          )}>
                          
                            {shipment.type === 'plane' ?
                          <Plane className="w-5 h-5" /> :

                          <Truck className="w-5 h-5" />
                          }
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">
                              Shipping ID
                            </div>
                            <div className="font-bold text-slate-900 text-[15px] leading-none">
                              {shipment.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                          className={cn(
                            'text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5',
                            shipment.statusColor
                          )}>
                          
                            {shipment.status === 'In transit' &&
                          <Plane className="w-3 h-3" />
                          }
                            {shipment.status === 'Stationary' &&
                          <Package className="w-3 h-3" />
                          }
                            {shipment.status}
                          </span>
                          <button className="text-slate-400 hover:text-slate-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="relative pl-2 ml-3 space-y-6 before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                        <div className="relative flex items-center justify-between">
                          <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-50"></div>
                          <span className="text-sm font-bold text-slate-900 ml-4">
                            {shipment.origin}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {shipment.originDate}
                          </span>
                        </div>
                        <div className="relative flex items-center justify-between">
                          <div className="absolute -left-[14px] top-1.5 w-2 h-2 bg-slate-800"></div>
                          <span className="text-sm font-bold text-slate-900 ml-4">
                            {shipment.destination}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {shipment.destDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details (Only visible if selected) */}
                    {isSelected &&
                  <div className="border-t border-slate-100">
                        {/* Tabs */}
                        <div className="flex px-4 pt-4 pb-2 gap-2">
                          {['General', 'Tracking', 'Chat', 'Documents'].map(
                        (tab) =>
                        <button
                          key={tab}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab(tab);
                          }}
                          className={cn(
                            'flex-1 py-1.5 text-xs font-bold rounded-md transition-colors',
                            activeTab === tab ?
                            'bg-blue-50 text-blue-600 border border-blue-100' :
                            'text-slate-500 hover:bg-slate-50 border border-transparent'
                          )}>
                          
                                {tab}
                              </button>

                      )}
                        </div>

                        {/* General Info Content */}
                        {activeTab === 'General' &&
                    <div className="p-5 pt-2">
                            <div className="flex justify-between items-center mb-6">
                              <div>
                                <h3 className="font-bold text-slate-900 text-[15px]">
                                  General Info
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium">
                                  Updated 40 mins ago
                                </p>
                              </div>
                              <button className="text-xs font-bold text-slate-600 border border-slate-200 rounded-md px-3 py-1.5 flex items-center gap-1.5 hover:bg-slate-50">
                                Today <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Line Chart */}
                            <div className="h-28 w-full mb-2 relative">
                              {/* Chart Tooltip */}
                              <div className="absolute top-4 left-[20%] bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                                Traffic congestion
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
                              </div>

                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                            data={chartData}
                            margin={{
                              top: 5,
                              right: 5,
                              left: -20,
                              bottom: 0
                            }}>
                            
                                  <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f1f5f9" />
                            
                                  <XAxis
                              dataKey="time"
                              axisLine={false}
                              tickLine={false}
                              tick={{
                                fontSize: 10,
                                fill: '#94a3b8',
                                fontWeight: 500
                              }} />
                            
                                  <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{
                                fontSize: 10,
                                fill: '#94a3b8',
                                fontWeight: 500
                              }} />
                            
                                  <Line
                              type="monotone"
                              dataKey="value1"
                              stroke="#0f172a"
                              strokeWidth={2}
                              dot={{
                                r: 3,
                                fill: '#0f172a',
                                strokeWidth: 2,
                                stroke: '#fff'
                              }} />
                            
                                  <Line
                              type="monotone"
                              dataKey="value2"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{
                                r: 3,
                                fill: '#3b82f6',
                                strokeWidth: 2,
                                stroke: '#fff'
                              }} />
                            
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Traffic Timeline Bar */}
                            <div className="relative mb-8 mt-4">
                              <div className="h-3 w-full flex rounded-sm overflow-hidden">
                                <div className="w-[15%] bg-blue-500"></div>
                                <div className="w-[10%] bg-blue-400"></div>
                                <div className="w-[5%] bg-green-500"></div>
                                <div className="w-[20%] bg-blue-100"></div>
                                <div className="w-[10%] bg-red-600"></div>
                                <div className="w-[30%] bg-blue-100"></div>
                                <div className="w-[5%] bg-red-600"></div>
                                <div className="w-[5%] bg-blue-200"></div>
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2 px-1">
                                <span>4am</span>
                                <span>8am</span>
                                <span>12pm</span>
                                <span>4pm</span>
                                <span>8pm</span>
                                <span>12pm</span>
                              </div>
                            </div>

                            {/* Driver Info */}
                            <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                              <div>
                                <div className="text-[13px] font-bold text-slate-900 mb-3">
                                  Stan Kolins
                                </div>
                                <div className="flex items-center gap-3">
                                  <img
                              src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=100&h=100&fit=crop"
                              alt="Truck"
                              className="w-9 h-9 rounded-md border border-slate-200 object-cover" />
                            
                                  <div>
                                    <div className="text-xs font-bold text-slate-900">
                                      6RGH 752
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">
                                      Volvo VNL 760 - White
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex flex-col justify-between h-full">
                                <div className="text-[13px] font-bold text-slate-900 mb-3">
                                  44 564 mi
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 border border-slate-100">
                                    <Phone className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 border border-slate-100">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                    }
                      </div>
                  }
                  </div>);

            })}
            </div>

            {/* Right Column: Stats & Map */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Route className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      Total distance
                    </span>
                  </div>
                  <div className="text-[32px] font-bold text-slate-900 mb-2 leading-none">
                    400{' '}
                    <span className="text-[15px] font-medium text-slate-500">
                      miles
                    </span>
                  </div>
                  <div className="text-[11px] text-red-500 font-bold">
                    ↓ +50 miles due to road repairs
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                      <Weight className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      Total weight
                    </span>
                  </div>
                  <div className="text-[32px] font-bold text-slate-900 mb-2 leading-none">
                    15,000{' '}
                    <span className="text-[15px] font-medium text-slate-500">
                      lbs
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-500 font-bold">
                    ↑ +500 lbs was added in Sioux City
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      Total value
                    </span>
                  </div>
                  <div className="text-[32px] font-bold text-slate-900 mb-2 leading-none">
                    $250k
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">
                    → No updates
                  </div>
                </div>
              </div>

              {/* Map Area */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 relative overflow-hidden">
                {/* Map Background Pattern */}
                <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80h-80z' fill='none' stroke='%23cbd5e1' stroke-width='1' stroke-dasharray='5,5'/%3E%3Cpath d='M0 50h100M50 0v100' stroke='%23cbd5e1' stroke-width='0.5'/%3E%3C/svg%3E")`,
                  backgroundSize: '100px 100px'
                }}>
              </div>

                {/* Map Details (Roads) */}
                <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                preserveAspectRatio="none">
                
                  <path
                  d="M 0,200 Q 300,250 800,200"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2" />
                
                  <path
                  d="M 200,0 Q 250,400 200,800"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2" />
                
                  <path
                  d="M 0,600 Q 400,550 800,600"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="4" />
                {' '}
                  {/* Highway 80 */}
                  <text
                  x="700"
                  y="590"
                  fill="#64748b"
                  fontSize="12"
                  fontWeight="bold">
                  
                    80
                  </text>
                  <text
                  x="350"
                  y="750"
                  fill="#64748b"
                  fontSize="12"
                  fontWeight="bold">
                  
                    80
                  </text>
                </svg>

                {/* Route Lines */}
                <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none">
                
                  {/* Gray dashed background route */}
                  <path
                  d="M 500,100 Q 550,200 600,300 T 500,600"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="4"
                  strokeDasharray="6,6" />
                

                  {/* Colored active route segments */}
                  <path
                  d="M 500,100 Q 520,140 530,160"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4" />
                
                  <path
                  d="M 530,160 Q 550,200 580,260"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4" />
                
                  <path
                  d="M 580,260 Q 600,300 580,350"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4" />
                
                  <path
                  d="M 580,350 Q 560,400 500,600"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4" />
                
                </svg>

                {/* Markers */}
                <div className="absolute left-[500px] top-[100px] -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-white border-4 border-slate-300 rounded-full shadow-sm"></div>
                </div>

                <div className="absolute left-[530px] top-[160px] -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 animate-pulse"></div>
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg relative z-10 border-[3px] border-white">
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="absolute left-[550px] top-[200px] -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-md whitespace-nowrap">
                    Traffic congestion
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
                  </div>
                  <div className="w-4 h-4 bg-white border-4 border-red-500 rounded-full shadow-sm"></div>
                </div>

                <div className="absolute left-[580px] top-[260px] -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-4 h-4 bg-white border-4 border-red-500 rounded-full shadow-sm"></div>
                </div>

                <div className="absolute left-[500px] top-[600px] -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-blue-700 font-bold text-sm">
                    Lincoln
                  </div>
                  <div className="w-4 h-4 bg-white border-4 border-blue-600 rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div> /* --- LIST VIEW --- */ :

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 p-2">
              {shipments.map((shipment, idx) =>
            <div
              key={shipment.id}
              className={cn(
                'flex items-center p-6',
                idx !== shipments.length - 1 && 'border-b border-slate-100'
              )}>
              
                  {/* Left: Shipment Info */}
                  <div className="w-64 shrink-0 pr-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      shipment.type === 'plane' ?
                      'bg-[#1e3a8a] text-white' :
                      'bg-[#0f172a] text-white'
                    )}>
                    
                        {shipment.type === 'plane' ?
                    <Plane className="w-5 h-5" /> :

                    <Truck className="w-5 h-5" />
                    }
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">
                          Shipping ID
                        </div>
                        <div className="font-bold text-slate-900 text-[15px] leading-none">
                          {shipment.id}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span
                    className={cn(
                      'text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5',
                      shipment.statusColor
                    )}>
                    
                        <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                        {shipment.status}
                      </span>
                      <span
                    className={cn(
                      'text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5',
                      shipment.alertColor
                    )}>
                    
                        <AlertCircle className="w-3.5 h-3.5" /> {shipment.alert}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 px-2.5 py-1.5 rounded-md inline-flex">
                      <Clock className="w-3.5 h-3.5" /> {shipment.date}
                    </div>
                  </div>

                  {/* Right: Horizontal Timeline */}
                  <div className="flex-1 overflow-x-auto">
                    <div className="min-w-[800px] flex items-center relative py-6">
                      {/* Background Line */}
                      <div className="absolute top-10 left-8 right-8 h-0.5 bg-slate-200 -z-10"></div>

                      {shipment.timeline.map((step, stepIdx) =>
                  <div
                    key={stepIdx}
                    className="flex-1 flex flex-col relative group">
                    
                          {/* Connecting Line (Active) */}
                          {stepIdx !== 0 && step.state === 'completed' &&
                    <div className="absolute top-10 -left-1/2 w-full h-0.5 bg-blue-600 -z-10"></div>
                    }

                          {/* Marker */}
                          <div className="mb-4 px-4">
                            <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center mx-auto relative',
                          step.state === 'completed' ?
                          'bg-blue-600 text-white' :
                          step.state === 'warning' ?
                          'bg-white' :
                          'bg-white'
                        )}>
                        
                              {step.state === 'completed' &&
                        <MapPin className="w-3.5 h-3.5" />
                        }
                              {step.state === 'warning' &&
                        <div className="w-3 h-3 bg-red-500 rotate-45 border border-white shadow-sm"></div>
                        }
                              {step.state === 'pending' &&
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                        }

                              {/* Tooltip */}
                              {step.tooltip &&
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-[#0b1121] text-white text-[11px] leading-relaxed p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                  {step.tooltip}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0b1121] rotate-45 -mt-1.5"></div>
                                </div>
                        }
                            </div>
                          </div>

                          {/* Text Info */}
                          <div className="text-center px-2">
                            <div className="font-bold text-slate-900 text-[13px] mb-2">
                              {step.location}
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-1 font-medium">
                              <div>{step.status1}</div>
                              {step.status2 && <div>{step.status2}</div>}
                            </div>
                          </div>
                        </div>
                  )}

                      {/* More Options */}
                      <div className="w-8 flex justify-end">
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            )}
            </div>
          </div>
        }
      </div>
    </div>);

}