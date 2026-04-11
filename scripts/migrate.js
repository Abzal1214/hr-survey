// Скрипт для переноса данных из JSON файлов в MongoDB
// Запустить один раз: node scripts/migrate.js

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const MONGODB_URI = 'mongodb+srv://saylaubayvip007_db_user:Abzal2005@cluster0.yt02qmd.mongodb.net/hr_survey?appName=Cluster0';

const UserSchema = new mongoose.Schema({ name: String, phone: String, password: String, department: String, workplaceType: String, position: String, points: Number, role: String, registeredAt: Date }, { strict: false });
const RewardSchema = new mongoose.Schema({ name: String, description: String, cost: Number, createdAt: Date });
const NewsSchema = new mongoose.Schema({ title: String, description: String, imageUrl: String, createdAt: Date });
const TrainingSchema = new mongoose.Schema({ title: String, description: String, fileUrl: String, createdAt: Date }, { strict: false });

const User = mongoose.model('User', UserSchema);
const Reward = mongoose.model('Reward', RewardSchema);
const News = mongoose.model('News', NewsSchema);
const Training = mongoose.model('Training', TrainingSchema);

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('Подключение к MongoDB успешно');

  // Users
  const usersFile = path.join(root, 'users.json');
  if (fs.existsSync(usersFile)) {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    for (const u of users) {
      const exists = await User.findOne({ phone: u.phone });
      if (!exists) await User.create(u);
    }
    console.log(`✓ Пользователи перенесены (${users.length})`);
  }

  // Rewards
  const rewardsFile = path.join(root, 'rewards.json');
  if (fs.existsSync(rewardsFile)) {
    const rewards = JSON.parse(fs.readFileSync(rewardsFile, 'utf8'));
    const count = await Reward.countDocuments();
    if (count === 0) await Reward.insertMany(rewards.map(r => ({ name: r.name, description: r.description, cost: r.cost, createdAt: r.createdAt })));
    console.log(`✓ Награды перенесены (${rewards.length})`);
  }

  // News
  const newsFile = path.join(root, 'news.json');
  if (fs.existsSync(newsFile)) {
    const news = JSON.parse(fs.readFileSync(newsFile, 'utf8'));
    const count = await News.countDocuments();
    if (count === 0) await News.insertMany(news.map(n => ({ title: n.title, description: n.description, imageUrl: n.imageUrl || '', createdAt: n.timestamp || n.createdAt || new Date() })));
    console.log(`✓ Новости перенесены (${news.length})`);
  }

  // Trainings
  const trainingsFile = path.join(root, 'trainings.json');
  if (fs.existsSync(trainingsFile)) {
    const trainings = JSON.parse(fs.readFileSync(trainingsFile, 'utf8'));
    const count = await Training.countDocuments();
    if (count === 0) await Training.insertMany(trainings.map(t => ({ title: t.title, description: t.description, fileUrl: (t.attachments || []).join(','), createdAt: t.timestamp || new Date() })));
    console.log(`✓ Тренинги перенесены (${trainings.length})`);
  }

  console.log('\n✅ Миграция завершена!');
  await mongoose.disconnect();
}

migrate().catch(err => { console.error('Ошибка миграции:', err); process.exit(1); });
