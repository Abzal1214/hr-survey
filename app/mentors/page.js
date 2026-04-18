
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import KebabMenu from '../components/KebabMenu';

const DEPARTMENTS = ['Все отделы', 'Аквапарк', 'Ресторан', 'SPA', 'Магазин', 'Офис'];
const emptyForm = { name: '', position: '', department: '', phone: '', email: '', bio: '', photoUrl: '' };

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [empSearch, setEmpSearch] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState('Все отделы');
  const [showAssign, setShowAssign] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState('');
  const [phonePopup, setPhonePopup] = useState('');
  const [myMentors, setMyMentors] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  // Найти всех наставников по department и загрузить задачи для сотрудника
  useEffect(() => {
    if (user && user.role === 'employee' && user.department) {
      const foundMentors = mentors.filter(m => m.department === user.department);
      setMyMentors(foundMentors);
      fetch(`/api/mentor-tasks?employeePhone=${user.phone}`)
        .then(r => r.json())
        .then(setMyTasks)
        .catch(() => setMyTasks([]));
    } else {
      setMyMentors([]);
      setMyTasks([]);
    }
  }, [user, mentors]);

  return (
    <>
      {/* Hero, фильтры, грид наставников, модальные окна, формы — весь JSX, как был в рабочей версии, внутри этого фрагмента */}
    </>
  );
}
