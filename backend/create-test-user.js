require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gezsekk');
    console.log('MongoDB bağlantısı başarılı');

    // Admin kullanıcı oluştur
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      email: 'admin@gezsektravel.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      phone: '5551234567',
      birthDate: new Date('1990-01-15'),
      gender: 'erkek',
      verified: true,
      isAdmin: true
    });

    console.log('Admin kullanıcısı oluşturuldu:', admin.email);

    // Normal kullanıcı oluştur
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await User.create({
      email: 'user@gezsektravel.com',
      passwordHash: userPassword,
      name: 'Test User',
      phone: '5559876543',
      birthDate: new Date('1995-06-20'),
      gender: 'kadın',
      verified: true
    });

    console.log('Normal kullanıcı oluşturuldu:', user.email);
    console.log('\nTest Kullanıcıları:');
    console.log('Admin: admin@gezsektravel.com / admin123');
    console.log('User: user@gezsektravel.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
};

createTestUser(); 