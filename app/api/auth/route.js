import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { User } from '../../../lib/models';
import bcrypt from 'bcryptjs';

const normalizePhone = (v) => String(v || '').replace(/\D/g, '');

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { username, password, department } = body;

    if (!username || !password || !department) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    const enteredPhone = normalizePhone(username);
    const allUsers = await User.find({}).lean();

    const user = allUsers.find((u) => {
      const phoneMatch = enteredPhone && normalizePhone(u.phone) === enteredPhone;
      const usernameMatch = u.username && u.username.toLowerCase() === username.trim().toLowerCase();
      const deptMatch = (u.department || u.workplaceType || '').toLowerCase() === department.toLowerCase();
      return (phoneMatch || usernameMatch) && deptMatch;
    });

    if (!user) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
    }

    // Support both bcrypt hashes and legacy plain-text passwords
    const storedPwd = String(user.password || '');
    const isHashed = storedPwd.startsWith('$2');
    let match = false;
    if (isHashed) {
      match = await bcrypt.compare(password, storedPwd);
    } else {
      match = storedPwd === password;
      if (match) {
        // Migrate legacy plain-text password to bcrypt hash on login
        const hash = await bcrypt.hash(password, 10);
        await User.updateOne({ _id: user._id }, { $set: { password: hash } });
      }
    }

    if (!match) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
    }

    // Return user WITHOUT password field
    const { password: _pwd, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка входа' }, { status: 500 });
  }
}
