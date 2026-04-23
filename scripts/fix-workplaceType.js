// Скрипт для массового обновления workplaceType у сотрудников
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../lib/models.js';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({});
  for (const user of users) {
    let newType = user.workplaceType;
    if (user.department === 'Аквапарк') newType = 'Hawaii&Miami';
    if (user.department === 'Офис') newType = 'SanRemo';
    if (newType) {
      user.workplaceType = newType;
      await user.save();
      console.log(`Обновлён: ${user.name} (${user.department}) → ${user.workplaceType}`);
    }
  }
  await mongoose.disconnect();
  console.log('Готово!');
}

main().catch(e => { console.error(e); process.exit(1); });
