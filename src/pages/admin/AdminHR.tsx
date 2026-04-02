import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Users, Plus, Search, UserCheck, UserX, Clock, Calendar,
  MoreHorizontal, Trash2, Edit, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LearnMoreModal from '@/components/LearnMoreModal';
import { useLanguage } from '@/contexts/LanguageContext';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string;
  department: string | null;
  status: string;
  hire_date: string;
  notes: string | null;
  created_at: string;
}

interface Shift {
  id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  notes: string | null;
}

interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
}

const AdminHR = () => {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddShift, setShowAddShift] = useState(false);
  const [showAddAttendance, setShowAddAttendance] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    full_name: '', email: '', phone: '', position: '', department: '', status: 'active', hire_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [newShift, setNewShift] = useState({
    employee_id: '', shift_date: format(new Date(), 'yyyy-MM-dd'), start_time: '08:00', end_time: '16:00', shift_type: 'regular', notes: '',
  });
  const [newAttendance, setNewAttendance] = useState({
    employee_id: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'present', notes: '',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [empRes, shiftRes, attRes] = await Promise.all([
      supabase.from('employees').select('*').order('full_name'),
      supabase.from('shifts').select('*').order('shift_date', { ascending: false }).limit(100),
      supabase.from('attendance').select('*').order('date', { ascending: false }).limit(100),
    ]);
    setEmployees((empRes.data as any[]) || []);
    setShifts((shiftRes.data as any[]) || []);
    setAttendance((attRes.data as any[]) || []);
    setLoading(false);
  };

  const addEmployee = async () => {
    if (!newEmployee.full_name || !newEmployee.email) { toast.error(t('hr.name_email_required')); return; }
    const { error } = await supabase.from('employees').insert([newEmployee] as any);
    if (error) { toast.error(error.message); return; }
    toast.success(t('hr.employee_added'));
    setShowAddEmployee(false);
    setNewEmployee({ full_name: '', email: '', phone: '', position: '', department: '', status: 'active', hire_date: format(new Date(), 'yyyy-MM-dd') });
    fetchAll();
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(t('hr.employee_deleted'));
    fetchAll();
  };

  const addShift = async () => {
    if (!newShift.employee_id) { toast.error(t('hr.select_employee')); return; }
    const { error } = await supabase.from('shifts').insert([{ ...newShift, notes: newShift.notes || null }] as any);
    if (error) { toast.error(error.message); return; }
    toast.success(t('hr.shift_added'));
    setShowAddShift(false);
    fetchAll();
  };

  const addAttendance = async () => {
    if (!newAttendance.employee_id) { toast.error(t('hr.select_employee')); return; }
    const { error } = await supabase.from('attendance').insert([{
      ...newAttendance, notes: newAttendance.notes || null,
      check_in: newAttendance.status === 'present' ? new Date().toISOString() : null,
    }] as any);
    if (error) { toast.error(error.message); return; }
    toast.success(t('hr.attendance_recorded'));
    setShowAddAttendance(false);
    fetchAll();
  };

  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = employees.filter(e => e.status === 'active').length;
  const todayShifts = shifts.filter(s => s.shift_date === format(new Date(), 'yyyy-MM-dd')).length;
  const todayPresent = attendance.filter(a => a.date === format(new Date(), 'yyyy-MM-dd') && a.status === 'present').length;

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.full_name ?? '—';

  const statusLabel = (status: string) => {
    if (status === 'active') return t('hr.status.active');
    if (status === 'on_leave') return t('hr.status.on_leave');
    return t('hr.status.inactive');
  };

  const attendanceStatusLabel = (status: string) => {
    if (status === 'present') return t('hr.status.present');
    if (status === 'absent') return t('hr.status.absent');
    if (status === 'late') return t('hr.status.late');
    if (status === 'excused') return t('hr.status.excused');
    return status;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-display font-bold text-foreground">{t('hr.title')}</h1>
          <LearnMoreModal
            title="Human Resources (HR) Module"
            explanation="Centralizes staff management: employee profiles, shift scheduling, and attendance tracking in one place."
            benefits={['Simplifies HR tasks', 'Improves team coordination', 'Tracks attendance automatically']}
            triggerSize="md"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
          <div><p className="text-2xl font-bold">{activeCount}</p><p className="text-xs text-muted-foreground">{t('hr.active_employees')}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><Clock className="w-5 h-5 text-accent" /></div>
          <div><p className="text-2xl font-bold">{todayShifts}</p><p className="text-xs text-muted-foreground">{t('hr.shifts_today')}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><UserCheck className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-2xl font-bold">{todayPresent}</p><p className="text-xs text-muted-foreground">{t('hr.present_today')}</p></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">{t('hr.employees')}</TabsTrigger>
          <TabsTrigger value="shifts">{t('hr.shifts')}</TabsTrigger>
          <TabsTrigger value="attendance">{t('hr.attendance')}</TabsTrigger>
        </TabsList>

        {/* EMPLOYEES TAB */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('hr.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button onClick={() => setShowAddEmployee(true)} size="sm"><Plus className="w-4 h-4 mr-1" />{t('hr.add')}</Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('hr.position')}</TableHead>
                  <TableHead>{t('hr.department')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('hr.hired')}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('hr.loading')}</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('hr.no_employees')}</TableCell></TableRow>
                ) : filtered.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{emp.full_name}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{emp.position}</TableCell>
                    <TableCell>{emp.department || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={emp.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {statusLabel(emp.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(emp.hire_date), 'dd.MM.yyyy')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteEmployee(emp.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* SHIFTS TAB */}
        <TabsContent value="shifts" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddShift(true)} size="sm"><Plus className="w-4 h-4 mr-1" />{t('hr.create_shift')}</Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('hr.employee')}</TableHead>
                  <TableHead>{t('hr.date')}</TableHead>
                  <TableHead>{t('hr.from')}</TableHead>
                  <TableHead>{t('hr.to')}</TableHead>
                  <TableHead>{t('hr.type')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t('hr.no_shifts')}</TableCell></TableRow>
                ) : shifts.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{getEmployeeName(s.employee_id)}</TableCell>
                    <TableCell>{format(new Date(s.shift_date), 'dd.MM.yyyy')}</TableCell>
                    <TableCell>{s.start_time.slice(0, 5)}</TableCell>
                    <TableCell>{s.end_time.slice(0, 5)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{s.shift_type}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ATTENDANCE TAB */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddAttendance(true)} size="sm"><Plus className="w-4 h-4 mr-1" />{t('hr.record_attendance')}</Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('hr.employee')}</TableHead>
                  <TableHead>{t('hr.date')}</TableHead>
                  <TableHead>{t('hr.checkin')}</TableHead>
                  <TableHead>{t('hr.checkout')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t('hr.no_records')}</TableCell></TableRow>
                ) : attendance.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{getEmployeeName(a.employee_id)}</TableCell>
                    <TableCell>{format(new Date(a.date), 'dd.MM.yyyy')}</TableCell>
                    <TableCell>{a.check_in ? format(new Date(a.check_in), 'HH:mm') : '—'}</TableCell>
                    <TableCell>{a.check_out ? format(new Date(a.check_out), 'HH:mm') : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === 'present' ? 'default' : a.status === 'absent' ? 'destructive' : 'secondary'} className="text-xs capitalize">
                        {attendanceStatusLabel(a.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('hr.add_employee')}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>{t('common.name')} *</Label><Input value={newEmployee.full_name} onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })} /></div>
            <div><Label>{t('common.email')} *</Label><Input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} /></div>
            <div><Label>{t('common.phone')}</Label><Input value={newEmployee.phone} onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('hr.position')}</Label><Input value={newEmployee.position} onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })} /></div>
              <div><Label>{t('hr.department')}</Label><Input value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('hr.hire_date')}</Label><Input type="date" value={newEmployee.hire_date} onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })} /></div>
              <div>
                <Label>{t('common.status')}</Label>
                <Select value={newEmployee.status} onValueChange={(v) => setNewEmployee({ ...newEmployee, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('hr.status.active')}</SelectItem>
                    <SelectItem value="on_leave">{t('hr.status.on_leave')}</SelectItem>
                    <SelectItem value="inactive">{t('hr.status.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={addEmployee}>{t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Shift Dialog */}
      <Dialog open={showAddShift} onOpenChange={setShowAddShift}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('hr.create_shift')}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>{t('hr.employee')} *</Label>
              <Select value={newShift.employee_id} onValueChange={(v) => setNewShift({ ...newShift, employee_id: v })}>
                <SelectTrigger><SelectValue placeholder={t('hr.select')} /></SelectTrigger>
                <SelectContent>{employees.filter(e => e.status === 'active').map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                ))}</SelectContent>
              </Select>
            </div>
            <div><Label>{t('hr.date')}</Label><Input type="date" value={newShift.shift_date} onChange={(e) => setNewShift({ ...newShift, shift_date: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('hr.from')}</Label><Input type="time" value={newShift.start_time} onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })} /></div>
              <div><Label>{t('hr.to')}</Label><Input type="time" value={newShift.end_time} onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })} /></div>
            </div>
            <div>
              <Label>{t('hr.type')}</Label>
              <Select value={newShift.shift_type} onValueChange={(v) => setNewShift({ ...newShift, shift_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">{t('hr.shift_type.regular')}</SelectItem>
                  <SelectItem value="overtime">{t('hr.shift_type.overtime')}</SelectItem>
                  <SelectItem value="holiday">{t('hr.shift_type.holiday')}</SelectItem>
                  <SelectItem value="sick">{t('hr.shift_type.sick')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={addShift}>{t('common.create')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Attendance Dialog */}
      <Dialog open={showAddAttendance} onOpenChange={setShowAddAttendance}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('hr.record_attendance')}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>{t('hr.employee')} *</Label>
              <Select value={newAttendance.employee_id} onValueChange={(v) => setNewAttendance({ ...newAttendance, employee_id: v })}>
                <SelectTrigger><SelectValue placeholder={t('hr.select')} /></SelectTrigger>
                <SelectContent>{employees.filter(e => e.status === 'active').map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                ))}</SelectContent>
              </Select>
            </div>
            <div><Label>{t('hr.date')}</Label><Input type="date" value={newAttendance.date} onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })} /></div>
            <div>
              <Label>{t('common.status')}</Label>
              <Select value={newAttendance.status} onValueChange={(v) => setNewAttendance({ ...newAttendance, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">{t('hr.status.present')}</SelectItem>
                  <SelectItem value="absent">{t('hr.status.absent')}</SelectItem>
                  <SelectItem value="late">{t('hr.status.late')}</SelectItem>
                  <SelectItem value="excused">{t('hr.status.excused')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={addAttendance}>{t('hr.record')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminHR;
