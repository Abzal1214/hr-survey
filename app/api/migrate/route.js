import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { User, Reward, News, Training } from '../../../lib/models';

// Данные для миграции (из JSON файлов)
const usersData = [
  {
    "name": "Абзал",
    "phone": "admin",
    "password": "password123",
    "workplaceType": "restaurant",
    "department": "Ресторан",
    "position": "раннер",
    "points": 0,
    "role": "employee"
  },
  {
    "name": "GUl",
    "phone": "GULFAIRUZ",
    "password": "132456QS",
    "workplaceType": "restaurant",
    "department": "Ресторан",
    "position": "бармен",
    "points": 5,
    "role": "employee"
  }
];

const rewardsData = [
  { name: "Кофе", description: "Кофе с Феличита", cost: 10 },
  { name: "Футболка", description: "Брендированная футболка Hawaii&Miami", cost: 50 },
  { name: "Кружка", description: "Керамическая кружка с логотипом", cost: 30 },
];

const newsData = [
  {
    title: "Открытие летнего сезона 2026!",
    description: "Рады сообщить об открытии летнего сезона в аквапарках Hawaii&Miami и SanRemo. Ждём вас и наших гостей!",
    imageUrl: "",
  }
];

const trainingsData = [
  {
    title: "1",
    description: "для сотрудников",
    fileUrl: "/uploads/1775647974001-_.docx",
  }
];

export async function GET(request) {
  // Защита: только при наличии секретного ключа
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'migrate2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const results = {};

    // Users
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      await User.insertMany(usersData);
      results.users = `Добавлено ${usersData.length} пользователей`;
    } else {
      results.users = `Пропущено — уже есть ${existingUsers} пользователей`;
    }

    // Rewards
    const existingRewards = await Reward.countDocuments();
    if (existingRewards === 0) {
      await Reward.insertMany(rewardsData);
      results.rewards = `Добавлено ${rewardsData.length} наград`;
    } else {
      results.rewards = `Пропущено — уже есть ${existingRewards} наград`;
    }

    // News
    const existingNews = await News.countDocuments();
    if (existingNews === 0) {
      await News.insertMany(newsData);
      results.news = `Добавлено ${newsData.length} новостей`;
    } else {
      results.news = `Пропущено — уже есть ${existingNews} новостей`;
    }

    // Trainings
    const existingTrainings = await Training.countDocuments();
    if (existingTrainings === 0) {
      await Training.insertMany(trainingsData);
      results.trainings = `Добавлено ${trainingsData.length} тренингов`;
    } else {
      results.trainings = `Пропущено — уже есть ${existingTrainings} тренингов`;
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
