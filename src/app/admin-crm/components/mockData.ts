export const mockEnquiries = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', service: 'Website Development', date: '2026-04-28', status: 'New', notes: 'Interested in full-stack web app.' },
  { id: '2', name: 'Sarah Lee', email: 'sarah@corp.com', phone: '+91 87654 32109', service: 'Mobile App', date: '2026-04-26', status: 'Followup', notes: 'Needs iOS and Android app.' },
  { id: '3', name: 'Raj Kumar', email: 'raj@startup.io', phone: '+91 76543 21098', service: 'SEO Package', date: '2026-04-25', status: 'Quotation Sent', notes: 'Looking to improve search ranking.' },
  { id: '4', name: 'Meena Patel', email: 'meena@biz.in', phone: '+91 65432 10987', service: 'ERP System', date: '2026-04-20', status: 'Converted', notes: 'Custom ERP for manufacturing.' },
  { id: '5', name: 'Tom Wilson', email: 'tom@agency.com', phone: '+91 54321 09876', service: 'UI/UX Design', date: '2026-04-18', status: 'Rejected', notes: 'Budget too low.' },
  { id: '6', name: 'Priya Sharma', email: 'priya@tech.com', phone: '+91 43210 98765', service: 'Cloud Migration', date: '2026-04-15', status: 'Revised Quotation', notes: 'AWS migration needed.' },
];

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'New': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    case 'Followup': return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
    case 'Quotation Sent': return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
    case 'Converted': return 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
    case 'Rejected': return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
    case 'Revised Quotation': return 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    default: return 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
  }
}

export const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}
