import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { User } from '../../../lib/models';

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).lean();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить пользователей' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, surname, username, phone, password, department, position, points = 0, role = 'employee' } = body;
    if (!name || !phone || !password || !department) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 });
    }
    const allUsers = await User.find({}).lean();
    const phoneExists = allUsers.some(u => normalizePhone(u.phone) === normalizePhone(phone));
    if (phoneExists) {
      return NextResponse.json({ error: 'Пользователь с таким номером уже зарегистрирован' }, { status: 400 });
    }
    if (username) {
      const usernameExists = allUsers.some(u => u.username && u.username.toLowerCase() === username.toLowerCase());
      if (usernameExists) {
        return NextResponse.json({ error: 'Этот логин уже занят' }, { status: 400 });
      }
    }
    await User.create({ name, surname: surname || '', username: username || '', phone, password, department, position: position || '', points: Number(points), role });
    return NextResponse.json({ message: 'Пользователь зарегистрирован' });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка регистрации' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, oldPhone, phone, name, surname, username, password, department, position, points, role, selfService } = body;
    if (!id && !oldPhone && !phone) {
      return NextResponse.json({ error: 'Не указан пользователь для обновления' }, { status: 400 });
    }
    const allUsers = await User.find({}).lean();
    const normalizedOldPhone = normalizePhone(oldPhone || phone);
    let current = null;
    if (id) {
      current = allUsers.find((u) => String(u._id) === String(id));
    }
    if (!current && normalizedOldPhone) {
      current = allUsers.find((u) => normalizePhone(u.phone) === normalizedOldPhone);
    }
    if (!current && username) {
      current = allUsers.find((u) => (u.username || '').toLowerCase() === String(username).toLowerCase());
    }
    if (!current) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    if (phone && normalizePhone(phone) !== normalizedOldPhone) {
      const dup = allUsers.find(u => normalizePhone(u.phone) === normalizePhone(phone));
      if (dup) return NextResponse.json({ error: 'Другой пользователь с таким номером уже существует' }, { status: 400 });
    }
    if (username) {
      const dup = allUsers.find(u => u.username && u.username.toLowerCase() === username.toLowerCase() && String(u._id) !== String(current._id));
      if (dup) return NextResponse.json({ error: 'Этот логин уже занят' }, { status: 400 });
    }
    const update = {};
    if (name !== undefined) update.name = name;
    if (surname !== undefined) update.surname = surname;
    if (username !== undefined) update.username = username;
    if (phone !== undefined) update.phone = phone;
    if (password) update.password = password;
    if (!selfService) {
      if (department !== undefined) update.department = department;
      if (position !== undefined) update.position = position;
      if (points !== undefined) update.points = Number(points);
      if (role !== undefined) update.role = role;
    }
    if (selfService) {
      if (typeof department === 'string') update.department = department;
      if (typeof position === 'string') update.position = position;
    }
    await User.updateOne({ _id: current._id }, { $set: update });
    return NextResponse.json({ message: 'Пользователь обновлен' });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления пользователя' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { phone } = body;
    if (!phone) return NextResponse.json({ error: 'Не указан телефон для удаления' }, { status: 400 });
    const result = await User.deleteOne({ phone: { $regex: normalizePhone(phone) } });
    if (result.deletedCount === 0) {
      // fallback: find by normalized
      const allUsers = await User.find({}).lean();
      const found = allUsers.find(u => normalizePhone(u.phone) === normalizePhone(phone));
      if (!found) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
      await User.deleteOne({ _id: found._id });
    }
    return NextResponse.json({ message: 'Пользователь удален' });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления пользователя' }, { status: 500 });
  }
}
