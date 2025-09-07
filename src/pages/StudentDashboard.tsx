import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardHeader from '@/components/DashboardHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Calendar as CalendarIcon, TrendingUp, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Mock data for demonstration
  const weeklyAttendance = [
    { day: 'Mon', present: 1, total: 1 },
    { day: 'Tue', present: 2, total: 2 },
    { day: 'Wed', present: 1, total: 2 },
    { day: 'Thu', present: 2, total: 2 },
    { day: 'Fri', present: 1, total: 1 },
  ];

  const subjectAttendance = [
    { name: 'Mathematics', percentage: 95, color: 'hsl(var(--neon-cyan))' },
    { name: 'Physics', percentage: 87, color: 'hsl(var(--neon-purple))' },
    { name: 'Chemistry', percentage: 92, color: 'hsl(var(--neon-green))' },
    { name: 'Biology', percentage: 89, color: 'hsl(var(--neon-pink))' },
  ];

  const monthlyTrend = [
    { month: 'Jan', attendance: 88 },
    { month: 'Feb', attendance: 92 },
    { month: 'Mar', attendance: 85 },
    { month: 'Apr', attendance: 95 },
  ];

  const todaySchedule = [
    { time: '09:00', subject: 'Mathematics', room: 'Room 101', status: 'present' },
    { time: '10:30', subject: 'Physics', room: 'Lab 201', status: 'present' },
    { time: '14:00', subject: 'Chemistry', room: 'Lab 301', status: 'upcoming' },
    { time: '15:30', subject: 'Biology', room: 'Room 205', status: 'upcoming' },
  ];

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      setProfile(profileData);

      // Fetch enrolled classes
      const { data: enrollmentsData } = await supabase
        .from('student_enrollments')
        .select('*, classes(*)')
        .eq('student_id', user?.id);
      setEnrolledClasses(enrollmentsData || []);

      // Fetch attendance records
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('*, lectures(title, scheduled_at, subjects(name))')
        .eq('student_id', user?.id)
        .order('marked_at', { ascending: false });
      setAttendanceRecords(attendanceData || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const overallAttendance = 91; // Calculate from actual data

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 neon-glow">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.full_name?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              Welcome, {profile?.full_name || 'Student'}
            </h1>
            <p className="text-muted-foreground">Track your attendance and academic progress</p>
          </div>
        </div>
        <Card className="glass-card neon-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold neon-text">{overallAttendance}%</div>
              <div className="text-sm text-muted-foreground">Overall Attendance</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Attended</CardTitle>
            <CheckCircle className="h-4 w-4 text-neon-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neon-text">128</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Missed</CardTitle>
            <XCircle className="h-4 w-4 text-neon-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neon-text">12</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-neon-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neon-text">6</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarIcon className="h-4 w-4 text-neon-pink" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neon-text">95%</div>
            <p className="text-xs text-muted-foreground">Attendance rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card neon-border">
          <CardHeader>
            <CardTitle className="gradient-text">Today's Schedule</CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg neon-border">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{item.time}</div>
                      <Clock className="h-4 w-4 mx-auto text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.subject}</h4>
                      <p className="text-sm text-muted-foreground">{item.room}</p>
                    </div>
                  </div>
                  <Badge
                    variant={item.status === 'present' ? 'default' : 'secondary'}
                    className={item.status === 'present' ? 'neon-glow' : ''}
                  >
                    {item.status === 'present' ? 'Present' : 'Upcoming'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader>
            <CardTitle className="gradient-text">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border neon-border"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">By Subject</TabsTrigger>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card neon-border">
              <CardHeader>
                <CardTitle className="gradient-text">Weekly Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    attendance: { label: "Attendance", color: "hsl(var(--neon-cyan))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyAttendance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="present" fill="hsl(var(--neon-cyan))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="glass-card neon-border">
              <CardHeader>
                <CardTitle className="gradient-text">Subject Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjectAttendance.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{subject.name}</span>
                      <span className="text-sm neon-text">{subject.percentage}%</span>
                    </div>
                    <Progress value={subject.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card className="glass-card neon-border">
            <CardHeader>
              <CardTitle className="gradient-text">Subject-wise Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  percentage: { label: "Attendance %", color: "hsl(var(--neon-green))" },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectAttendance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {subjectAttendance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card className="glass-card neon-border">
            <CardHeader>
              <CardTitle className="gradient-text">Recent Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceRecords.slice(0, 10).map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg neon-border">
                    <div>
                      <h4 className="font-semibold">{record.lectures?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {record.lectures?.subjects?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.lectures?.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={record.status === 'present' ? 'default' : 'destructive'}
                      className={record.status === 'present' ? 'neon-glow' : ''}
                    >
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="glass-card neon-border">
            <CardHeader>
              <CardTitle className="gradient-text">Monthly Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  attendance: { label: "Attendance %", color: "hsl(var(--neon-cyan))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="attendance" stroke="hsl(var(--neon-cyan))" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;