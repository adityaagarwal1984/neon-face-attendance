import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Upload, Calendar as CalendarIcon, Camera, BarChart3, Users, Clock, TrendingUp } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateLectureOpen, setIsCreateLectureOpen] = useState(false);
  const [newLecture, setNewLecture] = useState({
    title: '',
    subjectId: '',
    classId: '',
    scheduledAt: '',
    durationMinutes: 60,
    classroom: ''
  });

  // Mock analytics data for demonstration
  const attendanceData = [
    { name: 'Mon', present: 25, absent: 5 },
    { name: 'Tue', present: 28, absent: 2 },
    { name: 'Wed', present: 23, absent: 7 },
    { name: 'Thu', present: 27, absent: 3 },
    { name: 'Fri', present: 24, absent: 6 },
  ];

  const subjectAttendance = [
    { name: 'Mathematics', value: 85, color: 'hsl(var(--neon-cyan))' },
    { name: 'Physics', value: 78, color: 'hsl(var(--neon-purple))' },
    { name: 'Chemistry', value: 92, color: 'hsl(var(--neon-green))' },
    { name: 'Biology', value: 88, color: 'hsl(var(--neon-pink))' },
  ];

  const engagementData = [
    { name: 'Week 1', engagement: 85 },
    { name: 'Week 2', engagement: 88 },
    { name: 'Week 3', engagement: 82 },
    { name: 'Week 4', engagement: 90 },
  ];

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  const fetchTeacherData = async () => {
    try {
      // Fetch classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user?.id);
      setClasses(classesData || []);

      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('teacher_id', user?.id);
      setSubjects(subjectsData || []);

      // Fetch lectures
      const { data: lecturesData } = await supabase
        .from('lectures')
        .select('*, subjects(name), classes(name)')
        .eq('teacher_id', user?.id)
        .order('scheduled_at', { ascending: false });
      setLectures(lecturesData || []);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  const handleCreateLecture = async () => {
    if (!newLecture.title || !newLecture.subjectId || !newLecture.classId || !newLecture.scheduledAt) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('lectures')
        .insert([{
          title: newLecture.title,
          subject_id: newLecture.subjectId,
          class_id: newLecture.classId,
          teacher_id: user?.id,
          scheduled_at: newLecture.scheduledAt,
          duration_minutes: newLecture.durationMinutes,
          classroom: newLecture.classroom
        }]);

      if (error) throw error;

      toast({
        title: "Lecture Created",
        description: "Your lecture has been scheduled successfully.",
      });

      setIsCreateLectureOpen(false);
      setNewLecture({
        title: '',
        subjectId: '',
        classId: '',
        scheduledAt: '',
        durationMinutes: 60,
        classroom: ''
      });
      fetchTeacherData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = async (lectureId: string, file: File) => {
    // This would integrate with face recognition API
    toast({
      title: "Photo Processing",
      description: "Face recognition is processing the attendance photo...",
    });
    
    // Mock attendance marking logic would go here
    setTimeout(() => {
      toast({
        title: "Attendance Marked",
        description: "Student attendance has been automatically recorded.",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage lectures and track attendance</p>
        </div>
        <Dialog open={isCreateLectureOpen} onOpenChange={setIsCreateLectureOpen}>
          <DialogTrigger asChild>
            <Button className="neon-glow">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Lecture
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card neon-border">
            <DialogHeader>
              <DialogTitle className="gradient-text">Create New Lecture</DialogTitle>
              <DialogDescription>Schedule a new lecture and set up attendance tracking</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lecture Title</Label>
                <Input
                  id="title"
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                  className="neon-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={newLecture.subjectId} onValueChange={(value) => setNewLecture({ ...newLecture, subjectId: value })}>
                    <SelectTrigger className="neon-border">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select value={newLecture.classId} onValueChange={(value) => setNewLecture({ ...newLecture, classId: value })}>
                    <SelectTrigger className="neon-border">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="datetime">Date & Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={newLecture.scheduledAt}
                    onChange={(e) => setNewLecture({ ...newLecture, scheduledAt: e.target.value })}
                    className="neon-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newLecture.durationMinutes}
                    onChange={(e) => setNewLecture({ ...newLecture, durationMinutes: parseInt(e.target.value) })}
                    className="neon-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classroom">Classroom</Label>
                <Input
                  id="classroom"
                  value={newLecture.classroom}
                  onChange={(e) => setNewLecture({ ...newLecture, classroom: e.target.value })}
                  className="neon-border"
                />
              </div>
              <Button onClick={handleCreateLecture} className="w-full neon-glow">
                Create Lecture
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-neon-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neon-text">156</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-neon-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neon-text">87.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Lectures</CardTitle>
            <Clock className="h-4 w-4 text-neon-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neon-text">4</div>
            <p className="text-xs text-muted-foreground">2 completed, 2 upcoming</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-neon-pink" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neon-text">92%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card neon-border">
          <CardHeader>
            <CardTitle className="gradient-text">Weekly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                present: { label: "Present", color: "hsl(var(--neon-cyan))" },
                absent: { label: "Absent", color: "hsl(var(--neon-purple))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="present" fill="hsl(var(--neon-cyan))" />
                  <Bar dataKey="absent" fill="hsl(var(--neon-purple))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader>
            <CardTitle className="gradient-text">Subject-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Attendance %", color: "hsl(var(--neon-green))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectAttendance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card neon-border">
          <CardHeader>
            <CardTitle className="gradient-text">Recent Lectures</CardTitle>
            <CardDescription>Upload photos to mark attendance automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lectures.slice(0, 5).map((lecture: any) => (
                <div key={lecture.id} className="flex items-center justify-between p-4 border rounded-lg neon-border">
                  <div>
                    <h4 className="font-semibold">{lecture.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {lecture.subjects?.name} • {lecture.classes?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(lecture.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="neon-border">
                      <Camera className="h-4 w-4 mr-1" />
                      Upload Photo
                    </Button>
                    <Button size="sm" className="neon-glow">
                      View Details
                    </Button>
                  </div>
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

      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="gradient-text">Student Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              engagement: { label: "Engagement %", color: "hsl(var(--neon-cyan))" },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="engagement" stroke="hsl(var(--neon-cyan))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;