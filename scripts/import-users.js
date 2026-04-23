// Скрипт для импорта пользователей из users.json в MongoDB
// Запускать: node scripts/import-users.js

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../lib/models.js';

import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI не найден в .env');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const usersPath = path.resolve(process.cwd(), 'users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

  for (const user of users) {
    // Не импортировать, если уже есть такой телефон
    const exists = await User.findOne({ phone: user.phone });
    if (exists) {
      console.log(`Пользователь с телефоном ${user.phone} уже есть, пропускаю.`);
      continue;
    }
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await User.create({
      ...user,
      password: hashedPassword,
      department: user.department || '',
      role: user.role || 'employee',
      registeredAt: user.registeredAt ? new Date(user.registeredAt) : new Date(),
    });
    console.log(`Импортирован: ${user.name} (${user.phone})`);
  }
  await mongoose.disconnect();
  console.log('Импорт завершён.');
}

main().catch(e => { console.error(e); process.exit(1); });
