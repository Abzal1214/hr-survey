import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  surname: String,
  username: { type: String, sparse: true },
  phone: { type: String, unique: true },
  password: String,
  department: String,
  workplaceType: String,
  position: String,
  points: { type: Number, default: 0 },
  role: { type: String, default: 'employee' },
  registeredAt: { type: Date, default: Date.now },
});

const RewardSchema = new mongoose.Schema({
  name: String,
  description: String,
  cost: Number,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const NewsSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const TrainingSchema = new mongoose.Schema({
  title: String,
  description: String,
  fileUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const TestResultSchema = new mongoose.Schema({
  phone: String,
  quizId: String,
  score: Number,
  answers: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

const QuizSchema = new mongoose.Schema({
  title: String,
  description: String,
  coins: { type: Number, default: 3 },
  questions: [{
    text: String,
    options: [String],
    correct: String,
  }],
  createdAt: { type: Date, default: Date.now },
});

const SurveySchema = new mongoose.Schema({
  name: String,
  phone: String,
  position: String,
  department: String,
  surveyType: String,
  templateId: String,
  templateTitle: String,
  answers: mongoose.Schema.Types.Mixed,
  overall: String,
  duties_clear: String,
  support_received: String,
  team_comfortable: String,
  training_helpful: String,
  continue: String,
  difficulties: String,
  suggestions: String,
  rating: String,
  feedback: String,
  timestamp: { type: Date, default: Date.now },
});

const SurveyTemplateSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [{
    text: String,
    type: { type: String, enum: ['text', 'rating', 'yesno'], default: 'text' },
  }],
  createdAt: { type: Date, default: Date.now },
});

const OfflineTrainingSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  time: String,
  location: String,
  maxParticipants: { type: Number, default: 20 },
  department: String,
  signups: [{
    phone: String,
    name: String,
    department: String,
    signedAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  steps: [{
    type: { type: String, enum: ['material', 'quiz'] },
    refId: String,
    title: String,
    _id: false,
  }],
  createdAt: { type: Date, default: Date.now },
});

const CourseProgressSchema = new mongoose.Schema({
  courseId: String,
  phone: String,
  completedSteps: [Number],
  completedAt: Date,
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Reward = mongoose.models.Reward || mongoose.model('Reward', RewardSchema);
export const News = mongoose.models.News || mongoose.model('News', NewsSchema);
export const Training = mongoose.models.Training || mongoose.model('Training', TrainingSchema);
export const TestResult = mongoose.models.TestResult || mongoose.model('TestResult', TestResultSchema);
export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
export const Survey = mongoose.models.Survey || mongoose.model('Survey', SurveySchema);
export const SurveyTemplate = mongoose.models.SurveyTemplate || mongoose.model('SurveyTemplate', SurveyTemplateSchema);
export const OfflineTraining = mongoose.models.OfflineTraining || mongoose.model('OfflineTraining', OfflineTrainingSchema);
export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export const CourseProgress = mongoose.models.CourseProgress || mongoose.model('CourseProgress', CourseProgressSchema);
