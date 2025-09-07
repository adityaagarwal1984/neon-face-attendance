-- Create custom types
CREATE TYPE user_role AS ENUM ('teacher', 'student', 'admin');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student enrollments
CREATE TABLE public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- Create lectures table
CREATE TABLE public.lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  classroom TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance records
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID REFERENCES public.lectures(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'absent',
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confidence_score DECIMAL(3,2),
  UNIQUE(lecture_id, student_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for teachers
CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- RLS Policies for classes
CREATE POLICY "Teachers can manage their classes" ON public.classes
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their enrolled classes" ON public.classes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments 
      WHERE class_id = classes.id AND student_id = auth.uid()
    )
  );

-- RLS Policies for subjects
CREATE POLICY "Teachers can manage their subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view subjects of enrolled classes" ON public.subjects
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments 
      WHERE class_id = subjects.class_id AND student_id = auth.uid()
    )
  );

-- RLS Policies for enrollments
CREATE POLICY "Teachers can manage enrollments for their classes" ON public.student_enrollments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE id = student_enrollments.class_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own enrollments" ON public.student_enrollments
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- RLS Policies for lectures
CREATE POLICY "Teachers can manage their lectures" ON public.lectures
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view lectures of enrolled classes" ON public.lectures
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments 
      WHERE class_id = lectures.class_id AND student_id = auth.uid()
    )
  );

-- RLS Policies for attendance
CREATE POLICY "Teachers can manage attendance for their lectures" ON public.attendance_records
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lectures 
      WHERE id = attendance_records.lecture_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own attendance" ON public.attendance_records
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();