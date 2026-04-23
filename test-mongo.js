const mongoose = require('mongoose');
const uri = 'mongodb+srv://Abzal:Hawaii2026@cluster0.hwwhnre.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => { console.log('✅ Соединение с MongoDB установлено!'); process.exit(0); })
  .catch(err => { console.error('❌ Ошибка соединения:', err.message); process.exit(1); });
