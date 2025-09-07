import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Users, Camera, BarChart3, Clock, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to their dashboard based on role
      const checkProfileAndRedirect = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile?.role === 'teacher') {
            navigate('/teacher');
          } else {
            navigate('/student');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      
      checkProfileAndRedirect();
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Camera,
      title: "Face Recognition",
      description: "Automatic attendance marking using AI-powered face recognition technology"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics with charts and graphs for attendance tracking"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Live attendance updates and scheduling for teachers and students"
    },
    {
      icon: TrendingUp,
      title: "Engagement Insights",
      description: "Track student engagement and identify patterns in attendance"
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse-glow">
          <GraduationCap className="h-16 w-16 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <GraduationCap className="h-20 w-20 neon-glow text-primary animate-pulse-glow" />
          </div>
          <h1 className="text-6xl font-bold mb-6 gradient-text">
            Smart Attendance System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Revolutionary face recognition technology for automated attendance tracking. 
            Streamline your classroom management with AI-powered precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="neon-glow text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              <Users className="h-5 w-5 mr-2" />
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="neon-border text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for modern attendance management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card neon-border hover:shadow-neon-cyan transition-all duration-300">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary neon-glow" />
                  <CardTitle className="neon-text">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass-card neon-border p-8">
            <CardHeader>
              <CardTitle className="text-3xl gradient-text mb-4">
                Ready to Transform Your Classroom?
              </CardTitle>
              <CardDescription className="text-lg mb-8">
                Join thousands of educators already using our smart attendance system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="neon-glow text-lg px-12 py-6"
                onClick={() => navigate('/auth')}
              >
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
