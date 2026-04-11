import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
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
  score: Number,
  answers: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

const SurveySchema = new mongoose.Schema({
  name: String,
  phone: String,
  surveyType: String,
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

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Reward = mongoose.models.Reward || mongoose.model('Reward', RewardSchema);
export const News = mongoose.models.News || mongoose.model('News', NewsSchema);
export const Training = mongoose.models.Training || mongoose.model('Training', TrainingSchema);
export const TestResult = mongoose.models.TestResult || mongoose.model('TestResult', TestResultSchema);
export const Survey = mongoose.models.Survey || mongoose.model('Survey', SurveySchema);
