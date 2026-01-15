export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: 'new' | 'contacted' | 'following_up' | 'booked' | 'closed' | 'lost';
  value: number;
  createdAt: string;
  lastContact: string;
}

export interface AutomationFlow {
  id: string;
  name: string;
  trigger: string;
  steps: AutomationStep[];
  isActive: boolean;
  leadsProcessed: number;
  conversionRate: number;
}

export interface AutomationStep {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'wait' | 'booking';
  delay?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
  template?: string;
  channel?: string;
}

export interface Meeting {
  id: string;
  leadName: string;
  date: string;
  time: string;
  type: 'call' | 'video' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface DashboardStats {
  totalLeads: number;
  activeFollowUps: number;
  bookedMeetings: number;
  conversionRate: number;
  leadsThisWeek: number;
  meetingsThisWeek: number;
  responseRate: number;
  avgResponseTime: string;
}

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Anderson',
    email: 'john@construction.com',
    phone: '+1 555 123 4567',
    company: 'Anderson Construction',
    source: 'Web Form',
    status: 'new',
    value: 125000,
    createdAt: '2024-01-15T10:30:00',
    lastContact: '2024-01-15T10:30:00',
  },
  {
    id: '2',
    name: 'Sarah Miller',
    email: 'sarah@solarpro.com',
    phone: '+1 555 234 5678',
    company: 'SolarPro Energy',
    source: 'Google Ads',
    status: 'contacted',
    value: 89000,
    createdAt: '2024-01-14T14:20:00',
    lastContact: '2024-01-15T09:00:00',
  },
  {
    id: '3',
    name: 'Michael Thompson',
    email: 'michael@realtymax.com',
    phone: '+1 555 345 6789',
    company: 'RealtyMax Properties',
    source: 'Referral',
    status: 'following_up',
    value: 250000,
    createdAt: '2024-01-12T11:45:00',
    lastContact: '2024-01-14T16:30:00',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@autoelite.com',
    phone: '+1 555 456 7890',
    company: 'AutoElite Motors',
    source: 'LinkedIn',
    status: 'booked',
    value: 175000,
    createdAt: '2024-01-10T09:15:00',
    lastContact: '2024-01-15T11:00:00',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david@techstart.com',
    phone: '+1 555 567 8901',
    company: 'TechStart Inc',
    source: 'Web Form',
    status: 'closed',
    value: 320000,
    createdAt: '2024-01-05T13:30:00',
    lastContact: '2024-01-13T15:45:00',
  },
  {
    id: '6',
    name: 'Lisa Johnson',
    email: 'lisa@consulting.com',
    phone: '+1 555 678 9012',
    company: 'Johnson Consulting',
    source: 'Google Ads',
    status: 'lost',
    value: 95000,
    createdAt: '2024-01-08T10:00:00',
    lastContact: '2024-01-12T14:00:00',
  },
  {
    id: '7',
    name: 'Robert Brown',
    email: 'robert@propertydev.com',
    phone: '+1 555 789 0123',
    company: 'Property Dev Group',
    source: 'Referral',
    status: 'new',
    value: 450000,
    createdAt: '2024-01-15T08:00:00',
    lastContact: '2024-01-15T08:00:00',
  },
  {
    id: '8',
    name: 'Jennifer White',
    email: 'jennifer@ecommerce.com',
    phone: '+1 555 890 1234',
    company: 'E-Commerce Solutions',
    source: 'LinkedIn',
    status: 'following_up',
    value: 78000,
    createdAt: '2024-01-11T16:20:00',
    lastContact: '2024-01-14T10:30:00',
  },
];

export const mockAutomationFlows: AutomationFlow[] = [
  {
    id: '1',
    name: 'New Lead - Quick Follow-up',
    trigger: 'When a new lead comes in',
    steps: [
      { id: '1', type: 'email', template: 'Welcome Email' },
      { id: '2', type: 'wait', delay: 2, delayUnit: 'days' },
      { id: '3', type: 'email', template: 'First Follow-up' },
      { id: '4', type: 'wait', delay: 3, delayUnit: 'days' },
      { id: '5', type: 'sms', template: 'SMS Reminder' },
    ],
    isActive: true,
    leadsProcessed: 234,
    conversionRate: 28.5,
  },
  {
    id: '2',
    name: 'Quote Follow-up',
    trigger: 'When a quote is sent',
    steps: [
      { id: '1', type: 'wait', delay: 1, delayUnit: 'days' },
      { id: '2', type: 'email', template: 'Quote Follow-up' },
      { id: '3', type: 'wait', delay: 4, delayUnit: 'days' },
      { id: '4', type: 'whatsapp', template: 'WhatsApp Check-in' },
      { id: '5', type: 'booking', template: 'Meeting Booking' },
    ],
    isActive: true,
    leadsProcessed: 156,
    conversionRate: 34.2,
  },
  {
    id: '3',
    name: 'Re-engagement Campaign',
    trigger: 'Leads inactive for 30 days',
    steps: [
      { id: '1', type: 'email', template: 'We Miss You' },
      { id: '2', type: 'wait', delay: 7, delayUnit: 'days' },
      { id: '3', type: 'email', template: 'Special Offer' },
    ],
    isActive: false,
    leadsProcessed: 89,
    conversionRate: 12.4,
  },
];

export const mockMeetings: Meeting[] = [
  {
    id: '1',
    leadName: 'Emily Davis',
    date: '2024-01-16',
    time: '10:00',
    type: 'video',
    status: 'scheduled',
  },
  {
    id: '2',
    leadName: 'Michael Thompson',
    date: '2024-01-16',
    time: '14:30',
    type: 'call',
    status: 'scheduled',
  },
  {
    id: '3',
    leadName: 'John Anderson',
    date: '2024-01-17',
    time: '11:00',
    type: 'in-person',
    status: 'scheduled',
  },
  {
    id: '4',
    leadName: 'David Wilson',
    date: '2024-01-15',
    time: '09:00',
    type: 'video',
    status: 'completed',
  },
  {
    id: '5',
    leadName: 'Lisa Johnson',
    date: '2024-01-14',
    time: '15:00',
    type: 'call',
    status: 'cancelled',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalLeads: 248,
  activeFollowUps: 67,
  bookedMeetings: 23,
  conversionRate: 32.4,
  leadsThisWeek: 34,
  meetingsThisWeek: 8,
  responseRate: 94.2,
  avgResponseTime: '< 2 min',
};

export const leadStatusConfig = {
  new: { label: 'New Lead', color: 'bg-blue-500', textColor: 'text-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  following_up: { label: 'Following Up', color: 'bg-purple-500', textColor: 'text-purple-500' },
  booked: { label: 'Booked', color: 'bg-green-500', textColor: 'text-green-500' },
  closed: { label: 'Closed', color: 'bg-emerald-600', textColor: 'text-emerald-600' },
  lost: { label: 'Lost', color: 'bg-gray-500', textColor: 'text-gray-500' },
};
